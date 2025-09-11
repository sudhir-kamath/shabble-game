const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking session ID mismatches...');

// Get all session IDs from game_sessions
db.all('SELECT id FROM game_sessions ORDER BY session_start DESC LIMIT 10', (err, sessions) => {
    if (err) {
        console.error('Error getting session IDs:', err);
        db.close();
        return;
    }
    
    console.log('Session IDs in game_sessions table:');
    const sessionIds = sessions.map(s => s.id);
    sessionIds.forEach(id => console.log(`  ${id}`));
    
    // Get all session IDs from alphagram_attempts
    db.all('SELECT DISTINCT session_id FROM alphagram_attempts ORDER BY id DESC LIMIT 10', (err, attemptSessions) => {
        if (err) {
            console.error('Error getting attempt session IDs:', err);
            db.close();
            return;
        }
        
        console.log('\nSession IDs in alphagram_attempts table:');
        const attemptSessionIds = attemptSessions.map(s => s.session_id);
        attemptSessionIds.forEach(id => console.log(`  ${id}`));
        
        // Check for matches
        console.log('\nMatching session IDs:');
        const matches = sessionIds.filter(id => attemptSessionIds.includes(id));
        if (matches.length === 0) {
            console.log('NO MATCHING SESSION IDs FOUND - This is the problem!');
        } else {
            matches.forEach(id => console.log(`  ${id}`));
        }
        
        // Show some sample attempts with their session IDs
        db.all(`
            SELECT id, session_id, alphagram, word_length 
            FROM alphagram_attempts 
            ORDER BY id DESC 
            LIMIT 5
        `, (err, samples) => {
            if (err) {
                console.error('Error getting sample attempts:', err);
            } else {
                console.log('\nSample alphagram attempts:');
                samples.forEach(attempt => {
                    console.log(`  Attempt ${attempt.id}: session_id = ${attempt.session_id}, alphagram = ${attempt.alphagram}`);
                });
            }
            
            db.close();
        });
    });
});
