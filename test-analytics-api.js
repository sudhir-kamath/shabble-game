const fetch = require('node-fetch');

async function testAnalyticsAPI() {
    try {
        // First, let's check what Firebase UID we should use
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.join(__dirname, 'data', 'analytics.db');
        const db = new sqlite3.Database(dbPath);
        
        db.get('SELECT firebase_uid FROM users LIMIT 1', async (err, user) => {
            if (err) {
                console.error('Error getting user:', err);
                return;
            }
            
            if (!user) {
                console.log('No user found');
                return;
            }
            
            console.log(`Testing API for Firebase UID: ${user.firebase_uid}`);
            
            // Test the analytics API
            const response = await fetch(`http://localhost:3000/api/analytics/user/${user.firebase_uid}/stats`);
            
            if (!response.ok) {
                console.error('API request failed:', response.status, response.statusText);
                return;
            }
            
            const data = await response.json();
            console.log('\nAPI Response:');
            console.log(JSON.stringify(data, null, 2));
            
            if (data.stats && data.stats.wordLengthAccuracy) {
                console.log('\nWord Length Accuracy from API:');
                data.stats.wordLengthAccuracy.forEach(item => {
                    console.log(`  Length ${item.length}: ${item.accuracy}%`);
                });
            } else {
                console.log('\nNo wordLengthAccuracy found in API response');
            }
            
            db.close();
        });
        
    } catch (error) {
        console.error('Error testing API:', error);
    }
}

testAnalyticsAPI();
