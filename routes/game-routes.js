const express = require('express');
const router = express.Router();
const gameController = require('../controllers/game-controller');

// Route to start a new game
router.post('/start', gameController.startNewGame);

// Route to submit an answer
router.post('/submit', gameController.submitAnswer);

module.exports = router;
