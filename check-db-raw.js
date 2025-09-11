const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking raw database data...\n');

// Get the most recent 5 game sessions with raw data
db.all(`
    SELECT 
        id,
        session_start,
        session_end,
        total_alphagrams,
        alphagrams_solved,
        final_score,
        completed,
        game_duration,
        user_id
    FROM game_sessions 
    ORDER BY session_start DESC 
    LIMIT 5
`, (err, sessions) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }

    console.log('Most recent 5 game sessions:');
    console.log('=' .repeat(60));
    
    sessions.forEach((session, i) => {
        console.log(`${i+1}. ID: ${session.id}`);
        console.log(`   Start: ${session.session_start}`);
        console.log(`   End: ${session.session_end}`);
        console.log(`   Score: ${session.final_score}`);
        console.log(`   Solved: ${session.alphagrams_solved}/${session.total_alphagrams}`);
        console.log(`   Completed: ${session.completed} (raw value)`);
        console.log(`   Duration: ${session.game_duration} seconds`);
        console.log(`   User ID: ${session.user_id}`);
        console.log('   ---');
    });

    db.close();
});
