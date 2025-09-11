const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking first_attempt_score values in recent games...');

db.all(`
    SELECT 
        id, 
        session_start, 
        final_score, 
        first_attempt_score 
    FROM game_sessions 
    ORDER BY session_start DESC 
    LIMIT 10
`, (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }
    
    console.log('\nRecent games:');
    rows.forEach(row => {
        console.log(`ID: ${row.id}, Start: ${row.session_start}, Final: ${row.final_score}, First: ${row.first_attempt_score}`);
    });
    
    const hasNonZeroFirst = rows.some(row => row.first_attempt_score > 0);
    console.log(`\nAny games with non-zero first_attempt_score: ${hasNonZeroFirst}`);
    
    db.close();
});
