const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

// Import the analytics database class to test the methods directly
const AnalyticsDB = require('./data/analytics-db');
const analyticsDB = new AnalyticsDB();

async function testDatabaseDirectly() {
    console.log('🧪 Testing Database Storage Directly...\n');
    
    try {
        const testUserId = 'test_user_' + Date.now();
        const testWordLengths = [2, 3, 4, 5];
        
        // Step 1: Create a user
        console.log('1️⃣ Creating test user...');
        await analyticsDB.createUser(testUserId, 'Test User', testUserId + '@test.com');
        console.log('✅ User created\n');
        
        // Step 2: Start a game session
        console.log('2️⃣ Starting game session...');
        const sessionId = await analyticsDB.startGameSession(testUserId, testWordLengths);
        console.log(`✅ Session started: ${sessionId}\n`);
        
        // Step 3: Finish the session with test scores
        console.log('3️⃣ Finishing session with test data...');
        const testResults = {
            totalAlphagrams: 20,
            alphagramsSolved: 18,
            finalScore: 200,
            firstAttemptScore: 180,
            completed: true,
            gameDuration: 120000
        };
        
        console.log('Test data being stored:', testResults);
        
        await analyticsDB.finishGameSession(sessionId, testResults);
        console.log('✅ Session finished\n');
        
        // Step 4: Query the database directly to verify storage
        console.log('4️⃣ Querying database to verify storage...');
        
        const dbRecord = await new Promise((resolve, reject) => {
            db.get(`
                SELECT 
                    id,
                    user_id,
                    session_start,
                    session_end,
                    word_lengths,
                    total_alphagrams,
                    alphagrams_solved,
                    final_score,
                    first_attempt_score,
                    completed,
                    game_duration
                FROM game_sessions 
                WHERE id = ?
            `, [sessionId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
        
        if (!dbRecord) {
            throw new Error('❌ No database record found!');
        }
        
        console.log('📊 Database Record Retrieved:');
        console.log('   Session ID:', dbRecord.id);
        console.log('   User ID:', dbRecord.user_id);
        console.log('   Word Lengths:', dbRecord.word_lengths);
        console.log('   Total Alphagrams:', dbRecord.total_alphagrams);
        console.log('   Alphagrams Solved:', dbRecord.alphagrams_solved);
        console.log('   Final Score:', dbRecord.final_score);
        console.log('   First Attempt Score:', dbRecord.first_attempt_score);
        console.log('   Completed:', dbRecord.completed);
        console.log('   Game Duration:', dbRecord.game_duration);
        console.log();
        
        // Step 5: Verify all values match
        console.log('5️⃣ Verifying stored values...');
        
        const checks = [
            { name: 'Total Alphagrams', expected: 20, actual: dbRecord.total_alphagrams },
            { name: 'Alphagrams Solved', expected: 18, actual: dbRecord.alphagrams_solved },
            { name: 'Final Score', expected: 200, actual: dbRecord.final_score },
            { name: 'First Attempt Score', expected: 180, actual: dbRecord.first_attempt_score },
            { name: 'Completed', expected: 1, actual: dbRecord.completed },
            { name: 'Game Duration', expected: 120000, actual: dbRecord.game_duration }
        ];
        
        let allPassed = true;
        checks.forEach(check => {
            const passed = check.expected === check.actual;
            const status = passed ? '✅' : '❌';
            console.log(`${status} ${check.name}: Expected ${check.expected}, Got ${check.actual}`);
            if (!passed) allPassed = false;
        });
        
        // Step 6: Test the API method that retrieves recent games
        console.log('\n6️⃣ Testing recent games retrieval...');
        
        const recentGames = await analyticsDB.getPlayerRecentGames(testUserId, 5);
        const ourGame = recentGames.find(game => game.id === sessionId);
        
        if (ourGame) {
            console.log('✅ Game found in recent games');
            console.log('   Final Score from API:', ourGame.final_score);
            console.log('   First Attempt Score from API:', ourGame.first_attempt_score);
            
            if (ourGame.first_attempt_score === 180 && ourGame.final_score === 200) {
                console.log('✅ API retrieval returns correct scores');
            } else {
                console.log('❌ API retrieval has incorrect scores');
                allPassed = false;
            }
        } else {
            console.log('❌ Game not found in recent games API');
            allPassed = false;
        }
        
        // Final result
        console.log('\n🎯 Database Test Results:');
        if (allPassed) {
            console.log('🎉 ALL DATABASE TESTS PASSED!');
            console.log('   ✅ first_attempt_score column exists');
            console.log('   ✅ Data is stored correctly');
            console.log('   ✅ Data is retrieved correctly');
            console.log('   ✅ API methods work properly');
        } else {
            console.log('💥 SOME DATABASE TESTS FAILED!');
            console.log('   Check the failed assertions above');
        }
        
        // Cleanup
        console.log('\n🧹 Cleaning up test data...');
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM game_sessions WHERE id = ?', [sessionId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [testUserId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ Test data cleaned up');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        db.close();
    }
}

// Run the test
testDatabaseDirectly();
