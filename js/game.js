import { generateGame, isValidWord } from './dictionary.js';

class ShabbleGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            timeLeft: 120, // 2 minutes in seconds
            score: 0,
            usedExtraTime: false,
            alphagrams: [],
            answers: {},
            startTime: null,
            timerInterval: null
        };
        
        // Bind methods
        this.startNewGame = this.startNewGame.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.submitAnswer = this.submitAnswer.bind(this);
        this.calculateScore = this.calculateScore.bind(this);
        this.useExtraTime = this.useExtraTime.bind(this);
    }
    
    // Start a new game
    startNewGame(selectedLengths = [4]) {
        const generatedAlphagrams = generateGame(selectedLengths);
        
        // Reset game state
        this.gameState = {
            isPlaying: true,
            isPaused: false,
            timeLeft: 120,
            score: 0,
            usedExtraTime: false,
            alphagrams: generatedAlphagrams, // Randomized: 15-17 real, 3-5 fake (total 20)
            answers: {},
            startTime: new Date(),
            timerInterval: null
        };
        
        // Initialize answers object
        this.gameState.alphagrams.forEach(alphagram => {
            this.gameState.answers[alphagram.alphagram] = {
                userInput: '',
                isCorrect: null,
                score: 0
            };
        });
        
        // Start the timer
        this.startTimer();
        
        return {
            alphagrams: this.gameState.alphagrams.map(a => ({
                alphagram: a.alphagram,
                isFake: a.isFake,
                validWords: a.validWords
            })),
            timeLeft: this.gameState.timeLeft,
            score: this.gameState.score
        };
    }
    
    // Start the game timer
    startTimer() {
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
        }
        
        this.gameState.timerInterval = setInterval(() => {
            if (!this.gameState.isPaused && this.gameState.isPlaying) {
                this.gameState.timeLeft--;
                
                // Update any UI elements that display the timer
                if (typeof this.onTimeUpdate === 'function') {
                    this.onTimeUpdate(this.gameState.timeLeft);
                }
                
                // Check if time's up
                if (this.gameState.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    // Pause the game
    pauseGame() {
        if (this.gameState.isPlaying && !this.gameState.isPaused) {
            this.gameState.isPaused = true;
            return true;
        }
        return false;
    }
    
    // Resume the game
    resumeGame() {
        if (this.gameState.isPlaying && this.gameState.isPaused) {
            this.gameState.isPaused = false;
            return true;
        }
        return false;
    }
    
    // End the game and calculate final scores
    endGame() {
        if (this.gameState.timerInterval) {
            clearInterval(this.gameState.timerInterval);
            this.gameState.timerInterval = null;
        }
        
        this.gameState.isPlaying = false;
        this.gameState.endTime = new Date();
        
        // Calculate final scores for all answers
        let totalScore = 0;
        
        this.gameState.alphagrams.forEach(alphagram => {
            const answer = this.gameState.answers[alphagram.alphagram];
            if (answer && answer.userInput !== '') {
                const result = this.calculateScore(alphagram, answer.userInput);
                answer.isCorrect = result.isCorrect;
                answer.score = result.score;
                answer.expectedAnswers = alphagram.validWords;
                totalScore += answer.score;
            } else {
                // No answer provided
                answer.score = 0;
                answer.isCorrect = false;
                answer.expectedAnswers = alphagram.validWords;
            }
        });
        
        // Apply penalty for extra time if used
        if (this.gameState.usedExtraTime) {
            totalScore -= 25;
        }

        this.gameState.score = totalScore;
        
        // Calculate time taken
        const timeTaken = Math.floor((this.gameState.endTime - this.gameState.startTime) / 1000);
        
        // Return game results
        return {
            score: this.gameState.score,
            timeTaken,
            alphagrams: this.gameState.alphagrams.map(alphagram => ({
                alphagram: alphagram.alphagram,
                isFake: alphagram.isFake,
                userInput: this.gameState.answers[alphagram.alphagram].userInput,
                isCorrect: this.gameState.answers[alphagram.alphagram].isCorrect,
                score: this.gameState.answers[alphagram.alphagram].score,
                validWords: alphagram.validWords
            }))
        };
    }
    

    // Update the timer display
    updateTimer() {
        if (typeof this.onTimeUpdate === 'function') {
            this.onTimeUpdate(this.gameState.timeLeft);
        }
    }
    
    // Submit an answer for an alphagram
    submitAnswer(alphagram, userInput) {
        if (!this.gameState.isPlaying || this.gameState.isPaused) {
            return { success: false, message: 'Game is not active or is paused' };
        }
        
        // Normalize user input
        userInput = userInput.trim();
        
        // Find the alphagram
        const alphagramData = this.gameState.alphagrams.find(a => a.alphagram === alphagram);
        if (!alphagramData) {
            return { success: false, message: 'Invalid alphagram' };
        }
        
        // Store the user's answer
        this.gameState.answers[alphagram] = {
            userInput,
            isCorrect: null,
            score: 0
        };
        
        // Calculate the score for this answer
        const result = this.calculateScore(alphagramData, userInput);
        
        // Update the answer with the result
        this.gameState.answers[alphagram].isCorrect = result.isCorrect;
        this.gameState.answers[alphagram].score = result.score;
        this.gameState.answers[alphagram].expectedAnswers = alphagramData.validWords;
        
        // Update the total score
        this.gameState.score = Object.values(this.gameState.answers)
            .reduce((total, answer) => total + (answer.score || 0), 0);
        
        // Return the result
        return {
            success: true,
            isCorrect: result.isCorrect,
            score: result.score,
            totalScore: this.gameState.score,
            expectedAnswers: alphagramData.validWords
        };
    }
    
    // Calculate the score for a given answer
    calculateScore(alphagram, userInput) {
        // Handle fake alphagrams
        if (alphagram.isFake) {
            if (userInput.toLowerCase() === 'x') {
                return { isCorrect: true, score: 10 };
            } else if (userInput.trim() === '') {
                return { isCorrect: false, score: 0 };
            } else {
                return { isCorrect: false, score: -5 };
            }
        }
        
        // Handle real alphagrams

        // If user incorrectly marks a real alphagram as fake, penalize them.
        if (userInput.toLowerCase().trim() === 'x') {
            return { isCorrect: false, score: -5 };
        }

        const userAnswers = userInput
            .toLowerCase()
            .split(/[ ,]+/)
            .filter(answer => answer.trim() !== '');
        
        // If no answer provided
        if (userAnswers.length === 0) {
            return { isCorrect: false, score: 0 };
        }
        
        // Check for invalid words
        const validAnswers = alphagram.validWords || [];
        const uniqueUserAnswers = [...new Set(userAnswers)]; // Remove duplicates
        const expectedLength = alphagram.length || alphagram.alphagram.length;
        
        // Check for any incorrect answers (wrong words or wrong length)
        const hasIncorrectAnswer = uniqueUserAnswers.some(answer => {
            if (answer === 'x') return false;
            // Check if word has correct length and is valid for that length
            return answer.length !== expectedLength || !isValidWord(answer, expectedLength);
        });
        
        if (hasIncorrectAnswer) {
            return { isCorrect: false, score: -5 };
        }
        
        // Calculate score based on correct answers
        const correctAnswers = uniqueUserAnswers.filter(answer => 
            validAnswers.includes(answer)
        );
        
        if (correctAnswers.length === validAnswers.length) {
            return { isCorrect: true, score: 10 };
        } else if (correctAnswers.length > 0) {
            // Partial credit for some correct answers
            const partialScore = Math.round(10 * (correctAnswers.length / validAnswers.length));
            return { isCorrect: 'partial', score: partialScore };
        } else {
            return { isCorrect: false, score: 0 };
        }
    }
    
    // Use extra time (30 seconds)
    useExtraTime() {
        if (this.gameState.usedExtraTime || !this.gameState.isPlaying || this.gameState.isPaused) {
            return { success: false, message: 'Extra time already used or game not active' };
        }

        this.gameState.timeLeft = Math.min(120, this.gameState.timeLeft + 30); // Add 30s, cap at 120
        this.gameState.usedExtraTime = true;
        // Manually trigger a timer update for the UI
        if (typeof this.onTimeUpdate === 'function') {
            this.onTimeUpdate(this.gameState.timeLeft);
        }

        return {
            success: true,
            newTimeLeft: this.gameState.timeLeft
        };
    }
    
    // Get the current game state
    getGameState() {
        return {
            isPlaying: this.gameState.isPlaying,
            isPaused: this.gameState.isPaused,
            timeLeft: this.gameState.timeLeft,
            score: this.gameState.score,
            usedExtraTime: this.gameState.usedExtraTime,
            alphagrams: this.gameState.alphagrams.map(alphagram => ({
                alphagram: alphagram.alphagram,
                isFake: alphagram.isFake,
                validWords: alphagram.validWords,
                userInput: this.gameState.answers[alphagram.alphagram]?.userInput || '',
                score: this.gameState.answers[alphagram.alphagram]?.score || 0,
                isCorrect: this.gameState.answers[alphagram.alphagram]?.isCorrect
            }))
        };
    }
}

// Create a singleton instance
export const game = new ShabbleGame();
