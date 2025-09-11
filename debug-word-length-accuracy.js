const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Debugging word length accuracy calculation...');

// First, let's see what data we have in alphagram_attempts
db.all(`
    SELECT 
        word_length,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN first_attempt_correct = 1 THEN 1 ELSE 0 END) as first_correct,
        SUM(CASE WHEN second_attempt_correct = 1 THEN 1 ELSE 0 END) as second_correct,
        SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as total_solved
    FROM alphagram_attempts 
    GROUP BY word_length
    ORDER BY word_length
`, (err, results) => {
    if (err) {
        console.error('Error getting word length breakdown:', err);
    } else {
        console.log('\nWord length breakdown from alphagram_attempts:');
        results.forEach(row => {
            const accuracy = row.total_attempts > 0 ? (row.total_solved / row.total_attempts * 100).toFixed(1) : 0;
            console.log(`Length ${row.word_length}: ${row.total_solved}/${row.total_attempts} solved (${accuracy}%)`);
            console.log(`  First correct: ${row.first_correct}, Second correct: ${row.second_correct}`);
        });
    }
    
    // Now let's check what the actual query from getUserStats returns
    const firebaseUid = '1RPUeP94HiguABdJrtPeVOyvGTb2'; // Replace with actual UID if different
    
    db.get(`SELECT id FROM users WHERE firebase_uid = ?`, [firebaseUid], (err, user) => {
        if (err) {
            console.error('Error finding user:', err);
            db.close();
            return;
        }
        
        if (!user) {
            console.log('\nNo user found with that Firebase UID');
            db.all('SELECT firebase_uid, id, nickname FROM users', (err, users) => {
                console.log('Available users:', users);
                db.close();
            });
            return;
        }
        
        console.log(`\nFound user ID: ${user.id} for Firebase UID: ${firebaseUid}`);
        
        // Run the exact query from getUserStats
        db.all(`
            SELECT 
                aa.word_length,
                COUNT(*) as total_attempts,
                SUM(CASE WHEN aa.first_attempt_correct = 1 OR aa.second_attempt_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
            FROM alphagram_attempts aa
            JOIN game_sessions gs ON aa.session_id = gs.id
            WHERE gs.user_id = ?
            GROUP BY aa.word_length
            ORDER BY aa.word_length
        `, [user.id], (err, wordLengthStats) => {
            if (err) {
                console.error('Error getting user word length stats:', err);
            } else {
                console.log('\nUser-specific word length stats (from getUserStats query):');
                if (wordLengthStats.length === 0) {
                    console.log('No word length stats found for this user');
                } else {
                    wordLengthStats.forEach(stat => {
                        const accuracy = stat.total_attempts > 0 ? (stat.correct_attempts / stat.total_attempts * 100).toFixed(1) : 0;
                        console.log(`Length ${stat.word_length}: ${stat.correct_attempts}/${stat.total_attempts} correct (${accuracy}%)`);
                    });
                }
            }
            
            // Also check which sessions belong to this user
            db.all(`
                SELECT gs.id, gs.session_start, COUNT(aa.id) as attempt_count
                FROM game_sessions gs
                LEFT JOIN alphagram_attempts aa ON gs.id = aa.session_id
                WHERE gs.user_id = ?
                GROUP BY gs.id
                ORDER BY gs.session_start DESC
                LIMIT 10
            `, [user.id], (err, userSessions) => {
                if (err) {
                    console.error('Error getting user sessions:', err);
                } else {
                    console.log('\nUser sessions with attempt counts:');
                    userSessions.forEach(session => {
                        console.log(`Session ${session.id}: ${session.attempt_count} attempts (${session.session_start})`);
                    });
                }
                
                db.close();
            });
        });
    });
});
