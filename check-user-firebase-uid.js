const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking user Firebase UID mapping...');

// Check all users and their Firebase UIDs
db.all('SELECT id, firebase_uid, nickname, email FROM users', (err, users) => {
    if (err) {
        console.error('Error getting users:', err);
        db.close();
        return;
    }
    
    console.log('All users in database:');
    users.forEach(user => {
        console.log(`  ID: ${user.id}, Firebase UID: ${user.firebase_uid}, Nickname: ${user.nickname}, Email: ${user.email}`);
    });
    
    // Check game sessions and their user_id values
    db.all('SELECT id, user_id, session_start FROM game_sessions ORDER BY session_start DESC LIMIT 10', (err, sessions) => {
        if (err) {
            console.error('Error getting sessions:', err);
        } else {
            console.log('\nRecent game sessions:');
            sessions.forEach(session => {
                console.log(`  Session: ${session.id}, User ID: ${session.user_id}, Start: ${session.session_start}`);
            });
        }
        
        // Count sessions with null user_id
        db.get('SELECT COUNT(*) as count FROM game_sessions WHERE user_id IS NULL', (err, result) => {
            if (err) {
                console.error('Error counting null user sessions:', err);
            } else {
                console.log(`\nSessions with null user_id: ${result.count}`);
            }
            
            // Count sessions with valid user_id
            db.get('SELECT COUNT(*) as count FROM game_sessions WHERE user_id IS NOT NULL', (err, result) => {
                if (err) {
                    console.error('Error counting valid user sessions:', err);
                } else {
                    console.log(`Sessions with valid user_id: ${result.count}`);
                }
                
                db.close();
            });
        });
    });
});
