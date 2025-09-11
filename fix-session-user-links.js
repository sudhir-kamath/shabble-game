const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Fixing session-user links...');

// First, get the user ID (assuming there's only one user)
db.get('SELECT id, firebase_uid FROM users LIMIT 1', (err, user) => {
    if (err) {
        console.error('Error getting user:', err);
        db.close();
        return;
    }
    
    if (!user) {
        console.log('No user found in database');
        db.close();
        return;
    }
    
    console.log(`Found user: ID ${user.id}, Firebase UID: ${user.firebase_uid}`);
    
    // Update all sessions with null user_id to use this user's ID
    db.run('UPDATE game_sessions SET user_id = ? WHERE user_id IS NULL', [user.id], function(err) {
        if (err) {
            console.error('Error updating sessions:', err);
        } else {
            console.log(`Updated ${this.changes} sessions to use user ID ${user.id}`);
        }
        
        // Verify the fix worked
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
        `, [user.id], (err, wordStats) => {
            if (err) {
                console.error('Error getting word length stats after fix:', err);
            } else {
                console.log('\nWord length accuracy after fix:');
                if (wordStats.length === 0) {
                    console.log('Still no word length stats found - there may be other issues');
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
