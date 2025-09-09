const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAnalytics() {
    const baseUrl = 'http://localhost:3000/api/analytics';
    
    try {
        // Test user registration
        console.log('Testing user registration...');
        const userResponse = await fetch(`${baseUrl}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firebaseUid: 'test123',
                nickname: 'TestUser',
                country: 'US',
                privacyConsent: true
            })
        });
        
        const userData = await userResponse.json();
        console.log('User registration result:', userData);
        
        // Test session start
        console.log('\nTesting session start...');
        const sessionResponse = await fetch(`${baseUrl}/session/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userData.userId,
                wordLengths: [4, 5]
            })
        });
        
        const sessionData = await sessionResponse.json();
        console.log('Session start result:', sessionData);
        
        if (sessionData.success) {
            // Test session finish
            console.log('\nTesting session finish...');
            const finishResponse = await fetch(`${baseUrl}/session/finish`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionData.sessionId,
                    totalAlphagrams: 5,
                    alphagramsSolved: 3,
                    finalScore: 150,
                    completed: true,
                    gameDuration: 120
                })
            });
            
            const finishData = await finishResponse.json();
            console.log('Session finish result:', finishData);
        }
        
        // Test dashboard data
        console.log('\nTesting dashboard data...');
        const dashboardResponse = await fetch(`${baseUrl}/dashboard`);
        const dashboardData = await dashboardResponse.json();
        console.log('Dashboard data:', dashboardData);
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testAnalytics();
