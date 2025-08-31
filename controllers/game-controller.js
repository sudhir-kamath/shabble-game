const dictionary = require('../data/dictionary');

// Controller to start a new game
const startNewGame = (req, res) => {
    try {
        const { lengths } = req.body;
        const gameData = dictionary.generateGame(lengths);
        res.json(gameData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to start game' });
    }
};

// Controller to submit all answers at the end of the game
const submitAnswer = (req, res) => {
    try {
        const { alphagrams, answers, usedExtraTime } = req.body;

        if (!alphagrams || !answers) {
            return res.status(400).json({ error: 'Missing alphagrams or answers data.' });
        }

        let totalScore = 0;

        const results = alphagrams.map(alphagramData => {
            const userInput = answers[alphagramData.alphagram] || '';
            
            console.log(`DEBUG RAW: ${alphagramData.alphagram} - raw userInput: "${userInput}" - type: ${typeof userInput} - isFake: ${alphagramData.isFake}`);
            
            // Parse user input into array of words
            let userWords = [];
            let isBlankSubmission = false;
            
            if (userInput.trim()) {
                if (userInput.toLowerCase().trim() === 'x') {
                    // User marked as fake - empty array means no words guessed
                    userWords = [];
                } else {
                    // Split by spaces, commas, or semicolons and filter out empty strings
                    userWords = userInput.split(/[,;\s]+/).filter(word => word.trim().length > 0);
                }
            } else {
                // Completely blank input - no penalty, just 0 points
                isBlankSubmission = true;
            }
            
            const scoreResult = dictionary.calculateScore(alphagramData, userWords, isBlankSubmission);
            
            totalScore += scoreResult.score;
            
            // Determine correctness for UI highlighting
            let isCorrect = false;
            if (isBlankSubmission) {
                // Any blank submission should be marked as 'blank' regardless of fake/real
                isCorrect = 'blank';
            } else if (alphagramData.isFake) {
                if (userInput.toLowerCase().trim() === 'x') {
                    isCorrect = true; // Correctly identified as fake
                } else {
                    isCorrect = false; // Submitted words for fake alphagram
                }
            } else {
                // For real alphagrams with actual input
                if (scoreResult.score < 0) {
                    isCorrect = false; // Any negative score means incorrect (penalty applied)
                } else if (scoreResult.validWords.length === alphagramData.validWords.length && alphagramData.validWords.length > 0) {
                    isCorrect = true; // Found all words
                } else if (scoreResult.validWords.length > 0) {
                    isCorrect = 'partial'; // Found some words (only when no penalty)
                } else {
                    isCorrect = false; // No correct words found
                }
            }
            
            console.log(`DEBUG: ${alphagramData.alphagram} - userInput: "${userInput}" - isBlankSubmission: ${isBlankSubmission} - isCorrect: ${isCorrect} - score: ${scoreResult.score} - validWords: ${scoreResult.validWords?.length || 0}/${alphagramData.validWords?.length || 0}`);
            
            return {
                alphagram: alphagramData.alphagram,
                userInput: userInput,
                isCorrect: isCorrect,
                score: scoreResult.score,
                validWords: alphagramData.validWords, // Always show all valid words, not just user's correct ones
                invalidWords: scoreResult.invalidWords || [],
                isFake: alphagramData.isFake
            };
        });

        // Apply penalty for extra time if used
        if (usedExtraTime) {
            totalScore -= 25;
        }

        res.json({
            score: totalScore,
            results: results
        });

    } catch (error) {
        console.error('Error submitting answers:', error);
        res.status(500).json({ error: 'Failed to submit answers' });
    }
};

module.exports = {
    startNewGame,
    submitAnswer,
};
