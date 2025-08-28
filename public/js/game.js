
class ShabbleGame {
    constructor() {
        this.gameState = {
            isPlaying: false,
            isPaused: false,
            timeLeft: 120, // 2 minutes in seconds
            score: 0,
            usedExtraTime: false,
            isSecondAttempt: false,
            initialScore: 0,
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
        this.startSecondAttempt = this.startSecondAttempt.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.submitAnswer = this.submitAnswer.bind(this);
        this.useExtraTime = this.useExtraTime.bind(this);
    }
    
    // Start a new game by fetching from the server
    async startNewGame(selectedLengths = [4]) {
        try {
            const response = await fetch('/api/game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lengths: selectedLengths }),
            });

            if (!response.ok) {
                throw new Error('Failed to start a new game.');
            }

            const gameData = await response.json();

            // Reset game state
            this.gameState = {
                isPlaying: true,
                isPaused: false,
                timeLeft: 120,
                score: 0,
                usedExtraTime: false,
                isSecondAttempt: false,
                initialScore: 0,
                alphagrams: gameData, // Alphagrams from server
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

            this.startTimer();

            return {
                alphagrams: this.gameState.alphagrams.map(a => ({
                    alphagram: a.alphagram,
                    length: a.alphagram.length
                })),
                timeLeft: this.gameState.timeLeft,
                score: this.gameState.score
            };
        } catch (error) {
            console.error('Error starting new game:', error);
            // Handle the error appropriately in the UI
            return null;
        }
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
    
    startSecondAttempt() {
        if (this.gameState.isPlaying || this.gameState.isSecondAttempt) {
            return { success: false, message: 'Invalid state for second attempt.' };
        }

        this.gameState.isSecondAttempt = true;
        this.gameState.initialScore = this.gameState.score;
        this.gameState.timeLeft = 60; // 60 seconds for the second attempt
        this.gameState.isPlaying = true;

        this.startTimer();

        return {
            success: true,
            timeLeft: this.gameState.timeLeft,
            initialScore: this.gameState.initialScore
        };
    }

    // End the game and get final scores from the server
    async endGame() {
        
        // Convert answers from object format to flat string format expected by server
        const flatAnswers = {};
        Object.keys(this.gameState.answers).forEach(alphagram => {
            flatAnswers[alphagram] = this.gameState.answers[alphagram].userInput || '';
        });
        
        const submitData = {
            alphagrams: this.gameState.alphagrams,
            answers: flatAnswers,
            usedExtraTime: this.gameState.usedExtraTime
        };
        
        
        try {
            const response = await fetch('/api/game/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(submitData)
            });

            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to submit answers. Status: ${response.status}`);
            }

            const result = await response.json();
            
            // Stop the game and timer
            this.gameState.isPlaying = false;
            this.gameState.endTime = new Date();
            if (this.gameState.timerInterval) {
                clearInterval(this.gameState.timerInterval);
            }
            
            // Update local game state with results from server
            this.gameState.score = result.score;
            if (!this.gameState.isSecondAttempt) {
                this.gameState.initialScore = result.score;
            }
            
            // Store detailed results for each alphagram for highlighting and hover functionality
            this.gameState.lastResults = result.results;

            // Merge server results with local state for UI display
            const finalResults = {
                ...result,
                isSecondAttempt: this.gameState.isSecondAttempt,
                initialScore: this.gameState.initialScore,
                timeTaken: Math.floor((this.gameState.endTime - this.gameState.startTime) / 1000),
            };

            return finalResults;

        } catch (error) {
            console.error('Error submitting answers:', error);
            // Show error message to user
            alert(`Failed to submit answers: ${error.message}`);
        }
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
        
        // Store the answer temporarily - scoring will be done by server on endGame
        // For now, just store the input without calculating score
        this.gameState.answers[alphagram].isCorrect = null;
        this.gameState.answers[alphagram].score = 0;
        this.gameState.answers[alphagram].expectedAnswers = alphagramData.validWords;
        
        // Update the total score
        this.gameState.score = Object.values(this.gameState.answers)
            .reduce((total, answer) => total + (answer.score || 0), 0);
        
        // Return the result
        return {
            success: true,
            isCorrect: null, // Will be determined by server
            score: 0, // Will be calculated by server
            totalScore: this.gameState.score,
            expectedAnswers: alphagramData.validWords
        };
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
            isSecondAttempt: this.gameState.isSecondAttempt,
            lastResults: this.gameState.lastResults,
            alphagrams: this.gameState.alphagrams.map(alphagram => {
                // Find the result for this alphagram from the last server response
                const result = this.gameState.lastResults?.find(r => r.alphagram === alphagram.alphagram);
                return {
                    alphagram: alphagram.alphagram,
                    isFake: alphagram.isFake,
                    validWords: alphagram.validWords,
                    userInput: this.gameState.answers[alphagram.alphagram]?.userInput || '',
                    score: result?.score || 0,
                    isCorrect: result?.isCorrect,
                    validWords: result?.validWords || alphagram.validWords,
                    invalidWords: result?.invalidWords || []
                };
            })
        };
    }
}

// Create a singleton instance
export const game = new ShabbleGame();
