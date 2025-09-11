const fetch = globalThis.fetch || require('node-fetch');

async function testServerDebug() {
    console.log('🔍 Testing server debug output...\n');
    
    try {
        // Test the exact same request the client is making
        const testData = {
            sessionId: 'test_session_debug_' + Date.now(),
            totalAlphagrams: 20,
            alphagramsSolved: 4,
            finalScore: 40,
            firstAttemptScore: 20,
            completed: true,
            gameDuration: 30000
        };
        
        console.log('Sending test request to server with data:', testData);
        
        const response = await fetch('http://localhost:3000/api/analytics/session/finish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Server response:', result);
            console.log('\n📝 Check the server console for debug logs showing:');
            console.log('   - "Finishing session with data: ..."');
            console.log('   - "DEBUG: firstAttemptScore type and value: ..."');
            console.log('   - "DEBUG: finishGameSession received firstAttemptScore: ..."');
        } else {
            console.log('❌ Server request failed:', response.status, response.statusText);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testServerDebug();
