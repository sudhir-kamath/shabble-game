/**
 * Script to recalculate mastery scores from existing game history
 * This will populate the mastery_score column for all existing player_alphagram_stats
 */

const AnalyticsDB = require('./data/analytics-db');

async function recalculateMasteryScores() {
    console.log('Starting mastery score recalculation...');
    
    const db = new AnalyticsDB();
    
    return new Promise((resolve, reject) => {
        // Get all player alphagram stats that need mastery score calculation
        db.db.all(`
            SELECT user_id, alphagram, total_attempts, correct_attempts, mastery_score
            FROM player_alphagram_stats 
            ORDER BY user_id, alphagram
        `, [], (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`Found ${rows.length} alphagram records to process`);
            
            let processed = 0;
            let updated = 0;
            
            const updatePromises = rows.map(row => {
                return new Promise((resolveUpdate, rejectUpdate) => {
                    const { user_id, alphagram, total_attempts, correct_attempts, mastery_score } = row;
                    
                    // Calculate new mastery score based on performance
                    // Formula: correct_attempts - incorrect_attempts, bounded between -3 and +3
                    const incorrectAttempts = total_attempts - correct_attempts;
                    const newMasteryScore = Math.max(-3, Math.min(3, correct_attempts - incorrectAttempts));
                    
                    processed++;
                    
                    // Only update if the mastery score has changed
                    if (newMasteryScore !== mastery_score) {
                        db.db.run(`
                            UPDATE player_alphagram_stats 
                            SET mastery_score = ?, updated_at = CURRENT_TIMESTAMP
                            WHERE user_id = ? AND alphagram = ?
                        `, [newMasteryScore, user_id, alphagram], function(updateErr) {
                            if (updateErr) {
                                console.error(`Error updating ${alphagram} for user ${user_id}:`, updateErr);
                                rejectUpdate(updateErr);
                            } else {
                                updated++;
                                if (updated % 100 === 0) {
                                    console.log(`Updated ${updated} records...`);
                                }
                                resolveUpdate();
                            }
                        });
                    } else {
                        resolveUpdate();
                    }
                });
            });
            
            Promise.all(updatePromises)
                .then(() => {
                    console.log(`Recalculation complete!`);
                    console.log(`- Processed: ${processed} records`);
                    console.log(`- Updated: ${updated} records`);
                    resolve({ processed, updated });
                })
                .catch(reject);
        });
    });
}

// Run the recalculation
recalculateMasteryScores()
    .then(result => {
        console.log('Mastery score recalculation successful:', result);
        process.exit(0);
    })
    .catch(error => {
        console.error('Error during recalculation:', error);
        process.exit(1);
    });
