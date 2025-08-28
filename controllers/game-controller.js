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
            const scoreResult = dictionary.calculateScore(alphagramData, userInput);
            
            totalScore += scoreResult.score;
            
            return {
                alphagram: alphagramData.alphagram,
                userInput: userInput,
                isCorrect: scoreResult.isCorrect,
                score: scoreResult.score,
                validWords: alphagramData.validWords,
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
