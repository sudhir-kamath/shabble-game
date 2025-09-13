/**
 * List all users who have mastery carpet data (updated by recalculation script)
 */

const AnalyticsDB = require('./data/analytics-db');

async function listUpdatedUsers() {
    console.log('Listing users with mastery carpet data...');
    
    const db = new AnalyticsDB();
    
    return new Promise((resolve, reject) => {
        // Get all users who have alphagram stats with their identifiable info
        db.db.all(`
            SELECT DISTINCT 
                u.id,
                u.firebase_uid,
                u.email,
                u.total_games,
                u.created_at,
                COUNT(pas.alphagram) as alphagram_count,
                SUM(CASE WHEN pas.mastery_score != 0 THEN 1 ELSE 0 END) as mastery_records
            FROM users u
            JOIN player_alphagram_stats pas ON u.id = pas.user_id
            GROUP BY u.id, u.firebase_uid, u.email, u.total_games, u.created_at
            ORDER BY u.total_games DESC, alphagram_count DESC
        `, [], (err, users) => {
            if (err) {
                reject(err);
                return;
            }
            
            console.log(`Found ${users.length} users with mastery carpet data:\n`);
            
            users.forEach((user, index) => {
                const email = user.email || 'No email';
                const firebaseUid = user.firebase_uid || 'No Firebase UID';
                const createdDate = new Date(user.created_at).toLocaleDateString();
                
                console.log(`${index + 1}. User ID: ${user.id}`);
                console.log(`   Email: ${email}`);
                console.log(`   Firebase UID: ${firebaseUid}`);
                console.log(`   Total Games: ${user.total_games}`);
                console.log(`   Alphagram Records: ${user.alphagram_count}`);
                console.log(`   Mastery Records: ${user.mastery_records}`);
                console.log(`   Created: ${createdDate}`);
                console.log('');
            });
            
            console.log(`Summary:`);
            console.log(`- Total users with mastery data: ${users.length}`);
            console.log(`- Total alphagram records: ${users.reduce((sum, u) => sum + u.alphagram_count, 0)}`);
            console.log(`- Total mastery records: ${users.reduce((sum, u) => sum + u.mastery_records, 0)}`);
            
            resolve(users);
        });
    });
}

listUpdatedUsers()
    .then(users => {
        console.log('User listing complete.');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error listing users:', error);
        process.exit(1);
    });
