/**
 * Script to extract all unique alphagrams for 3-letter words
 */

const dictionary = require('./data/dictionary');

function createAlphagram(word) {
    return word.toLowerCase().split('').sort().join('');
}

console.log('=== 3-LETTER ALPHAGRAM EXTRACTION ===');

// Get 3-letter words
const words3 = dictionary.DICTIONARY_3;
console.log(`Total 3-letter words: ${words3.length}`);

// Extract unique alphagrams
const alphagramSet = new Set();
words3.forEach(word => {
    const alphagram = createAlphagram(word);
    alphagramSet.add(alphagram);
});

console.log(`Unique 3-letter alphagrams: ${alphagramSet.size}`);

// Check existing ALPHAGRAM_MAPS
if (dictionary.ALPHAGRAM_MAPS && dictionary.ALPHAGRAM_MAPS[3]) {
    console.log(`Existing ALPHAGRAM_MAPS[3] size: ${dictionary.ALPHAGRAM_MAPS[3].size}`);
} else {
    console.log('No ALPHAGRAM_MAPS[3] found');
}

// Show first 20 alphagrams as examples
const alphagrams = Array.from(alphagramSet).sort();
console.log('\nFirst 20 alphagrams:');
alphagrams.slice(0, 20).forEach((alphagram, i) => {
    console.log(`${i + 1}. ${alphagram}`);
});

// Test the getAllAlphagramsForLength function directly
console.log('\n=== TESTING getAllAlphagramsForLength ===');
const AnalyticsDB = require('./data/analytics-db');
const db = new AnalyticsDB();

// Test the function
db.getAllAlphagramsForLength(3).then(result => {
    console.log(`getAllAlphagramsForLength(3) returned: ${result.length} alphagrams`);
    console.log('First 10:', result.slice(0, 10));
    
    // Check if the issue is in the player data filtering
    console.log('\n=== SIMULATING API LOGIC ===');
    
    // Simulate what happens in the controller
    const mockPlayerData = [
        { alphagram: 'abc', word_length: 3, total_attempts: 5, mastery_score: 2 },
        { alphagram: 'def', word_length: 3, total_attempts: 3, mastery_score: -1 }
    ];
    
    // Create player data map
    const playerDataMap = new Map();
    mockPlayerData.forEach(item => {
        if (item.word_length == 3) {
            playerDataMap.set(item.alphagram, item);
        }
    });
    
    console.log(`Mock player data: ${playerDataMap.size} alphagrams`);
    
    // Merge with all alphagrams
    const completeAlphagrams = result.map(alphagram => {
        const playerData = playerDataMap.get(alphagram);
        return playerData || {
            alphagram: alphagram,
            word_length: 3,
            total_attempts: 0,
            correct_attempts: 0,
            success_rate: 0,
            mastery_score: 0,
            last_attempt_date: null,
            hasPlayed: false
        };
    });
    
    console.log(`Complete alphagrams after merge: ${completeAlphagrams.length}`);
    console.log(`Played: ${completeAlphagrams.filter(a => a.total_attempts > 0).length}`);
    console.log(`Unplayed: ${completeAlphagrams.filter(a => a.total_attempts === 0).length}`);
    
}).catch(error => {
    console.error('Error testing getAllAlphagramsForLength:', error);
});
