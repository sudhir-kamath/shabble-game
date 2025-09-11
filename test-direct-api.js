const http = require('http');

const testData = JSON.stringify({
    sessionId: 'test_session_' + Date.now(),
    totalAlphagrams: 20,
    alphagramsSolved: 4,
    finalScore: 40,
    firstAttemptScore: 20,
    completed: true,
    gameDuration: 30000
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/analytics/session/finish',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(testData)
    }
};

console.log('🧪 Testing API endpoint directly...');
console.log('Request data:', JSON.parse(testData));

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('Response:', data);
        console.log('\n📋 Now check the server console for debug output!');
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.write(testData);
req.end();
