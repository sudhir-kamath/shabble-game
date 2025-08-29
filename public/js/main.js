import { game } from './game.js';
import { authManager } from './auth.js';


document.addEventListener('DOMContentLoaded', function() {
    
    const elements = {
        startScreen: document.getElementById('start-screen'),
        gameBoard: document.getElementById('game-board'),
        startBtn: document.getElementById('start-btn'),
        instructionsBtn: document.getElementById('instructions-btn'),
        instructions: document.getElementById('instructions'),
        closeInstructionsBtn: document.getElementById('close-instructions'),
        gameOverModal: document.getElementById('game-over-modal'),
        closeModalBtn: document.getElementById('close-modal'),
        playAgainBtn: document.getElementById('play-again'),
        playAgainHeaderBtn: document.getElementById('play-again-header-btn'),
        secondAttemptBtn: document.getElementById('second-attempt-btn'),
        headerInstructionsBtn: document.getElementById('header-instructions-btn'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        statsBtn: document.getElementById('stats-btn'),
        statsModal: document.getElementById('stats-modal'),
        closeStatsModal: document.getElementById('close-stats-modal'),
        exportStatsBtn: document.getElementById('export-stats'),
        clearStatsBtn: document.getElementById('clear-stats'),
        timerDisplay: document.getElementById('timer'),
        scoreDisplay: document.getElementById('final-score'),
        quoteText: document.getElementById('quote-text'),
        lengthCheckboxes: {
            2: document.getElementById('length-2'),
            3: document.getElementById('length-3'),
            4: document.getElementById('length-4'),
            5: document.getElementById('length-5')
        },
        // Auth elements
        googleSigninBtn: document.getElementById('google-signin-btn'),
        signoutBtn: document.getElementById('signout-btn'),
        signedOutView: document.getElementById('signed-out-view'),
        signedInView: document.getElementById('signed-in-view'),
        userAvatar: document.getElementById('user-avatar'),
        userName: document.getElementById('user-name'),
        headerInstructionsBtn: document.getElementById('header-instructions-btn'),
        feedbackBtn: document.getElementById('feedback-btn'),
        backBtn: document.getElementById('back-btn'),
        doneBtn: document.getElementById('done-btn'),
        extraTimeBtn: document.getElementById('extra-time'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        gameOverMessage: document.getElementById('game-over-message'),
        liveAnnouncer: document.getElementById('live-announcer'),
        headerFinalScore: document.getElementById('header-final-score'),
        headerPlayerInfo: document.getElementById('header-player-info'),
        headerCountryFlag: document.getElementById('header-country-flag'),
        headerNickname: document.getElementById('header-nickname'),
        // Profile setup elements
        profileSetupModal: document.getElementById('profile-setup-modal'),
        profileSetupForm: document.getElementById('profile-setup-form'),
        nicknameInput: document.getElementById('nickname-input'),
        countrySelect: document.getElementById('country-select'),
        // Edit profile elements
        editProfileModal: document.getElementById('edit-profile-modal'),
        editProfileForm: document.getElementById('edit-profile-form'),
        editNicknameInput: document.getElementById('edit-nickname-input'),
        editCountrySelect: document.getElementById('edit-country-select'),
        cancelEditBtn: document.getElementById('cancel-edit-btn'),
        // Feedback modal elements
        feedbackModal: document.getElementById('feedback-modal'),
        closeFeedbackModal: document.getElementById('close-feedback-modal')
    };


    // --- UI Update Functions ---

    // Function to set country flag CSS class from country code
    function setCountryFlag(element, countryCode) {
        // Clear existing flag classes
        element.className = element.className.replace(/flag-\w+/g, '');
        
        // Add appropriate flag class
        if (!countryCode || countryCode === 'OTHER') {
            element.classList.add('flag-default');
        } else {
            element.classList.add(`flag-${countryCode.toUpperCase()}`);
        }
        
        // Clear text content since we're using CSS for the flag
        element.textContent = '';
    }

    // Function to update header player info
    function updateHeaderPlayerInfo(user) {
        const profile = authManager.getCurrentUserProfile();
        
        if (profile && profile.nickname && profile.country) {
            // Show user info with nickname and country flag
            setCountryFlag(elements.headerCountryFlag, profile.country);
            elements.headerNickname.textContent = profile.nickname;
            elements.headerPlayerInfo.classList.remove('hidden');
        } else {
            elements.headerPlayerInfo.classList.add('hidden');
        }
    }

    // Collection of pithy one-liners involving the number 4
    const fourOneliners = [
        "May the 4s be with you!",
        "A Shabble is an old rusty sword in Scottish- but it's still sharp!",
        "Seen 4 weddings and a Funeral? Don't let the 4s kill your scrabble game",
        "Got 4 aces? That's a hand worth fighting for - but not in scrabble shabble!",
        "Spelling success, one S at a time!",
        "4 seasons in a year, but only one chance to shine",
        "Shabble is a valid word in scrabble!!",
        "4 wheels move the body, but 4 coffees move the soul!",
        "4 wheels good, 2 wheels better.. the cycle of life!",
        // Add this to your fourOneliners array in main.js
        "4 walls don't make a home, but 4 letters can make a word worth playing!",
        "4 seasons in a year, but only one chance to make every word count!",
        "4-leaf clovers are rare, but great words are all around you!",
        "4 wheels move the car, but 4 letters can move the game!",
        "4 corners of the world, but only one board to conquer!",
        "4 suits in a deck, but only one word wins the round!",
        "4 quarters make a dollar, but one great word is priceless!",
        "4 limbs of a chair, but only one seat at the top of the leaderboard!",
        "4 seasons to play, but every word is in season!",
        "4 chambers in the heart, but only one passion for words!",
        "4 directions on a compass, but your word skills take you everywhere!",
        "4 bases in baseball, but only one way to score big - play smart!",
        "4 seasons of the year, but wordplay is always in fashion!",
        "4 wheels on a car, but your vocabulary is the real engine!",
        "4 suits in cards, but words are the real trump!",
        "4 corners of the earth, but the best words come from you!",
        "4 chambers of the heart, but only one love for word games!",
        "4 seasons to shine, but your word skills are always in season!",
        "4 walls can't contain a great vocabulary!",
        "4 quarters make a whole, but one great word makes the game!"
    ];

    const announce = (message) => {
        elements.liveAnnouncer.textContent = message;
    };

    const setRandomQuote = () => {
        const randomQuote = fourOneliners[Math.floor(Math.random() * fourOneliners.length)];
        elements.quoteText.textContent = randomQuote;
    };

    const updateTimerDisplay = (timeLeft) => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        elements.timerDisplay.textContent = timeString;

        // Check if time has run out
        if (timeLeft <= 0 && game.getGameState().isPlaying) {
            endGameDueToTimeout();
            return;
        }

        // Add visual warnings based on time remaining
        if (timeLeft <= 10) {
            // Turn timer red in final 10 seconds
            elements.timerDisplay.classList.add('timer-critical');
        } else {
            elements.timerDisplay.classList.remove('timer-critical');
        }

        if (timeLeft <= 30) {
            // Highlight unanswered cards when 30 seconds or less remain
            highlightUnansweredCards();
        } else {
            // Remove highlighting when more than 30 seconds remain
            removeUnansweredHighlighting();
        }

        // Announce time at key intervals
        if (timeLeft === 60) announce('One minute remaining.');
        if (timeLeft === 30) announce('30 seconds remaining.');
        if (timeLeft === 10) announce('10 seconds remaining.');
    };

    // Helper functions for highlighting unanswered cards
    const highlightUnansweredCards = () => {
        const cards = document.querySelectorAll('.alphagram-card');
        cards.forEach(card => {
            const input = card.querySelector('.answer-input');
            // Only add warning if input is empty AND card doesn't already have warning
            if (input && input.value.trim() === '' && !card.classList.contains('unanswered-warning')) {
                card.classList.add('unanswered-warning');
            }
        });
    };

    const removeUnansweredHighlighting = () => {
        const cards = document.querySelectorAll('.alphagram-card');
        cards.forEach(card => {
            card.classList.remove('unanswered-warning');
        });
    };

    // Function to shuffle letters in a string
    const shuffleLetters = (str) => {
        const letters = str.split('');
        for (let i = letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [letters[i], letters[j]] = [letters[j], letters[i]];
        }
        return letters.join('');
    };

    const renderGameBoard = (alphagrams) => {
        elements.gameBoard.innerHTML = '';
        if (!alphagrams || alphagrams.length === 0) {
            console.error('No alphagrams to render.');
            return;
        }
        alphagrams.forEach(({ alphagram, length }, index) => {
            const card = document.createElement('div');
            card.className = 'alphagram-card';
            card.dataset.alphagram = alphagram;
            card.dataset.originalAlphagram = alphagram; // Store original for reference
            card.dataset.length = length || alphagram.length; // Use provided length or calculate from alphagram
            const inputId = `alphagram-input-${index}`;

            card.innerHTML = `
                <label for="${inputId}" class="alphagram">${alphagram}</label>
                <input type="text" 
                       id="${inputId}" 
                       class="answer-input" 
                       placeholder="Your answer..." 
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="off"
                       spellcheck="false"
                       name="answer-${index}">
            `;
            
            // Add click event listener for shuffling
            const alphagramLabel = card.querySelector('.alphagram');
            alphagramLabel.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Only allow shuffling during active gameplay (not during review)
                const input = card.querySelector('.answer-input');
                if (input.disabled) return;
                
                const currentText = alphagramLabel.textContent;
                const shuffledText = shuffleLetters(currentText);
                alphagramLabel.textContent = shuffledText;
                
                // Add a brief animation to indicate the shuffle
                card.classList.add('shuffling');
                setTimeout(() => card.classList.remove('shuffling'), 300);
            });
            
            elements.gameBoard.appendChild(card);
        });
    };

    const showOverlay = (overlay) => {
        document.querySelectorAll('.overlay').forEach(o => o.classList.remove('active'));
        if (overlay) {
            overlay.classList.add('active');
        }
    };

    const toggleTheme = () => {
        document.body.classList.toggle('light-mode');
        const isLightMode = document.body.classList.contains('light-mode');
        elements.themeToggleBtn.innerHTML = isLightMode ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
    };

    // Initialize theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Statistics functions
    const formatTime = (milliseconds) => {
        if (!milliseconds) return '0m';
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const displayStats = () => {
        if (!window.gameAnalytics) {
            console.warn('Analytics not available');
            return;
        }

        const stats = window.gameAnalytics.getStats();
        const detailed = window.gameAnalytics.getDetailedStats();

        // Update main stats
        document.getElementById('total-games').textContent = stats.gamesPlayed || 0;
        document.getElementById('total-alphagrams').textContent = stats.totalAlphagramsSeen || 0;
        document.getElementById('best-score').textContent = stats.bestScore || 0;
        document.getElementById('average-first-attempt-score').textContent = stats.averageFirstAttemptScore || 0;
        document.getElementById('average-final-score').textContent = stats.averageFinalScore || 0;

        // Update word length accuracy bars
        updateWordLengthAccuracy(stats);

        // Update recent games
        const recentGamesContainer = document.getElementById('recent-games-list');
        if (stats.recentGames && stats.recentGames.length > 0) {
            recentGamesContainer.innerHTML = stats.recentGames.map(game => `
                <div class="game-item">
                    <div class="game-info">
                        <div class="game-date">${formatDate(game.date)}</div>
                        <div class="game-details">
                            ${game.wordLength}-letter words • ${game.correctFirst}/${game.alphagramCount} first attempt
                        </div>
                    </div>
                    <div class="game-scores">
                        <div class="score-item">
                            <span class="score-label">First:</span>
                            <span class="score-value">${game.firstAttemptScore || 0}</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Final:</span>
                            <span class="score-value">${game.score}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            recentGamesContainer.innerHTML = '<p class="no-data">No games played yet. Start playing to see your history!</p>';
        }
    };

    const updateWordLengthAccuracy = (stats) => {
        const detailed = window.gameAnalytics.getDetailedStats();
        
        // Calculate accuracy for each word length (2, 3, 4, 5) based on individual alphagrams
        for (let length = 2; length <= 5; length++) {
            let totalAlphagrams = 0;
            let correctFirst = 0;
            
            // Use wordStats which tracks individual alphagram performance
            Object.entries(detailed.wordStats || {}).forEach(([alphagram, stats]) => {
                // Check if this alphagram is of the target length
                if (alphagram.length === length) {
                    totalAlphagrams += stats.seen;
                    correctFirst += stats.firstAttemptCorrect;
                }
            });
            
            let accuracy = 0;
            if (totalAlphagrams > 0) {
                accuracy = Math.round((correctFirst / totalAlphagrams) * 100);
            }
            
            // Update the progress bar and percentage
            const fillElement = document.getElementById(`accuracy-${length}-fill`);
            const percentElement = document.getElementById(`accuracy-${length}-percent`);
            
            if (fillElement && percentElement) {
                fillElement.style.width = `${accuracy}%`;
                percentElement.textContent = `${accuracy}%`;
                
            }
        }
    };

    const showStatsModal = () => {
        displayStats();
        showOverlay(elements.statsModal);
    };

    const exportStats = () => {
        if (!window.gameAnalytics) return;
        
        const data = window.gameAnalytics.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `shabble-stats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const clearAllStats = () => {
        if (!window.gameAnalytics) return;
        
        if (confirm('Are you sure you want to clear all your statistics? This action cannot be undone.')) {
            window.gameAnalytics.clearAllData();
            displayStats(); // Refresh the display
            alert('All statistics have been cleared.');
        }
    };

    // Initialize auth state management
    setupAuthListeners();
    
    // Initialize game event listeners
    setupEventListeners();
    
    function setupEventListeners() {
        // Event listeners are already set up below in the existing code
        // This function exists to prevent the ReferenceError
    }
    
    // Setup authentication functions
    function setupAuthListeners() {
        // Set up auth state change listener
        authManager.onUserStateChange = (user) => {
            updateAuthUI(user);
        };
        
        // Google sign-in button
        if (elements.googleSigninBtn) {
            elements.googleSigninBtn.addEventListener('click', async () => {
                const result = await authManager.signInWithGoogle();
                if (!result.success) {
                    console.error('Sign-in failed:', result.error);
                    // You could show an error message to the user here
                }
            });
        }
        
        // Sign-out button
        if (elements.signoutBtn) {
            elements.signoutBtn.addEventListener('click', async () => {
                const result = await authManager.signOutUser();
                if (!result.success) {
                    console.error('Sign-out failed:', result.error);
                }
            });
        }
    }
    
    function updateAuthUI(user) {
        if (user) {
            // User is signed in
            elements.signedOutView.classList.add('hidden');
            elements.signedInView.classList.remove('hidden');
            
            // Update user info
            if (elements.userAvatar && user.photoURL) {
                elements.userAvatar.src = user.photoURL;
                elements.userAvatar.style.display = 'block';
            }
            
            if (elements.userName) {
                elements.userName.textContent = user.displayName || 'User';
            }
        } else {
            // User is signed out
            elements.signedOutView.classList.remove('hidden');
            elements.signedInView.classList.add('hidden');
        }
    }

    // Set initial random quote
    setRandomQuote();



    // --- Game Logic Integration ---

    const startGame = async (selectedLengths) => {
        const initialState = await game.startNewGame(selectedLengths);
        
        if (!initialState) {
            console.error('Failed to start game');
            return;
        }

        // Track game start in analytics
        if (window.gameAnalytics) {
            window.gameAnalytics.trackGameStart(selectedLengths, initialState.alphagrams);
        }

        renderGameBoard(initialState.alphagrams);
        elements.gameBoard.style.display = 'grid';
        updateTimerDisplay(initialState.timeLeft);

        showOverlay(null); // Hide home screen
        
        // Show the game screen
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.classList.remove('hidden');
        }
        
        elements.timerDisplay.classList.remove('hidden');
        elements.extraTimeBtn.classList.remove('hidden');
        elements.headerFinalScore.classList.add('hidden');
        
        // Enable game control buttons
        elements.doneBtn.disabled = false;
        elements.extraTimeBtn.disabled = false;
        
        // Reset extra time button to initial state
        elements.extraTimeBtn.innerHTML = '<i class="fas fa-clock"></i> <span class="btn-text">+30s</span>';
        
        // Set up timer update callback
        game.onTimeUpdate = updateTimerDisplay;
    };

    const startSecondAttempt = () => {
        const result = game.startSecondAttempt();
        if (!result.success) {
            console.error('Failed to start second attempt:', result.message);
            return;
        }

        showOverlay(null); // Hide game over modal
        updateTimerDisplay(result.timeLeft);
        elements.doneBtn.disabled = false;

        // Re-evaluate the board for the second attempt
        const gameState = game.getGameState();
        gameState.alphagrams.forEach(alphagramData => {
            const card = elements.gameBoard.querySelector(`[data-alphagram="${alphagramData.alphagram}"]`);
            if (!card) return;
            const input = card.querySelector('.answer-input');

            if (alphagramData.score === 10) {
                // Correctly answered cards are locked and highlighted green
                card.classList.remove('incorrect', 'partial');
                card.classList.add('correct');
                input.disabled = true;
            } else {
                // Incorrectly answered cards are reset for another try
                card.classList.remove('correct', 'partial');
                card.classList.add('incorrect');
                input.disabled = false;
                // The user's previous incorrect answer is preserved in the input field
            }
        });

        announce('Second attempt started. You have 60 seconds.');
    };

    const endGame = async () => {
        const userAnswers = getUserAnswers();
        const results = await game.endGame(userAnswers);
        if (!results) {
            alert('Failed to submit results. Please check your connection.');
            return;
        }

        // Track analytics for first or second attempt
        if (window.gameAnalytics) {
            if (results.isSecondAttempt) {
                window.gameAnalytics.trackSecondAttempt(results);
            } else {
                window.gameAnalytics.trackFirstAttempt(results);
            }
        }
        
        // Calculate score percentage and set dynamic message
        const maxPossibleScore = 200; // 20 alphagrams × 10 points each
        const scorePercentage = (results.score / maxPossibleScore) * 100;
        
        let congratsMessage;
        if (scorePercentage >= 75) {
            congratsMessage = "Great job!";
        } else if (scorePercentage > 50) {
            congratsMessage = "Good job! You're on the right track";
        } else {
            congratsMessage = "Well tried! Better luck next time";
        }
        
        if (results.isSecondAttempt) {
            elements.gameOverMessage.innerHTML = `Game Over! <br><br>Initial Score: ${Math.round(results.initialScore)}<br>Second Attempt Score: <span id="final-score">${Math.round(results.score)}</span>`;
            elements.secondAttemptBtn.classList.add('visually-hidden');
        } else {
            elements.gameOverMessage.innerHTML = `${congratsMessage}<br><br>Your score is <span id="final-score">${Math.round(results.score)}</span>.`;

            elements.secondAttemptBtn.classList.remove('visually-hidden');
        }

        // Show game over modal
        showOverlay(elements.gameOverModal);
        announce(`Game over. Your final score is ${Math.round(results.score)}.`);

        // Disable game buttons
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = true);

        // Show results on the board only after the second attempt
        if (results.isSecondAttempt && results.results) {
            results.results.forEach(result => {
                const card = elements.gameBoard.querySelector(`[data-alphagram="${result.alphagram}"]`);
                if (!card) return; // Card might not be on the board if the game resets quickly
                const input = card.querySelector('.answer-input');
                input.value = result.userInput;
                input.disabled = true;

                
                card.classList.remove('correct', 'incorrect', 'partial', 'blank');
                if (result.isCorrect === true) card.classList.add('correct');
                else if (result.isCorrect === false) card.classList.add('incorrect');
                else if (result.isCorrect === 'partial') card.classList.add('partial');
                else if (result.isCorrect === 'blank') card.classList.add('blank');
            });
            reviewAnswers();
        }
    };

    const endGameDueToTimeout = async () => {
        const userAnswers = getUserAnswers();
        const results = await game.endGame(userAnswers);
        if (!results) {
            alert('Failed to submit results. Please check your connection.');
            return;
        }
        
        // Track analytics for first or second attempt
        if (window.gameAnalytics) {
            if (results.isSecondAttempt) {
                window.gameAnalytics.trackSecondAttempt(results);
            } else {
                window.gameAnalytics.trackFirstAttempt(results);
            }
        }
        
        // Calculate score percentage and set dynamic message
        const maxPossibleScore = 200; // 20 alphagrams × 10 points each
        const scorePercentage = (results.score / maxPossibleScore) * 100;
        
        let congratsMessage;
        if (scorePercentage >= 75) {
            congratsMessage = "Great job!";
        } else if (scorePercentage > 50) {
            congratsMessage = "Good job! You're on the right track";
        } else {
            congratsMessage = "Well tried! Better luck next time";
        }
        
        // Set timeout-specific message
        const timeoutMessage = "You ran out of time! Next time you can buy an extra 30 seconds at a cost of 25 points";
        
        if (results.isSecondAttempt) {
            elements.gameOverMessage.innerHTML = `${timeoutMessage}<br><br>Initial Score: ${Math.round(results.initialScore)}<br>Second Attempt Score: <span id="final-score">${Math.round(results.score)}</span>`;
            elements.secondAttemptBtn.classList.add('visually-hidden');
        } else {
            elements.gameOverMessage.innerHTML = `${timeoutMessage}<br><br>Your score is <span id="final-score">${Math.round(results.score)}</span>.`;
            elements.secondAttemptBtn.classList.remove('visually-hidden');
        }

        // Show game over modal
        showOverlay(elements.gameOverModal);
        announce(`Time's up! Your final score is ${Math.round(results.score)}.`);

        // Disable game buttons
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = true);

        // Show results on the board only after the second attempt
        if (results.isSecondAttempt && results.results) {
            results.results.forEach(result => {
                const card = elements.gameBoard.querySelector(`[data-alphagram="${result.alphagram}"]`);
                if (!card) return;
                const input = card.querySelector('.answer-input');
                input.value = result.userInput;
                input.disabled = true;

                // Apply styling based on correctness
                if (result.isCorrect === true) {
                    card.classList.add('correct');
                } else if (result.isCorrect === false) {
                    card.classList.add('incorrect');
                } else if (result.isCorrect === 'partial') {
                    card.classList.add('partial');
                }
            });
            reviewAnswers();
        }
    };

    const reviewAnswers = () => {
        showOverlay(null); // Hide the overlay to show the board
        
        // Make sure game board is visible
        elements.gameBoard.style.display = 'grid';

        // Get final score and display it in the header
        const finalScore = Math.round(game.getGameState().score);
        elements.headerFinalScore.textContent = `Score: ${finalScore}`;
        elements.headerFinalScore.classList.remove('hidden');

        // Hide in-game controls
        elements.timerDisplay.classList.add('hidden');
        elements.extraTimeBtn.classList.add('hidden');

        // Apply highlighting and enable hover functionality
        const gameState = game.getGameState();
        if (gameState.lastResults) {
            gameState.lastResults.forEach(result => {
                const card = elements.gameBoard.querySelector(`[data-alphagram="${result.alphagram}"]`);
                if (!card) return;
                
                // Apply color highlighting based on correctness
                card.classList.remove('correct', 'incorrect', 'partial', 'blank');
                if (result.isCorrect === true) card.classList.add('correct');
                else if (result.isCorrect === false) card.classList.add('incorrect');
                else if (result.isCorrect === 'partial') card.classList.add('partial');
                else if (result.isCorrect === 'blank') card.classList.add('blank');
                
                // Set up hover functionality for answer cards
                setupAnswerCardListeners(card, result);
            });
        }
    };

    // Get user answers from the game board
    const getUserAnswers = () => {
        const answers = {};
        const cards = document.querySelectorAll('.alphagram-card');
        cards.forEach(card => {
            const alphagram = card.dataset.alphagram;
            const input = card.querySelector('.answer-input');
            answers[alphagram] = input ? input.value.trim() : '';
        });
        return answers;
    };

    // Show instructions overlay
    const showInstructions = () => {
        elements.instructions.classList.add('active');
    };

    elements.playAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Hide game over modal
        showOverlay(null);

        // Hide game screen and show start screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('active');
        elements.startScreen.classList.remove('hidden');
        elements.startScreen.classList.add('active');
        
        // Clear the board for the next game
        elements.gameBoard.innerHTML = '';

        setRandomQuote();
    });
    elements.playAgainHeaderBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Hide game screen and show start screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('active');
        elements.startScreen.classList.remove('hidden');
        elements.startScreen.classList.add('active');

        // If game is running, end it.
        if (game.getGameState().isPlaying) {
            game.endGame(); // This will also clear the board via its own logic.
        } else {
            elements.gameBoard.innerHTML = ''; // Clear the board if game wasn't running
        }
        
        setRandomQuote();
    });

    elements.instructionsBtn.addEventListener('click', showInstructions);

    elements.headerInstructionsBtn.addEventListener('click', () => {
        if (game.getGameState().isPlaying) {
            game.pauseGame();
            showInstructions();
        }
    });

    // Feedback button event listener
    if (elements.feedbackBtn) {
        elements.feedbackBtn.addEventListener('click', () => {
            showOverlay(elements.feedbackModal);
        });
    }

    // Close feedback modal
    if (elements.closeFeedbackModal) {
        elements.closeFeedbackModal.addEventListener('click', () => {
            showOverlay(null);
        });
    }

    if (elements.backBtn) {
        elements.backBtn.addEventListener('click', () => {
            elements.instructions.classList.remove('active');
            if (game.getGameState().isPlaying) {
                game.resumeGame();
            }
        });
    }


    // Game over modal close button (Review Answers)
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            showOverlay(null); // Hide the modal
            reviewAnswers(); // Show the final board state

            // Ensure the correct buttons are visible post-game
            const gameState = game.getGameState();
            if (!gameState.isSecondAttempt) {
                elements.secondAttemptBtn.classList.remove('visually-hidden');
            }
        });
    }

    // --- Answer Card Overlay Logic ---

    function setupAnswerCardListeners(card, result) {
        card.dataset.correctWords = result.validWords.join(', ') || 'None';
        card.dataset.score = Math.round(result.score);

        let hideTimeout;

        const showOverlay = (e) => {
            clearTimeout(hideTimeout);
            if (document.getElementById(`overlay-${card.dataset.alphagram}`)) return;

            const cardRect = card.getBoundingClientRect();
            const overlay = document.createElement('div');
            overlay.id = `overlay-${card.dataset.alphagram}`;
            overlay.className = 'answer-card-overlay';

            overlay.innerHTML = `
                <div class="correct-words">${card.dataset.correctWords}</div>
                <div class="final-score">Score: ${card.dataset.score}</div>
            `;

            overlay.style.left = `${cardRect.left}px`;
            overlay.style.top = `${cardRect.top}px`;
            overlay.style.width = `${cardRect.width}px`;
            overlay.style.height = `${cardRect.height}px`;

            overlay.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
            overlay.addEventListener('mouseleave', () => hideOverlay(e));

            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('visible'), 10);
        };

        const hideOverlay = (e) => {
            const overlay = document.getElementById(`overlay-${card.dataset.alphagram}`);
            if (overlay) {
                hideTimeout = setTimeout(() => {
                    overlay.classList.remove('visible');
                    setTimeout(() => overlay.remove(), 200);
                }, 50);
            }
        };

        card.addEventListener('mouseenter', showOverlay);
        card.addEventListener('mouseleave', hideOverlay);
        card.addEventListener('click', (e) => {
            const overlay = document.getElementById(`overlay-${card.dataset.alphagram}`);
            if (overlay && overlay.classList.contains('visible')) {
                const a_overlay = document.getElementById(`overlay-${card.dataset.alphagram}`);
                if (a_overlay) {
                    a_overlay.classList.remove('visible');
                    setTimeout(() => a_overlay.remove(), 200);
                }
            } else {
                showOverlay(e);
            }
        });
    }

    // Get selected word lengths from checkboxes
    function getSelectedWordLengths() {
        const checkboxes = document.querySelectorAll('.word-length-selection input[type="checkbox"]:checked');
        const selectedLengths = Array.from(checkboxes).map(cb => parseInt(cb.value));
        return selectedLengths.length > 0 ? selectedLengths : [4]; // Default to 4-letter if none selected
    }

    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            // Check if user is signed in before starting game
            if (!authManager.isSignedIn()) {
                alert('Please sign in with Google to play the game.');
                return;
            }
            
            // Get selected word lengths
            const selectedLengths = Array.from(document.querySelectorAll('.word-length-selection input[type="checkbox"]:checked'))
                .map(input => parseInt(input.value));
            
            if (selectedLengths.length === 0) {
                selectedLengths.push(4); // Default to 4-letter words
            }
            
            startGame(selectedLengths);
        });
    } else {
        console.error('Start button not found!');
    }

    if (elements.instructionsBtn) {
        elements.instructionsBtn.addEventListener('click', () => {
            showInstructions();
        });
    } else {
        console.error('Instructions button not found!');
    }

    elements.doneBtn.addEventListener('click', endGame);
    elements.secondAttemptBtn.addEventListener('click', startSecondAttempt);
    
    // Extra time button event listener
    elements.extraTimeBtn.addEventListener('click', () => {
        const result = game.useExtraTime();
        if (result.success) {
            // Disable the button after use (can only be used once) - just grey it out
            elements.extraTimeBtn.disabled = true;
        } else {
            alert(result.message);
        }
    });
    
    // Theme toggle event listener
    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Statistics event listeners
    if (elements.statsBtn) {
        elements.statsBtn.addEventListener('click', showStatsModal);
    }
    if (elements.closeStatsModal) {
        elements.closeStatsModal.addEventListener('click', () => showOverlay(null));
    }
    if (elements.exportStatsBtn) {
        elements.exportStatsBtn.addEventListener('click', exportStats);
    }
    if (elements.clearStatsBtn) {
        elements.clearStatsBtn.addEventListener('click', clearAllStats);
    }

    elements.playAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showOverlay(null);
        startGame(getSelectedWordLengths());
    });

    // --- Authentication Event Handlers ---
    
    // Set up auth state change handler
    authManager.onUserStateChange = (user) => {
        updateAuthUI(user);
    };

    function showProfileSetupModal() {
        elements.profileSetupModal.classList.remove('hidden');
        elements.profileSetupModal.classList.add('active');
        
        // Focus on nickname input
        setTimeout(() => {
            elements.nicknameInput.focus();
        }, 100);
    }

    function hideProfileSetupModal() {
        elements.profileSetupModal.classList.add('hidden');
        elements.profileSetupModal.classList.remove('active');
    }

    // Set up profile setup handler
    authManager.onProfileSetupNeeded = (user) => {
        showProfileSetupModal();
    };

    // Google sign-in
    if (elements.googleSigninBtn) {
        elements.googleSigninBtn.addEventListener('click', async () => {
            authManager.signIn();
        });
    } else {
    }

    // Sign out
    elements.signoutBtn.addEventListener('click', async () => {
        const result = await authManager.signOutUser();
        if (!result.success) {
            console.error('Sign-out failed:', result.error);
        }
    });

    // Profile setup form submission
    elements.profileSetupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nickname = elements.nicknameInput.value.trim();
        const country = elements.countrySelect.value;
        
        try {
            const result = await authManager.completeProfileSetup(nickname, country);
            
            if (result.success) {
                hideProfileSetupModal();
                const currentUser = authManager.getCurrentUser();
                updateAuthUI(currentUser);
                updateHeaderPlayerInfo(currentUser);
                
                // After profile setup, show the start screen so user can select word lengths
                elements.startScreen.classList.add('active');
            } else {
                showProfileSetupError(result.error);
            }
        } catch (error) {
            showProfileSetupError('An unexpected error occurred: ' + error.message);
        }
    });

    function showProfileSetupError(message) {
        clearProfileError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'profile-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            text-align: center;
        `;
        
        elements.profileSetupForm.insertBefore(errorDiv, elements.profileSetupForm.querySelector('.form-actions'));
    }

    function clearProfileError() {
        const existingError = elements.profileSetupForm.querySelector('.profile-error');
        if (existingError) {
            existingError.remove();
        }
    }

    function updateAuthUI(user) {
        if (user) {
            // User is signed in
            elements.signedOutView.classList.add('hidden');
            elements.signedInView.classList.remove('hidden');
            
            // Enable start game button
            elements.startBtn.disabled = false;
            elements.startBtn.style.opacity = '1';
            elements.startBtn.style.cursor = 'pointer';
            
            // Update user info
            const profile = authManager.getCurrentUserProfile();
            
            if (profile && profile.nickname) {
                elements.userName.textContent = profile.nickname;
            } else {
                const displayName = authManager.getUserDisplayName();
                elements.userName.textContent = displayName;
            }
            
            const photoURL = authManager.getUserPhotoURL();
            if (photoURL) {
                elements.userAvatar.src = photoURL;
                elements.userAvatar.style.display = 'block';
            } else {
                elements.userAvatar.style.display = 'none';
            }
            
            // Update header player info
            updateHeaderPlayerInfo(user);
        } else {
            // User is signed out
            elements.signedOutView.classList.remove('hidden');
            elements.signedInView.classList.add('hidden');
            
            // Hide header player info
            elements.headerPlayerInfo.classList.add('hidden');
            
            // Disable start game button
            elements.startBtn.disabled = true;
            elements.startBtn.style.opacity = '0.5';
            elements.startBtn.style.cursor = 'not-allowed';
        }
    }

    // Handle answer submission on input change
    elements.gameBoard.addEventListener('change', (e) => {
        if (e.target.classList.contains('answer-input')) {
            const card = e.target.closest('.alphagram-card');
            const alphagram = card.dataset.alphagram;
            const answer = e.target.value;
            game.submitAnswer(alphagram, answer);
            
            // Remove amber glow when player fills in an answer
            if (answer.trim() !== '') {
                card.classList.remove('unanswered-warning');
            }
        }
    });

    // Also handle real-time input to remove glow immediately
    elements.gameBoard.addEventListener('input', (e) => {
        if (e.target.classList.contains('answer-input')) {
            const card = e.target.closest('.alphagram-card');
            const answer = e.target.value;
            
            // Remove amber glow as soon as user starts typing
            if (answer.trim() !== '') {
                card.classList.remove('unanswered-warning');
            } else {
                // Re-add glow if they clear the input and time <= 30s
                const gameState = game.getGameState();
                if (gameState.timeLeft <= 30) {
                    card.classList.add('unanswered-warning');
                }
            }
        }
    });

    // --- Edit Profile Functions ---
    
    function showEditProfileModal() {
        const profile = authManager.getCurrentUserProfile();
        if (!profile) return;
        
        // Pre-fill current values
        elements.editNicknameInput.value = profile.nickname || '';
        elements.editCountrySelect.value = profile.country || '';
        
        elements.editProfileModal.classList.remove('hidden');
        elements.editProfileModal.classList.add('active');
        
        // Focus on nickname input
        setTimeout(() => {
            elements.editNicknameInput.focus();
        }, 100);
    }

    function hideEditProfileModal() {
        elements.editProfileModal.classList.add('hidden');
        elements.editProfileModal.classList.remove('active');
    }

    // Header click handlers for editing profile
    elements.headerCountryFlag.addEventListener('click', () => {
        if (authManager.isSignedIn()) {
            showEditProfileModal();
        }
    });

    elements.headerNickname.addEventListener('click', () => {
        if (authManager.isSignedIn()) {
            showEditProfileModal();
        }
    });

    // Edit profile form submission
    elements.editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nickname = elements.editNicknameInput.value.trim();
        const country = elements.editCountrySelect.value;
        
        const result = await authManager.completeProfileSetup(nickname, country);
        
        if (result.success) {
            hideEditProfileModal();
            updateAuthUI(authManager.getCurrentUser());
            updateHeaderPlayerInfo(authManager.getCurrentUser());
        } else {
            // Show error message in edit modal
            showEditProfileError(result.error);
        }
    });

    // Cancel edit profile
    elements.cancelEditBtn.addEventListener('click', () => {
        hideEditProfileModal();
    });

    function showEditProfileError(message) {
        // Clear any existing error
        clearEditProfileError();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'edit-profile-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            text-align: center;
        `;
        
        elements.editProfileForm.insertBefore(errorDiv, elements.editProfileForm.querySelector('.form-actions'));
    }

    function clearEditProfileError() {
        const existingError = elements.editProfileForm.querySelector('.edit-profile-error');
        if (existingError) {
            existingError.remove();
        }
    }
});
