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
            
            // Parse user input into array of words
            let userWords = [];
            if (userInput.trim()) {
                if (userInput.toLowerCase().trim() === 'x') {
                    // User marked as fake - empty array means no words guessed
                    userWords = [];
                } else {
                    // Split by spaces, commas, or semicolons and filter out empty strings
                    userWords = userInput.split(/[,;\s]+/).filter(word => word.trim().length > 0);
                }
            }
            
            const scoreResult = dictionary.calculateScore(alphagramData, userWords);
            
            totalScore += scoreResult.score;
            
            // Determine correctness based on scoring results
            let isCorrect = false;
            if (alphagramData.isFake) {
                // For fake alphagrams, correct answer is 'x' or empty
                isCorrect = userInput.toLowerCase().trim() === 'x' || userInput.trim() === '';
            } else {
                // For real alphagrams, correct if user found at least one valid word
                isCorrect = scoreResult.validWords.length > 0;
            }
            
            return {
                alphagram: alphagramData.alphagram,
                userInput: userInput,
                isCorrect: isCorrect,
                score: scoreResult.score,
                validWords: scoreResult.validWords || alphagramData.validWords,
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
