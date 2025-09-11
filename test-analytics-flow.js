const sqlite3 = require('sqlite3').verbose();
const path = require('path');
// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch || require('node-fetch');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

// Test configuration
const TEST_USER_ID = 'test_user_analytics_' + Date.now();
const SERVER_URL = 'http://localhost:3000';

async function testAnalyticsFlow() {
    console.log('🧪 Testing Analytics Flow...\n');
    
    try {
        // Step 1: Start a server session
        console.log('1️⃣ Starting server session...');
        const startResponse = await fetch(`${SERVER_URL}/api/analytics/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: TEST_USER_ID,
                wordLengths: [2, 3, 4, 5]
            })
        });
        
        if (!startResponse.ok) {
            throw new Error(`Start session failed: ${startResponse.status}`);
        }
        
        const startResult = await startResponse.json();
        const sessionId = startResult.sessionId;
        console.log(`✅ Session started: ${sessionId}\n`);
        
        // Step 2: Finish the session with test data
        console.log('2️⃣ Finishing server session with test scores...');
        const testData = {
            sessionId: sessionId,
            totalAlphagrams: 20,
            alphagramsSolved: 18,
            finalScore: 200,
            firstAttemptScore: 180,
            completed: true,
            gameDuration: 120000
        };
        
        console.log('Sending test data:', testData);
        
        const finishResponse = await fetch(`${SERVER_URL}/api/analytics/session/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });
        
        if (!finishResponse.ok) {
            throw new Error(`Finish session failed: ${finishResponse.status}`);
        }
        
        console.log('✅ Session finished successfully\n');
        
        // Step 3: Check database directly
        console.log('3️⃣ Checking database records...');
        
        const dbRecord = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    id, 
                    session_start, 
                    final_score, 
                    first_attempt_score,
                    total_alphagrams,
                    alphagrams_solved,
                    completed
                FROM game_sessions 
                WHERE id = ?
            `, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!dbRecord) {
            throw new Error('No database record found for session');
        }
        
        console.log('Database record:', dbRecord);
        
        // Step 4: Verify data correctness
        console.log('\n4️⃣ Verifying data correctness...');
        
        const checks = [
            { name: 'Final Score', expected: 200, actual: dbRecord.final_score },
            { name: 'First Attempt Score', expected: 180, actual: dbRecord.first_attempt_score },
            { name: 'Total Alphagrams', expected: 20, actual: dbRecord.total_alphagrams },
            { name: 'Alphagrams Solved', expected: 18, actual: dbRecord.alphagrams_solved },
            { name: 'Completed', expected: 1, actual: dbRecord.completed }
        ];
        
        let allPassed = true;
        checks.forEach(check => {
            const passed = check.expected === check.actual;
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${check.name}: Expected ${check.expected}, Got ${check.actual}`);
            if (!passed) allPassed = false;
        });
        
        // Step 5: Test API response
        console.log('\n5️⃣ Testing API response...');
        
        const statsResponse = await fetch(`${SERVER_URL}/api/analytics/player/${TEST_USER_ID}/stats`);
        if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const recentGames = statsData.recentGames || [];
            const latestGame = recentGames.find(game => game.id === sessionId);
            
            if (latestGame) {
                console.log('✅ API returns game data:', {
                    id: latestGame.id,
                    finalScore: latestGame.score,
                    firstAttemptScore: latestGame.firstAttemptScore
                });
                
                if (latestGame.firstAttemptScore === 180 && latestGame.score === 200) {
                    console.log('✅ API data matches expected values');
                } else {
                    console.log('❌ API data mismatch');
                    allPassed = false;
                }
            } else {
                console.log('❌ Game not found in API response');
                allPassed = false;
            }
        } else {
            console.log('❌ API request failed');
            allPassed = false;
        }
        
        // Final result
        console.log('\n🎯 Test Results:');
        if (allPassed) {
            console.log('🎉 ALL TESTS PASSED! Analytics flow is working correctly.');
        } else {
            console.log('💥 SOME TESTS FAILED! Check the issues above.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        db.close();
    }
}

// Run the test
testAnalyticsFlow();
