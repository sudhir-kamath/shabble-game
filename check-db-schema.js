const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking game_sessions table schema...');

db.all('PRAGMA table_info(game_sessions)', (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }
    
    console.log('\nColumns in game_sessions table:');
    rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
    });
    
    const hasFirstAttemptScore = rows.some(row => row.name === 'first_attempt_score');
    console.log(`\nfirst_attempt_score column exists: ${hasFirstAttemptScore}`);
    
    if (!hasFirstAttemptScore) {
        console.log('\nAdding first_attempt_score column...');
        db.run('ALTER TABLE game_sessions ADD COLUMN first_attempt_score INTEGER DEFAULT 0', (err) => {
            if (err) {
                console.error('Error adding column:', err.message);
            } else {
                console.log('Column added successfully!');
            }
            db.close();
        });
    } else {
        db.close();
    }
});
