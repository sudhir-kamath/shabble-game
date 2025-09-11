const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Verifying the fix worked...');

// Get the user
db.get('SELECT id FROM users LIMIT 1', (err, user) => {
    if (err) {
        console.error('Error getting user:', err);
        db.close();
        return;
    }
    
    console.log(`Checking data for user ID: ${user.id}`);
    
    // Count sessions for this user
    db.get('SELECT COUNT(*) as count FROM game_sessions WHERE user_id = ?', [user.id], (err, result) => {
        if (err) {
            console.error('Error counting user sessions:', err);
        } else {
            console.log(`User sessions: ${result.count}`);
        }
        
        // Get session IDs for this user
        db.all('SELECT id FROM game_sessions WHERE user_id = ? LIMIT 5', [user.id], (err, sessions) => {
            if (err) {
                console.error('Error getting user session IDs:', err);
            } else {
                console.log('User session IDs:');
                const sessionIds = sessions.map(s => s.id);
                sessionIds.forEach(id => console.log(`  ${id}`));
                
                // Check if any attempts match these session IDs
                if (sessionIds.length > 0) {
                    const placeholders = sessionIds.map(() => '?').join(',');
                    db.all(`SELECT COUNT(*) as count FROM alphagram_attempts WHERE session_id IN (${placeholders})`, sessionIds, (err, result) => {
                        if (err) {
                            console.error('Error counting matching attempts:', err);
                        } else {
                            console.log(`Alphagram attempts matching user sessions: ${result[0].count}`);
                        }
                        
                        // If there are matches, show the word length breakdown
                        if (result[0].count > 0) {
                            db.all(`
                                SELECT 
                                    word_length,
                                    COUNT(*) as total_attempts,
                                    SUM(CASE WHEN first_attempt_correct = 1 OR second_attempt_correct = 1 THEN 1 ELSE 0 END) as correct_attempts
                                FROM alphagram_attempts 
                                WHERE session_id IN (${placeholders})
                                GROUP BY word_length
                                ORDER BY word_length
                            `, sessionIds, (err, wordStats) => {
                                if (err) {
                                    console.error('Error getting word stats:', err);
                                } else {
                                    console.log('\nWord length breakdown:');
                                    wordStats.forEach(stat => {
                                        const accuracy = stat.total_attempts > 0 ? (stat.correct_attempts / stat.total_attempts * 100).toFixed(1) : 0;
                                        console.log(`  Length ${stat.word_length}: ${stat.correct_attempts}/${stat.total_attempts} (${accuracy}%)`);
                                    });
                                }
                                
                                db.close();
                            });
                        } else {
                            console.log('No alphagram attempts match the user sessions - this is still the problem');
                            db.close();
                        }
                    });
                } else {
                    console.log('No sessions found for user');
                    db.close();
                }
            }
        });
    });
});
