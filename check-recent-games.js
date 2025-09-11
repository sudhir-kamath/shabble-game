const AnalyticsDB = require('./data/analytics-db.js');

const analyticsDB = new AnalyticsDB();

console.log('Checking recent game sessions data...\n');

// Get the most recent 10 game sessions
analyticsDB.db.all(`
    SELECT 
        gs.id,
        gs.session_start,
        gs.session_end,
        gs.total_alphagrams,
        gs.alphagrams_solved,
        gs.final_score,
        gs.completed,
        gs.game_duration,
        u.nickname,
        u.firebase_uid
    FROM game_sessions gs
    LEFT JOIN users u ON gs.user_id = u.id
    ORDER BY gs.session_start DESC
    LIMIT 10
`, (err, sessions) => {
    if (err) {
        console.error('Error getting sessions:', err);
        analyticsDB.db.close();
        return;
    }

    console.log('Recent game sessions:');
    console.log('='.repeat(80));
    
    sessions.forEach((session, index) => {
        console.log(`${index + 1}. Session ID: ${session.id}`);
        console.log(`   Player: ${session.nickname || 'Unknown'} (${session.firebase_uid || 'No UID'})`);
        console.log(`   Start: ${session.session_start}`);
        console.log(`   End: ${session.session_end || 'NULL'}`);
        console.log(`   Score: ${session.final_score || 0}`);
        console.log(`   Solved: ${session.alphagrams_solved || 0}/${session.total_alphagrams || 0}`);
        console.log(`   Completed: ${session.completed} (${session.completed === 1 ? 'YES' : 'NO'})`);
        console.log(`   Duration: ${session.game_duration || 0} seconds`);
        console.log('-'.repeat(40));
    });

    analyticsDB.db.close();
});
