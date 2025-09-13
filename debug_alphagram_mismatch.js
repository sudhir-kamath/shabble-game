const AnalyticsDB = require('./data/analytics-db');

async function debug() {
    const db = new AnalyticsDB();
    const testUserId = db.hashData('1RPUeP94HiguABdJrtPeVOyvGTb2');
    
    const result = await db.getPlayerAdvancedStats(testUserId);
    const player2Letter = result.alphagrams.filter(a => a.word_length == 2);
    const all2Letter = await db.getAllAlphagramsForLength(2);
    
    console.log('PLAYER:', player2Letter.length, 'alphagrams');
    console.log('DICT:', all2Letter.length, 'alphagrams');
    console.log('PLAYER SAMPLE:', player2Letter.slice(0, 5).map(p => p.alphagram));
    console.log('DICT SAMPLE:', all2Letter.slice(0, 5));
    
    // Check if it's a case issue
    const playerLower = player2Letter.map(p => p.alphagram.toLowerCase());
    const dictLower = all2Letter.map(a => a.toLowerCase());
    const caseMatches = playerLower.filter(p => dictLower.includes(p));
    console.log('CASE INSENSITIVE MATCHES:', caseMatches.length);
    
    // Check specific examples
    console.log('NU in dict?', all2Letter.includes('NU'), all2Letter.includes('nu'));
    console.log('IR in dict?', all2Letter.includes('IR'), all2Letter.includes('ir'));
    console.log('af in dict?', all2Letter.includes('af'), all2Letter.includes('AF'));
}

debug().catch(console.error);
