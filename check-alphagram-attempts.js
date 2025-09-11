const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking alphagram attempts...');

// Check alphagram_attempts table
db.all("SELECT COUNT(*) as count FROM alphagram_attempts", (err, result) => {
    if (err) {
        console.error('Error checking alphagram_attempts:', err);
    } else {
        console.log(`Total alphagram attempts: ${result[0].count}`);
    }
    
    // Show all attempts if any exist
    db.all("SELECT * FROM alphagram_attempts ORDER BY id DESC LIMIT 10", (err, attempts) => {
        if (err) {
            console.error('Error getting attempts:', err);
        } else {
            console.log('\nRecent alphagram attempts:');
            if (attempts.length === 0) {
                console.log('No alphagram attempts found in database');
            } else {
                attempts.forEach(attempt => {
                    console.log(`ID: ${attempt.id}, Session: ${attempt.session_id}`);
                    console.log(`  Alphagram: ${attempt.alphagram}, Word Length: ${attempt.word_length}`);
                    console.log(`  Solved: ${attempt.solved}, First Correct: ${attempt.first_attempt_correct}, Second Correct: ${attempt.second_attempt_correct}`);
                    console.log(`  User Answers: ${attempt.user_answers}`);
                    console.log(`  Correct Answers: ${attempt.correct_answers}`);
                    console.log('---');
                });
            }
        }
        
        // Check game sessions
        db.all("SELECT COUNT(*) as count FROM game_sessions", (err, result) => {
            if (err) {
                console.error('Error checking game_sessions:', err);
            } else {
                console.log(`\nTotal game sessions: ${result[0].count}`);
            }
            
            // Show recent sessions
            db.all("SELECT * FROM game_sessions ORDER BY session_start DESC LIMIT 5", (err, sessions) => {
                if (err) {
                    console.error('Error getting sessions:', err);
                } else {
                    console.log('\nRecent game sessions:');
                    sessions.forEach(session => {
                        console.log(`Session ID: ${session.id}`);
                        console.log(`  User ID: ${session.user_id}, Start: ${session.session_start}`);
                        console.log(`  Score: ${session.final_score}, Completed: ${session.completed}`);
                        console.log('---');
                    });
                }
                
                db.close();
            });
        });
    });
});
