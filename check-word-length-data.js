const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'analytics.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking word length data in alphagram attempts...');

// Check the actual word_length values in the database
db.all(`
    SELECT 
        word_length,
        COUNT(*) as count,
        GROUP_CONCAT(alphagram) as sample_alphagrams
    FROM alphagram_attempts 
    GROUP BY word_length
    ORDER BY word_length
`, (err, results) => {
    if (err) {
        console.error('Error getting word length data:', err);
    } else {
        console.log('\nWord length distribution:');
        results.forEach(row => {
            console.log(`Length ${row.word_length}: ${row.count} attempts`);
            console.log(`  Sample alphagrams: ${row.sample_alphagrams.split(',').slice(0, 3).join(', ')}`);
        });
    }
    
    // Check a few specific records to see the data structure
    db.all(`
        SELECT 
            id, alphagram, word_length, solved, 
            first_attempt_correct, second_attempt_correct,
            user_answers, correct_answers
        FROM alphagram_attempts 
        LIMIT 10
    `, (err, samples) => {
        if (err) {
            console.error('Error getting sample records:', err);
        } else {
            console.log('\nSample alphagram attempt records:');
            samples.forEach(record => {
                console.log(`ID ${record.id}: ${record.alphagram} (length: ${record.word_length})`);
                console.log(`  Solved: ${record.solved}, First: ${record.first_attempt_correct}, Second: ${record.second_attempt_correct}`);
                console.log(`  User answers: ${record.user_answers}`);
                console.log(`  Correct answers: ${record.correct_answers}`);
                console.log('---');
            });
        }
        
        db.close();
    });
});
