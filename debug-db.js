const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking analytics database...');

// Check if tables exist
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
        console.error('Error getting tables:', err);
        return;
    }
    
    console.log('\nTables in database:', tables.map(t => t.name));
    
    // Check users table
    db.all("SELECT COUNT(*) as count FROM users", (err, result) => {
        if (err) {
            console.error('Error checking users:', err);
        } else {
            console.log(`Users table: ${result[0].count} records`);
        }
        
        // Check game_sessions table
        db.all("SELECT COUNT(*) as count FROM game_sessions", (err, result) => {
            if (err) {
                console.error('Error checking game_sessions:', err);
            } else {
                console.log(`Game sessions table: ${result[0].count} records`);
            }
            
            // Check alphagram_attempts table
            db.all("SELECT COUNT(*) as count FROM alphagram_attempts", (err, result) => {
                if (err) {
                    console.error('Error checking alphagram_attempts:', err);
                } else {
                    console.log(`Alphagram attempts table: ${result[0].count} records`);
                }
                
                // Show recent sessions if any
                db.all("SELECT * FROM game_sessions ORDER BY session_start DESC LIMIT 5", (err, sessions) => {
                    if (err) {
                        console.error('Error getting recent sessions:', err);
                    } else {
                        console.log('\nRecent sessions:');
                        console.log(sessions);
                    }
                    
                    // Show user data
                    db.all("SELECT * FROM users", (err, users) => {
                        if (err) {
                            console.error('Error getting users:', err);
                        } else {
                            console.log('\nUsers:');
                            console.log(users);
                        }
                        
                        // Update the user with Firebase UID to use actual email
                        db.run(`UPDATE users SET email = ? WHERE firebase_uid = ?`, 
                            [null, '1RPUeP94HiguABdJrtPeVOyvGTb2'], 
                            function(err) {
                                if (err) {
                                    console.error('Error updating user email:', err);
                                } else {
                                    console.log('\nCleared hardcoded email for Firebase user. The system will now use the actual Firebase email.');
                                }
                                db.close();
                            }
                        );
                    });
                });
            });
        });
    });
});
