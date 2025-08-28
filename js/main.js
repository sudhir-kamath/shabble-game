import { game } from './game.js';
import { initializeAlphagramMaps } from './dictionary.js';
import { authManager } from './auth.js';


document.addEventListener('DOMContentLoaded', function() {
    // Initialize alphagram maps for all word lengths
    initializeAlphagramMaps();
    
    // Get DOM elements
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
        cancelEditBtn: document.getElementById('cancel-edit-btn')
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

    elements.themeToggleBtn.addEventListener('click', toggleTheme);


    // --- Game Logic Integration ---

    const startGame = () => {
        
        // Hide start screen
        elements.startScreen.classList.remove('active');
        elements.startScreen.classList.add('hidden');
        
        // Show game screen
        const gameScreen = document.getElementById('game-screen');
        gameScreen.classList.remove('hidden');
        gameScreen.classList.add('active');
        
        // Get selected word lengths
        const selectedLengths = getSelectedWordLengths();
        
        // Set random motivational quote
        setRandomQuote();
        
        const initialState = game.startNewGame(selectedLengths);
        renderGameBoard(initialState.alphagrams);
        elements.gameBoard.style.display = 'grid'; // Make sure game board is visible
        updateTimerDisplay(initialState.timeLeft); // Initial timer display with correct time

        // Show header elements for game
        elements.timerDisplay.classList.remove('hidden');
        elements.doneBtn.disabled = false;
        elements.extraTimeBtn.disabled = false;
        elements.extraTimeBtn.classList.remove('hidden');

        // Reset button states
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = false);

        // --- Final Setup ---
        game.onTimeUpdate = updateTimerDisplay; // Hook up timer updates
        announce('Game started. Good luck!');
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
                // Correctly answered cards are locked
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

    const endGame = () => {
        const results = game.endGame();
        
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
        if (results.isSecondAttempt) {
            results.alphagrams.forEach(result => {
                const card = elements.gameBoard.querySelector(`[data-alphagram="${result.alphagram}"]`);
                if (!card) return; // Card might not be on the board if the game resets quickly
                const input = card.querySelector('.answer-input');
                input.value = result.userInput;
                input.disabled = true;

                card.classList.remove('correct', 'incorrect', 'partial');
                if (result.isCorrect === true) card.classList.add('correct');
                else if (result.isCorrect === false) card.classList.add('incorrect');
                else if (result.isCorrect === 'partial') card.classList.add('partial');

                // Setup the answer card overlay for this card
                setupAnswerCardListeners(card, result);
            });
        }
    };

    const endGameDueToTimeout = () => {
        const results = game.endGame();
        
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
            elements.gameOverMessage.innerHTML = `Time's up! <br><br>Initial Score: ${Math.round(results.initialScore)}<br>Second Attempt Score: <span id="final-score">${Math.round(results.score)}</span>`;
            elements.secondAttemptBtn.classList.add('visually-hidden');
        } else {
            elements.gameOverMessage.innerHTML = `You ran out of time! You can try again with a 60-second timer.<br><br>Your score is <span id="final-score">${Math.round(results.score)}</span>.`;

            elements.secondAttemptBtn.classList.remove('visually-hidden');
        }

        // Show game over modal
        showOverlay(elements.gameOverModal);
        announce(`Time's up! Your final score is ${Math.round(results.score)}.`);

        // Disable game buttons
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = true);

        // Show results on the board only after the second attempt
        if (results.isSecondAttempt) {
            results.alphagrams.forEach(result => {
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

                // Setup the answer card overlay for this card
                setupAnswerCardListeners(card, result);
            });
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
    };

    // --- Helper Functions ---
    
    const showInstructions = () => {
        elements.instructions.classList.add('active');
    };

    // --- Event Listeners ---
    

    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            // Check if user is signed in before starting game
            if (!authManager.isSignedIn()) {
                alert('Please sign in with Google to play the game.');
                return;
            }
            setRandomQuote();
            startGame();
        });
    } else {
    }

    if (elements.instructionsBtn) {
        elements.instructionsBtn.addEventListener('click', showInstructions);
    } else {
    }
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
        const selectedLengths = [];
        for (const [length, checkbox] of Object.entries(elements.lengthCheckboxes)) {
            if (checkbox.checked) {
                selectedLengths.push(parseInt(length));
            }
        }
        return selectedLengths.length > 0 ? selectedLengths : [4]; // Default to 4-letter if none selected
    }


    elements.doneBtn.addEventListener('click', endGame);
    elements.secondAttemptBtn.addEventListener('click', startSecondAttempt);
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    elements.extraTimeBtn.addEventListener('click', () => {
        const result = game.useExtraTime();
        if (result.success) {
            updateTimerDisplay(result.newTimeLeft);
            elements.extraTimeBtn.disabled = true; // Disable after use
            announce('30 seconds added. 25 points deducted.');
        }
    });

    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        toggleTheme();
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
    elements.googleSigninBtn.addEventListener('click', async () => {
        const result = await authManager.signInWithGoogle();
        if (!result.success) {
            console.error('Sign-in failed:', result.error);
            // Could show error message to user here
        }
    });

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
