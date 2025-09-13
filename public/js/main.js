import { game } from './game.js';
import { authManager } from './auth.js';

// Make authManager globally accessible
window.authManager = authManager;


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
        homeStatsBtn: document.getElementById('home-stats-btn'),
        statsModal: document.getElementById('stats-modal'),
        closeStatsModal: document.getElementById('close-stats-modal'),
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
        closeFeedbackModal: document.getElementById('close-feedback-modal'),
        // Advanced Statistics elements
        advancedStatsBtn: document.getElementById('advanced-stats-btn'),
        advancedStatsModal: document.getElementById('advanced-stats-modal'),
        closeAdvancedStatsModal: document.getElementById('close-advanced-stats-modal')
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
        if (!dateString) {
            return 'Unknown Date';
        }
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date string:', dateString);
            return 'Invalid Date';
        }
        
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    // Fetch stats directly from server for display
    const fetchServerStats = async (firebaseUid) => {
        try {
            const sessionToken = localStorage.getItem('shabble_session_token');
            if (!sessionToken) {
                return null;
            }

            const response = await fetch(`/api/analytics/user/${firebaseUid}/stats?sessionToken=${encodeURIComponent(sessionToken)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                return result.stats;
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    };

    // Recent games are included in the user stats response, so we don't need a separate endpoint

    const displayStats = async () => {
        // Check if user is signed in to fetch server data
        if (window.authManager?.isSignedIn()) {
            const user = window.authManager.getCurrentUser();
            if (user?.uid) {
                
                // Fetch server stats (includes recent games)
                const serverStats = await fetchServerStats(user.uid);

                if (serverStats) {
                    displayServerStats(serverStats, serverStats.recentGames || []);
                    return;
                }
            }
        }

        // Fallback to local data if server fetch fails or user not signed in
        if (window.gameAnalytics) {
            const stats = window.gameAnalytics.getStats();
            displayLocalStats(stats);
        } else {
            displayEmptyStats();
        }
    };

    const displayServerStats = (serverStats, recentGames = []) => {
        
        // Update main stats with server data
        document.getElementById('total-games').textContent = serverStats.total_games || 0;
        
        const correctlySolved = serverStats.alphagrams_solved || 0;
        const totalPresented = serverStats.total_alphagrams || 0;
        const percentage = totalPresented > 0 ? Math.round((correctlySolved / totalPresented) * 100) : 0;
        document.getElementById('total-alphagrams').textContent = `${correctlySolved} (${percentage}%)`;
        
        document.getElementById('best-score').textContent = serverStats.best_score || 0;
        document.getElementById('average-first-attempt-score').textContent = Math.round(serverStats.average_score || 0);
        document.getElementById('average-final-score').textContent = Math.round(serverStats.average_score || 0);

        // Update recent games with server data
        const recentGamesContainer = document.getElementById('recent-games-list');
        if (recentGames && recentGames.length > 0) {
            recentGamesContainer.innerHTML = recentGames.map(game => {
                const gameDate = game.date || game.session_start || game.created_at;
                const wordLengthDisplay = game.word_lengths ? 
                    (typeof game.word_lengths === 'string' ? JSON.parse(game.word_lengths).join(',') : game.word_lengths.join(',')) : 
                    'mixed';
                const correctlySolved = game.alphagrams_solved || 0;
                const totalAlphagrams = game.total_alphagrams || 0;
                const firstScore = game.first_attempt_score || 0;
                const finalScore = game.final_score || 0;
                
                return `
                <div class="game-item">
                    <div class="game-info">
                        <div class="game-date">${formatDate(gameDate)}</div>
                        <div class="game-details">
                            ${wordLengthDisplay}-letter words • ${correctlySolved}/${totalAlphagrams} solved
                        </div>
                    </div>
                    <div class="game-scores">
                        <div class="score-item">
                            <span class="score-label">First:</span>
                            <span class="score-value">${firstScore}</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Final:</span>
                            <span class="score-value">${finalScore}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            recentGamesContainer.innerHTML = '<p class="no-data">No recent games found.</p>';
        }

        // Update word length accuracy bars using server data
        updateWordLengthAccuracyFromServer(serverStats);
    };

    const displayLocalStats = (stats) => {
        
        // Update main stats
        document.getElementById('total-games').textContent = stats.gamesPlayed || 0;
        const correctlySolved = stats.totalAlphagramsCorrectlySolved || 0;
        const totalPresented = stats.totalAlphagramsPresented || 0;
        const percentage = totalPresented > 0 ? Math.round((correctlySolved / totalPresented) * 100) : 0;
        document.getElementById('total-alphagrams').textContent = `${correctlySolved} (${percentage}%)`;
        document.getElementById('best-score').textContent = stats.bestScore || 0;
        document.getElementById('average-first-attempt-score').textContent = stats.averageFirstAttemptScore || 0;
        document.getElementById('average-final-score').textContent = stats.averageFinalScore || 0;

        // Update recent games
        const recentGamesContainer = document.getElementById('recent-games-list');
        if (stats.recentGames && stats.recentGames.length > 0) {
            recentGamesContainer.innerHTML = stats.recentGames.map(game => {
                const wordLengthDisplay = Array.isArray(game.wordLength) ? game.wordLength.join(',') : game.wordLength;
                const correctFirst = game.correctFirst || 0;
                const alphagramCount = game.alphagramCount || game.alphagrams || 0;
                const firstScore = game.firstAttemptScore || 0;
                const finalScore = game.score || 0;
                
                return `
                <div class="game-item">
                    <div class="game-info">
                        <div class="game-date">${formatDate(game.date)}</div>
                        <div class="game-details">
                            ${wordLengthDisplay}-letter words • ${correctFirst}/${alphagramCount} first attempt
                        </div>
                    </div>
                    <div class="game-scores">
                        <div class="score-item">
                            <span class="score-label">First:</span>
                            <span class="score-value">${firstScore}</span>
                        </div>
                        <div class="score-item">
                            <span class="score-label">Final:</span>
                            <span class="score-value">${finalScore}</span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } else {
            recentGamesContainer.innerHTML = '<p class="no-data">No games played yet. Start playing to see your history!</p>';
        }

        // Update word length accuracy bars
        updateWordLengthAccuracy(stats);
    };

    const displayEmptyStats = () => {
        
        // Show zero values
        document.getElementById('total-games').textContent = '0';
        document.getElementById('total-alphagrams').textContent = '0 (0%)';
        document.getElementById('best-score').textContent = '0';
        document.getElementById('average-first-attempt-score').textContent = '0';
        document.getElementById('average-final-score').textContent = '0';

        // Show no games message
        const recentGamesContainer = document.getElementById('recent-games-list');
        recentGamesContainer.innerHTML = '<p class="no-data">No games played yet. Start playing to see your history!</p>';

        // Reset word length accuracy bars
        for (let length = 2; length <= 5; length++) {
            const fillElement = document.getElementById(`accuracy-${length}-fill`);
            const percentElement = document.getElementById(`accuracy-${length}-percent`);
            
            if (fillElement && percentElement) {
                fillElement.style.width = '0%';
                percentElement.textContent = '0%';
            }
        }
    };

    const updateWordLengthAccuracyFromServer = (serverStats) => {
        // Use server-provided word length accuracy data
        const wordLengthAccuracy = serverStats.wordLengthAccuracy || [];
        
        // Create a map for quick lookup
        const accuracyMap = {};
        wordLengthAccuracy.forEach(stat => {
            const accuracy = stat.total_attempts > 0 ? 
                Math.round((stat.first_attempt_correct / stat.total_attempts) * 100) : 0;
            accuracyMap[stat.word_length] = accuracy;
        });
        
        // Update each word length (2, 3, 4, 5)
        for (let length = 2; length <= 5; length++) {
            const fillElement = document.getElementById(`accuracy-${length}-fill`);
            const percentElement = document.getElementById(`accuracy-${length}-percent`);
            
            if (fillElement && percentElement) {
                const accuracy = accuracyMap[length] || 0;
                fillElement.style.width = `${accuracy}%`;
                percentElement.textContent = `${accuracy}%`;
            }
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

    const showStatsModal = async () => {
        await displayStats();
        showOverlay(elements.statsModal);
    };


    const clearAllStats = () => {
        if (!window.gameAnalytics) return;
        
        // Create custom confirmation modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'overlay active';
        confirmModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>⚠️ Clear All Statistics</h2>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to permanently delete ALL your game statistics?</p>
                    <p>This will clear:</p>
                    <ul>
                        <li>Games played</li>
                        <li>Alphagrams correctly solved</li>
                        <li>Best scores</li>
                        <li>Game history</li>
                        <li>All performance data</li>
                    </ul>
                    <p><strong>This action cannot be undone!</strong></p>
                </div>
                <div class="modal-footer">
                    <button id="confirm-clear" class="btn danger-btn">
                        <i class="fas fa-trash"></i> Yes, Clear All Data
                    </button>
                    <button id="cancel-clear" class="btn secondary-btn">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmModal);
        
        // Handle confirmation
        document.getElementById('confirm-clear').addEventListener('click', async () => {
            await window.gameAnalytics.clearAllData();
            displayStats();
            document.body.removeChild(confirmModal);
            
            // Show success message
            const successModal = document.createElement('div');
            successModal.className = 'overlay active';
            successModal.innerHTML = `
                <div class="modal">
                    <div class="modal-header">
                        <h2>✅ Statistics Cleared</h2>
                    </div>
                    <div class="modal-body">
                        <p>All statistics have been permanently cleared.</p>
                    </div>
                    <div class="modal-footer">
                        <button id="close-success" class="btn primary-btn">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(successModal);
            
            document.getElementById('close-success').addEventListener('click', () => {
                document.body.removeChild(successModal);
            });
        });
        
        // Handle cancel
        document.getElementById('cancel-clear').addEventListener('click', () => {
            document.body.removeChild(confirmModal);
        });
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
        
        // Google sign-in button (handled later in initialization)
        
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
    
    // updateAuthUI function is defined later with profile support

    // Set initial random quote
    setRandomQuote();



    // --- Game Logic Integration ---

    const startGame = async (selectedLengths) => {
        // Enforce authentication requirement
        
        if (!window.authManager || !window.authManager.isSignedIn()) {
            showAuthRequiredModal();
            return;
        }
        

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
            // Note: trackFirstAttempt() calls processCompletedGame() which handles the game record
            // No need to call finishGame() as it would create duplicates
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
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = true);

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
            // Note: trackFirstAttempt() calls processCompletedGame() which handles the game record
            // No need to call finishGame() as it would create duplicates
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
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = true);

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

        // Finish analytics session for single-attempt games before starting new game
        const gameState = game.getGameState();
        if (window.gameAnalytics && !gameState.isSecondAttempt) {
            window.gameAnalytics.finishGame(gameState);
        }

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
            
            // Finish analytics session for single-attempt games
            if (window.gameAnalytics && !gameState.isSecondAttempt) {
                window.gameAnalytics.finishGame(gameState);
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
    if (elements.homeStatsBtn) {
        elements.homeStatsBtn.addEventListener('click', showStatsModal);
    }
    if (elements.closeStatsModal) {
        elements.closeStatsModal.addEventListener('click', () => showOverlay(null));
    }
    if (elements.clearStatsBtn) {
        elements.clearStatsBtn.addEventListener('click', clearAllStats);
    }

    // Advanced Statistics event listeners
    if (elements.advancedStatsBtn) {
        elements.advancedStatsBtn.addEventListener('click', showAdvancedStatsModal);
    }
    if (elements.closeAdvancedStatsModal) {
        elements.closeAdvancedStatsModal.addEventListener('click', () => showOverlay(null));
    }

    elements.playAgainBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showOverlay(null);
        startGame(getSelectedWordLengths());
    });

    // Show authentication required modal
    function showAuthRequiredModal() {
        const authModal = document.createElement('div');
        authModal.className = 'overlay active';
        authModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>🔐 Authentication Required</h2>
                </div>
                <div class="modal-body">
                    <p>You must be signed in to play Shabble!</p>
                    <p>Please sign in with your Google account to:</p>
                    <ul>
                        <li>Track your game statistics</li>
                        <li>Save your progress and scores</li>
                        <li>Compete on leaderboards</li>
                        <li>Access all game features</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button id="auth-modal-signin" class="btn primary-btn">
                        <i class="fab fa-google"></i> Sign In with Google
                    </button>
                    <button id="auth-modal-close" class="btn secondary-btn">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(authModal);

        // Handle sign in button
        document.getElementById('auth-modal-signin').addEventListener('click', async () => {
            document.body.removeChild(authModal);
            if (window.authManager) {
                await window.authManager.signInWithGoogle();
            }
        });

        // Handle close button
        document.getElementById('auth-modal-close').addEventListener('click', () => {
            document.body.removeChild(authModal);
        });

        // Close on overlay click
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                document.body.removeChild(authModal);
            }
        });
    }

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
        elements.googleSigninBtn.addEventListener('click', async (e) => {
            // Prevent multiple clicks
            if (elements.googleSigninBtn.disabled) {
                return;
            }
            
            elements.googleSigninBtn.disabled = true;
            elements.googleSigninBtn.textContent = 'Signing in...';
            
            try {
                const result = await authManager.signInWithGoogle();
                if (!result.success) {
                    console.error('Sign-in failed:', result.error);
                    // Show error to user if needed
                }
            } finally {
                // Re-enable button
                elements.googleSigninBtn.disabled = false;
                elements.googleSigninBtn.innerHTML = '<i class="fab fa-google"></i> Sign in with Google';
            }
        });
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
            
            // Enable statistics buttons
            elements.statsBtn.disabled = false;
            elements.statsBtn.style.opacity = '1';
            elements.statsBtn.style.cursor = 'pointer';
            elements.homeStatsBtn.disabled = false;
            elements.homeStatsBtn.style.opacity = '1';
            elements.homeStatsBtn.style.cursor = 'pointer';
            
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
            
            // Disable statistics buttons
            elements.statsBtn.disabled = true;
            elements.statsBtn.style.opacity = '0.5';
            elements.statsBtn.style.cursor = 'not-allowed';
            elements.homeStatsBtn.disabled = true;
            elements.homeStatsBtn.style.opacity = '0.5';
            elements.homeStatsBtn.style.cursor = 'not-allowed';
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

    // Advanced Statistics Functions
    let membershipStatus = null;
    let advancedStatsData = null;
    let currentFilters = {
        wordLength: null
    };

    async function checkMembershipStatus() {
        if (!authManager.isSignedIn()) return false;
        
        const currentUser = authManager.getCurrentUser();
        if (!currentUser) return false;
        
        try {
            const response = await fetch(`/api/analytics/membership/${currentUser.uid}`);
            
            // Check if response is HTML (error page) instead of JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('API returned HTML instead of JSON. Response status:', response.status);
                console.error('URL:', `/api/analytics/membership/${currentUser.uid}`);
                const text = await response.text();
                console.error('Response body:', text.substring(0, 200));
                return false;
            }
            
            const data = await response.json();
            console.log('Membership API response:', data);
            membershipStatus = data;
            console.log('Is member check:', data.success && data.isMember);
            return data.success && data.isMember;
        } catch (error) {
            console.error('Error checking membership:', error);
            return false;
        }
    }

    async function showAdvancedStatsModal() {
        if (!authManager.isSignedIn()) {
            showAuthRequiredModal();
            return;
        }

        const isMember = await checkMembershipStatus();
        if (!isMember) {
            showNonMemberModal();
            return;
        }

        // Clear previous data and show empty modal
        advancedStatsData = null;
        clearAdvancedStatsDisplay();
        showOverlay(document.getElementById('advanced-stats-modal'));
        
        // Setup event listeners after a small delay to ensure DOM is ready
        setTimeout(() => {
            setupAdvancedStatsEventListeners();
        }, 100);
    }

    function showNonMemberModal() {
        const gamesNeeded = 25 - (membershipStatus?.totalGames || 0);
        const nonMemberModal = document.createElement('div');
        nonMemberModal.className = 'overlay active';
        nonMemberModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>🔒 Membership Required</h2>
                    <button class="close-btn" onclick="showOverlay(null)">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Advanced Statistics are available to members only.</p>
                    <p>You need to play <strong>${gamesNeeded} more games</strong> to become a member automatically.</p>
                    <p>Current games played: <strong>${membershipStatus?.totalGames || 0}</strong></p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${((membershipStatus?.totalGames || 0) / 25) * 100}%"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="showOverlay(null); startGame(getSelectedWordLengths())">Play Now</button>
                </div>
            </div>
        `;
        document.body.appendChild(nonMemberModal);
        setTimeout(() => nonMemberModal.remove(), 10000);
    }

    async function loadAdvancedStats() {
        console.log('loadAdvancedStats called');
        if (!authManager.isSignedIn()) {
            console.log('User not signed in');
            return;
        }

        const currentUser = authManager.getCurrentUser();
        if (!currentUser) {
            console.log('No current user');
            return;
        }

        console.log('Current filters:', currentFilters);

        if (!currentFilters.wordLength) {
            console.log('No word length selected');
            return;
        }

        try {
            const params = new URLSearchParams({
                wordLength: currentFilters.wordLength
            });
            
            console.log('Fetching:', `/api/analytics/advanced/${currentUser.uid}?${params}`);
            const response = await fetch(`/api/analytics/advanced/${currentUser.uid}?${params}`);
            const data = await response.json();
            
            console.log('Response data:', data);
            
            if (data.success) {
                advancedStatsData = data;
                showMasteryCarpet();
            } else {
                console.error('API returned error:', data);
            }
        } catch (error) {
            console.error('Error loading advanced stats:', error);
        }
    }

    function clearAdvancedStatsDisplay() {
        // Hide mastery carpet section
        const carpetSection = document.getElementById('mastery-carpet-section');
        if (carpetSection) {
            carpetSection.style.display = 'none';
        }

        // Clear mastery carpet
        const carpet = document.getElementById('mastery-carpet');
        if (carpet) {
            carpet.innerHTML = '';
        }
    }

    function showMasteryCarpet() {
        if (!advancedStatsData || !advancedStatsData.alphagrams) return;

        const carpetSection = document.getElementById('mastery-carpet-section');
        const carpet = document.getElementById('mastery-carpet');
        const carpetTitle = document.getElementById('carpet-title');

        if (!carpet || !carpetSection) return;

        // Show the carpet section
        carpetSection.style.display = 'block';
        
        // Update title with progress info using API response data
        const playedCount = advancedStatsData.playedAlphagrams;
        const totalCount = advancedStatsData.totalAlphagrams;
        const progressPercent = Math.round((playedCount / totalCount) * 100);
        
        carpetTitle.innerHTML = `<i class="fas fa-th"></i> ${currentFilters.wordLength}-Letter Mastery Carpet (${playedCount}/${totalCount} - ${progressPercent}%)`;

        // Calculate responsive grid dimensions
        const totalCells = advancedStatsData.alphagrams.length;
        const containerWidth = carpet.parentElement.clientWidth - 40; // Account for padding
        const maxCellSize = 20;
        const minCellSize = 6;
        
        // Calculate optimal columns based on container width and total cells
        let cols = Math.ceil(Math.sqrt(totalCells * 1.2));
        let cellSize = Math.floor(containerWidth / cols);
        
        // For large grids (4-5 letter words), be more aggressive with sizing
        if (totalCells > 500) {
            // For very large grids, prioritize fitting in container
            cols = Math.floor(containerWidth / minCellSize);
            cellSize = Math.floor(containerWidth / cols);
        }
        
        // Adjust if cells are too small or too large
        if (cellSize < minCellSize) {
            cellSize = minCellSize;
            cols = Math.floor(containerWidth / cellSize);
        } else if (cellSize > maxCellSize) {
            cellSize = maxCellSize;
            cols = Math.floor(containerWidth / cellSize);
        }
        
        // Ensure we don't exceed container width
        const totalWidth = cols * cellSize + (cols - 1) * Math.max(1, Math.floor(cellSize / 10));
        if (totalWidth > containerWidth) {
            cols = Math.floor(containerWidth / (cellSize + Math.max(1, Math.floor(cellSize / 10))));
        }
        
        carpet.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
        carpet.style.gap = `${Math.max(1, Math.floor(cellSize / 10))}px`;
        
        
        // Generate carpet cells with responsive sizing
        const cellsHTML = advancedStatsData.alphagrams.map((item, index) => {
            const masteryScore = item.mastery_score || 0;
            const totalAttempts = item.total_attempts || 0;
            
            
            if (totalAttempts === 0) {
                // Unplayed alphagrams: transparent/blank style
                return `
                    <div class="mastery-cell unplayed" 
                         style="width: ${cellSize}px; height: ${cellSize}px; background-color: transparent; border: 1px solid #e0e0e0; opacity: 0.3;" 
                         data-alphagram="${item.alphagram}"
                         data-score="0"
                         title="${item.alphagram}: Not yet encountered">
                    </div>
                `;
            } else {
                // Played alphagrams: color-coded by mastery score
                const backgroundColor = getMasteryColor(masteryScore);
                return `
                    <div class="mastery-cell played" 
                         style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${backgroundColor};" 
                         data-alphagram="${item.alphagram}"
                         data-score="${masteryScore}"
                         title="${item.alphagram}: ${masteryScore > 0 ? '+' : ''}${masteryScore} (${totalAttempts} attempts)">
                    </div>
                `;
            }
        }).join('');

        carpet.innerHTML = cellsHTML;
        
        // Show the "What should I work on?" button after carpet is loaded
        const workOnBtn = document.getElementById('what-to-work-on-btn');
        if (workOnBtn) {
            workOnBtn.style.display = 'inline-block';
        }
    }

    function getMasteryColor(score) {
        const colors = {
            '-3': '#8B0000', // Deep red
            '-2': '#DC143C', // Medium red  
            '-1': '#FFB6C1', // Light red
            '0': '#FFFFFF',  // White
            '1': '#90EE90',  // Light green
            '2': '#32CD32',  // Medium green
            '3': '#006400'   // Deep green
        };
        
        return colors[score.toString()] || colors['0'];
    }

    function updateFilteredResults() {
        console.log('updateFilteredResults called');
        const resultsList = document.getElementById('alphagram-results');
        console.log('Results list element:', resultsList);
        console.log('Advanced stats data:', advancedStatsData);
        console.log('Alphagrams array:', advancedStatsData?.alphagrams);
        
        if (!resultsList || !advancedStatsData?.alphagrams) {
            console.log('Early return - missing element or data');
            return;
        }

        let filteredData = advancedStatsData.alphagrams;
        console.log('Filtered data length:', filteredData.length);

        // Apply search filter
        const searchTerm = document.getElementById('alphagram-search')?.value.toLowerCase();
        if (searchTerm) {
            filteredData = filteredData.filter(item => 
                item.alphagram.toLowerCase().includes(searchTerm)
            );
        }

        const htmlContent = filteredData.map(item => `
            <div class="alphagram-bubble" data-alphagram="${item.alphagram}" onclick="toggleResultDetails('${item.alphagram}')">
                <div class="bubble-header">
                    <span class="alphagram-text">${item.alphagram}</span>
                    <span class="word-length-badge">${item.word_length}L</span>
                </div>
                <div class="bubble-stats">
                    <div class="success-rate ${item.success_rate >= 80 ? 'good' : item.success_rate >= 50 ? 'average' : 'poor'}">
                        ${item.success_rate}%
                    </div>
                    <div class="attempts-count">${item.correct_attempts}/${item.total_attempts}</div>
                </div>
                <div class="bubble-details" id="details-${item.alphagram}" style="display: none;">
                    <div class="detail-info">
                        Last: ${new Date(item.last_attempt_date).toLocaleDateString()}
                    </div>
                    <div class="detail-actions">
                        <button class="btn-mini" onclick="event.stopPropagation(); practiceAlphagram('${item.alphagram}')">Practice</button>
                        <button class="btn-mini" onclick="event.stopPropagation(); addToStudyList('${item.alphagram}')">Study</button>
                    </div>
                </div>
            </div>
        `).join('');

        console.log('Generated HTML content length:', htmlContent.length);
        console.log('First 500 chars of HTML:', htmlContent.substring(0, 500));
        
        resultsList.innerHTML = htmlContent;
        console.log('HTML set to resultsList');

        // Update result count
        const resultCount = document.getElementById('results-title');
        if (resultCount) {
            resultCount.innerHTML = `<i class="fas fa-list"></i> Alphagram Performance (${filteredData.length})`;
        }
    }

    function setupAdvancedStatsEventListeners() {
        console.log('Setting up advanced stats event listeners');
        
        const goBtn = document.getElementById('advanced-stats-go-btn');
        console.log('Go button found:', goBtn);
        
        if (goBtn) {
            goBtn.addEventListener('click', () => {
                console.log('Go button clicked!');
                loadAdvancedStats();
            });
        }
        
        // Setup "What should I work on?" button
        const workOnBtn = document.getElementById('what-to-work-on-btn');
        if (workOnBtn) {
            workOnBtn.addEventListener('click', () => {
                showWorkOnRecommendations();
            });
        }
        
        // Word length filter buttons
        document.querySelectorAll('.filter-btn[data-word-length]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const wordLength = e.target.dataset.wordLength;
                
                // Update active state
                const siblingButtons = e.target.parentNode.querySelectorAll('.filter-btn');
                siblingButtons.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // Update filter
                currentFilters.wordLength = wordLength;
                
                // Enable/disable go button
                const goBtn = document.getElementById('advanced-stats-go-btn');
                if (goBtn) {
                    goBtn.disabled = !wordLength;
                }
            });
        });
    }

    // Show work on recommendations
    function showWorkOnRecommendations() {
        if (!advancedStatsData?.alphagrams) {
            console.log('No advanced stats data available');
            return;
        }
        
        console.log('Total alphagrams:', advancedStatsData.alphagrams.length);
        
        // Debug: Check distribution of attempts and mastery scores
        const attemptCounts = {};
        const masteryCounts = {};
        advancedStatsData.alphagrams.forEach(item => {
            attemptCounts[item.total_attempts] = (attemptCounts[item.total_attempts] || 0) + 1;
            masteryCounts[item.mastery_score] = (masteryCounts[item.mastery_score] || 0) + 1;
        });
        console.log('Attempt distribution:', attemptCounts);
        console.log('Mastery score distribution:', masteryCounts);
        
        // Find alphagrams with >2 attempts and mastery score of -3 or -2
        let problemAlphagrams = advancedStatsData.alphagrams.filter(item => {
            return item.total_attempts > 2 && (item.mastery_score === -3 || item.mastery_score === -2);
        });
        
        console.log('Problem alphagrams found (strict):', problemAlphagrams.length);
        
        // If no strict matches, try relaxed criteria
        if (problemAlphagrams.length === 0) {
            console.log('No strict matches, trying relaxed criteria...');
            problemAlphagrams = advancedStatsData.alphagrams.filter(item => {
                return item.total_attempts >= 2 && item.mastery_score < 0;
            });
            console.log('Relaxed criteria matches:', problemAlphagrams.length);
        }
        
        console.log('Final problem alphagrams to display:', problemAlphagrams.length);
        
        // Debug: Log all encountered alphagrams
        const encounteredAlphagrams = advancedStatsData.alphagrams.filter(item => item.total_attempts > 0);
        console.log('=== ENCOUNTERED ALPHAGRAMS DEBUG ===');
        console.log('Total alphagrams in data:', advancedStatsData.alphagrams.length);
        console.log('Encountered count:', encounteredAlphagrams.length);
        console.log('Encountered alphagrams list:', encounteredAlphagrams.map(item => item.alphagram).sort());
        
        // Sort by worst mastery score first, then by most attempts
        problemAlphagrams.sort((a, b) => {
            if (a.mastery_score !== b.mastery_score) {
                return a.mastery_score - b.mastery_score; // -3 comes before -2
            }
            return b.total_attempts - a.total_attempts; // More attempts first
        });
        
        const workOnSection = document.getElementById('work-on-recommendations');
        const workOnCards = document.getElementById('work-on-cards');
        const overflowDiv = document.getElementById('work-on-overflow');
        
        console.log('DOM elements found:', {
            workOnSection: !!workOnSection,
            workOnCards: !!workOnCards,
            overflowDiv: !!overflowDiv
        });
        
        if (!workOnSection || !workOnCards || !overflowDiv) {
            console.log('Work on elements not found - missing DOM elements');
            return;
        }
        
        // Show overflow message if more than 50
        const hasOverflow = problemAlphagrams.length > 50;
        const displayAlphagrams = problemAlphagrams.slice(0, 50);
        
        overflowDiv.style.display = hasOverflow ? 'block' : 'none';
        
        // Generate cards or show no results message
        console.log('About to display alphagrams. Count:', displayAlphagrams.length);
        console.log('First alphagram data:', displayAlphagrams[0]);
        
        if (displayAlphagrams.length === 0) {
            console.log('Displaying no results message');
            workOnCards.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-color); opacity: 0.7;">
                    <i class="fas fa-trophy" style="font-size: 3em; margin-bottom: 20px; color: var(--success);"></i>
                    <h3>Great job! No alphagrams need immediate attention.</h3>
                    <p>You don't have any alphagrams with 3+ attempts and poor mastery scores.</p>
                    <p>Keep playing to encounter more challenging alphagrams!</p>
                </div>
            `;
        } else {
            console.log('Generating cards for alphagrams');
            const cardsHTML = displayAlphagrams.map(item => {
                const successRate = item.total_attempts > 0 ? Math.round((item.correct_attempts / item.total_attempts) * 100) : 0;
                const masteryScore = Math.max(-3, Math.min(3, item.mastery_score || 0));
                
                return `
                    <div class="work-on-card" data-mastery="${masteryScore}" title="Mastery: ${masteryScore}">
                        <div class="alphagram-name">${item.alphagram}</div>
                        <div class="performance-stats">
                            <span>
                                <div class="stat-label">Attempts</div>
                                <div class="stat-value">${item.total_attempts}</div>
                            </span>
                            <span>
                                <div class="stat-label">Success</div>
                                <div class="stat-value">${successRate}%</div>
                            </span>
                        </div>
                    </div>
                `;
            }).join('');
            
            console.log('Setting workOnCards innerHTML. HTML length:', cardsHTML.length);
            console.log('First 200 chars of HTML:', cardsHTML.substring(0, 200));
            workOnCards.innerHTML = cardsHTML;
            console.log('After setting innerHTML, workOnCards children count:', workOnCards.children.length);
        }
        
        workOnSection.style.display = 'block';
        
        // Scroll to the recommendations
        workOnSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function toggleResultDetails(alphagram) {
        const details = document.getElementById(`details-${alphagram}`);
        const icon = document.querySelector(`[data-alphagram="${alphagram}"] .expand-icon`);
        
        if (details.style.display === 'none') {
            details.style.display = 'block';
            icon.textContent = '▲';
        } else {
            details.style.display = 'none';
            icon.textContent = '▼';
        }
    }

    function practiceAlphagram(alphagram) {
        // Beta feature - show coming soon message
        alert('🚧 Practice Mode is coming soon! This feature is currently in beta development.');
    }

    function addToStudyList(alphagram) {
        // Beta feature - show coming soon message
        alert('🚧 Study List is coming soon! This feature is currently in beta development.');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Create enhanced stats modal function that includes membership checking
    const showStatsModalWithMembership = async function() {
        await showStatsModal();
        
        if (authManager.isSignedIn()) {
            const isMember = await checkMembershipStatus();
            console.log('isMember result:', isMember);
            console.log('membershipStatus:', membershipStatus);
            
            // Update the frontend game count to match backend
            if (membershipStatus && membershipStatus.totalGames !== undefined) {
                const totalGamesElement = document.getElementById('total-games');
                if (totalGamesElement) {
                    totalGamesElement.textContent = membershipStatus.totalGames;
                }
            }
            
            const advancedStatsBtn = document.getElementById('advanced-stats-btn');
            if (advancedStatsBtn) {
                advancedStatsBtn.disabled = !isMember;
                console.log('Advanced stats button disabled:', !isMember);
                advancedStatsBtn.title = isMember ? 
                    'View detailed alphagram performance statistics' : 
                    `Play ${25 - (membershipStatus?.totalGames || 0)} more games to unlock`;
                console.log('Button title:', advancedStatsBtn.title);
            }
        }
    };

    // Update event listeners to use the enhanced function
    if (elements.statsBtn) {
        elements.statsBtn.removeEventListener('click', showStatsModal);
        elements.statsBtn.addEventListener('click', showStatsModalWithMembership);
    }
    if (elements.homeStatsBtn) {
        elements.homeStatsBtn.removeEventListener('click', showStatsModal);
        elements.homeStatsBtn.addEventListener('click', showStatsModalWithMembership);
    }

    // Make functions globally available
    window.toggleResultDetails = toggleResultDetails;
    window.practiceAlphagram = practiceAlphagram;
    window.addToStudyList = addToStudyList;
});
