/**
 * Check mastery carpet data for user madhav2010kamath@gmail.com
 */

const AnalyticsDB = require('./data/analytics-db');

async function checkMadhavData() {
    console.log('Checking mastery data for madhav2010kamath@gmail.com...');
    
    const db = new AnalyticsDB();
    
    // Hash the email to get the user ID (this should be the Firebase UID, not email)
    // Let's check if this user exists by looking at the users table first
    
    return new Promise((resolve, reject) => {
        // First, let's see all users to find the right identifier
        db.db.all(`SELECT id, firebase_uid, email, total_games FROM users WHERE email LIKE '%madhav%' OR firebase_uid LIKE '%madhav%'`, [], (err, users) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log('Found users matching madhav:', users.length);
            users.forEach(user => {
                console.log(`User: ${user.email || 'no email'}, Firebase UID: ${user.firebase_uid || 'no uid'}, Games: ${user.total_games}`);
            });
            
            if (users.length === 0) {
                console.log('No users found matching madhav');
                resolve();
                return;
            }
            
            // Use the first matching user's hashed ID
            const userId = users[0].id;
            console.log('Using user ID:', userId);
            
            // Now check their alphagram stats
            db.db.all(`SELECT alphagram, word_length, total_attempts, correct_attempts, mastery_score 
                      FROM player_alphagram_stats WHERE user_id = ? ORDER BY word_length, alphagram`, 
                      [userId], (err, stats) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                console.log(`Total alphagram records: ${stats.length}`);
                
                // Check by word length
                for (let length = 2; length <= 5; length++) {
                    const lengthData = stats.filter(a => a.word_length == length);
                    const withAttempts = lengthData.filter(a => a.total_attempts > 0);
                    const withMastery = lengthData.filter(a => a.mastery_score !== 0);
                    
                    console.log(`${length}-letter words:`);
                    console.log(`  - Records: ${lengthData.length}`);
                    console.log(`  - With attempts: ${withAttempts.length}`);
                    console.log(`  - With mastery scores: ${withMastery.length}`);
                    
                    if (withMastery.length > 0) {
                        console.log(`  - Sample mastery scores:`, withMastery.slice(0, 3).map(a => 
                            `${a.alphagram}:${a.mastery_score}`
                        ));
                    }
                }
                
                // Show some sample records
                if (stats.length > 0) {
                    console.log('\nSample records:');
                    stats.slice(0, 5).forEach(record => {
                        console.log(`${record.alphagram} (${record.word_length}L): attempts=${record.total_attempts}, correct=${record.correct_attempts}, mastery=${record.mastery_score}`);
                    });
                }
                
                resolve();
            });
        });
    });
}

checkMadhavData();
