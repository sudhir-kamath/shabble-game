const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking session linking between users, sessions, and attempts...');

// First find the user
db.all('SELECT id, firebase_uid, nickname FROM users', (err, users) => {
    if (err) {
        console.error('Error getting users:', err);
        db.close();
        return;
    }
    
    console.log('Available users:');
    users.forEach(user => {
        console.log(`  ID: ${user.id}, Firebase UID: ${user.firebase_uid}, Nickname: ${user.nickname}`);
    });
    
    if (users.length === 0) {
        console.log('No users found');
        db.close();
        return;
    }
    
    const userId = users[0].id; // Use first user
    console.log(`\nChecking data for user ID: ${userId}`);
    
    // Check sessions for this user
    db.all(`
        SELECT id, session_start, session_end, user_id, final_score
        FROM game_sessions 
        WHERE user_id = ?
        ORDER BY session_start DESC
        LIMIT 5
    `, [userId], (err, sessions) => {
        if (err) {
            console.error('Error getting user sessions:', err);
        } else {
            console.log(`\nSessions for user ${userId}:`);
            if (sessions.length === 0) {
                console.log('No sessions found for this user');
            } else {
                sessions.forEach(session => {
                    console.log(`  Session: ${session.id}, Score: ${session.final_score}, Start: ${session.session_start}`);
                });
            }
        }
        
        // Check attempts linked to these sessions
        db.all(`
            SELECT 
                aa.id, aa.session_id, aa.alphagram, aa.word_length, 
                aa.solved, aa.first_attempt_correct, aa.second_attempt_correct,
                gs.user_id
            FROM alphagram_attempts aa
            JOIN game_sessions gs ON aa.session_id = gs.id
            WHERE gs.user_id = ?
            ORDER BY aa.id DESC
            LIMIT 10
        `, [userId], (err, attempts) => {
            if (err) {
                console.error('Error getting user attempts:', err);
            } else {
                console.log(`\nAttempts for user ${userId}:`);
                if (attempts.length === 0) {
                    console.log('No attempts found for this user');
                } else {
                    attempts.forEach(attempt => {
                        console.log(`  Attempt ${attempt.id}: ${attempt.alphagram} (length: ${attempt.word_length})`);
                        console.log(`    Session: ${attempt.session_id}, Solved: ${attempt.solved}, First: ${attempt.first_attempt_correct}, Second: ${attempt.second_attempt_correct}`);
                    });
                }
            }
            
            // Now run the exact word length accuracy query
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
            `, [userId], (err, wordStats) => {
                if (err) {
                    console.error('Error getting word length stats:', err);
                } else {
                    console.log(`\nWord length accuracy for user ${userId}:`);
                    if (wordStats.length === 0) {
                        console.log('No word length stats found');
                    } else {
                        wordStats.forEach(stat => {
                            const accuracy = stat.total_attempts > 0 ? (stat.correct_attempts / stat.total_attempts * 100).toFixed(1) : 0;
                            console.log(`  Length ${stat.word_length}: ${stat.correct_attempts}/${stat.total_attempts} (${accuracy}%)`);
                        });
                    }
                }
                
                db.close();
            });
        });
    });
});
