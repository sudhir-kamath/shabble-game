import { game } from './game.js';
import { initializeAlphagramMaps } from './dictionary.js';
import { authManager } from './auth.js';

console.log('main.js loaded successfully');

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
        finalScore: document.getElementById('final-score'),
        timerDisplay: document.getElementById('timer'),
        scoreDisplay: document.getElementById('score'),
        quoteText: document.getElementById('quote-text'),
        lengthCheckboxes: {
            2: document.getElementById('length-2'),
            3: document.getElementById('length-3'),
            4: document.getElementById('length-4')
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
        // Profile setup elements
        profileSetupModal: document.getElementById('profile-setup-modal'),
        profileSetupForm: document.getElementById('profile-setup-form'),
        nicknameInput: document.getElementById('nickname-input'),
        countrySelect: document.getElementById('country-select')
    };

    // --- UI Update Functions ---

    // Collection of pithy one-liners involving the number 4
    const fourOneliners = [
        "May the 4s be with you!",
        "Seen 4 weddings and a Funeral? Don't let the 4s kill your scrabble game",
        "Got 4 aces? That's a hand worth fighting for - but not in scrabble shabble!",
        "Spelling success, one S at a time!",
        "4 seasons in a year, but only one chance to shine",
        "Shabble is a valid word in scrabble!!",
        "4 wheels move the body, but 4 coffees move the soul!",
        "4 wheels good, 2 wheels better.. the cycle of life!"
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

        // Announce time at key intervals
        if (timeLeft === 60) announce('One minute remaining.');
        if (timeLeft === 30) announce('30 seconds remaining.');
        if (timeLeft === 10) announce('10 seconds remaining.');
    };


    const renderGameBoard = (alphagrams) => {
        elements.gameBoard.innerHTML = '';
        alphagrams.forEach(({ alphagram, length }, index) => {
            const card = document.createElement('div');
            card.className = 'alphagram-card';
            card.dataset.alphagram = alphagram;
            card.dataset.length = length || alphagram.length; // Use provided length or calculate from alphagram
            const inputId = `alphagram-input-${index}`;

            card.innerHTML = `
                <label for="${inputId}" class="alphagram">${alphagram}</label>
                <input type="text" id="${inputId}" class="answer-input" placeholder="Your answer..." autocomplete="off">
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
        console.log('Starting game...');
        
        // Get selected word lengths
        const selectedLengths = getSelectedWordLengths();
        console.log('Selected word lengths:', selectedLengths);
        
        // Set random motivational quote
        setRandomQuote();
        
        const initialState = game.startNewGame(selectedLengths);

        // --- UI Reset --- 
        elements.startScreen.classList.remove('active');
        elements.gameOverModal.classList.remove('active');

        // Show in-game controls
        elements.timerDisplay.classList.remove('hidden');
        elements.doneBtn.classList.remove('hidden');
        elements.extraTimeBtn.classList.remove('hidden');

        // Reset button states
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = false);

        // --- Render New Game --- 
        elements.gameBoard.style.display = 'grid'; // Make sure game board is visible
        renderGameBoard(initialState.alphagrams);
        updateTimerDisplay(initialState.timeLeft);

        // --- Final Setup ---
        game.onTimeUpdate = updateTimerDisplay; // Hook up timer updates
        announce('Game started. Good luck!');
    };

    const endGame = () => {
        const results = game.endGame();
        elements.finalScore.textContent = Math.round(results.score);
        
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
        
        elements.gameOverMessage.innerHTML = congratsMessage;
        // Show game over modal
        elements.gameOverModal.classList.add('active');
        announce(`Game over. Your final score is ${Math.round(results.score)}.`);

        // Disable game buttons
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = true);

        // Show results on the board
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

            // Prevent adding duplicate tooltips
            if (card.querySelector('.tooltip')) {
                card.querySelector('.tooltip').remove();
            }

            // Add tooltip with correct answers
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Correct: ${result.validWords.join(', ') || 'None'}`;
            card.appendChild(tooltip);

            // Add score display
            const scoreEl = document.createElement('div');
            scoreEl.className = 'alphagram-score';
            scoreEl.textContent = `Score: ${Math.round(result.score)}`;
            card.appendChild(scoreEl);

            // Add event listeners for dynamic tooltip positioning
            card.addEventListener('mouseover', (e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (!tooltip) return;

                // First, make it visible to measure it
                tooltip.classList.add('show');

                const cardRect = e.currentTarget.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                const boardRect = elements.gameBoard.getBoundingClientRect();

                // Check if there's enough space below
                const spaceBelow = boardRect.bottom - cardRect.bottom;
                const spaceAbove = cardRect.top - boardRect.top;

                tooltip.classList.remove('pos-above', 'pos-below');

                if (spaceBelow >= tooltipRect.height + 10) {
                    tooltip.classList.add('pos-below');
                } else if (spaceAbove >= tooltipRect.height + 10) {
                    tooltip.classList.add('pos-above');
                } else {
                    // Default to below if neither has enough space (should be rare)
                    tooltip.classList.add('pos-below');
                }
            });

            card.addEventListener('mouseout', (e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.classList.remove('show');
                }
            });
        });
    };

    const endGameDueToTimeout = () => {
        const results = game.endGame();
        elements.finalScore.textContent = Math.round(results.score);
        
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
        
        elements.gameOverMessage.innerHTML = `You ran out of time! Next time you can buy an extra 30 seconds at a cost of 25 points.<br><br>${congratsMessage}<br><br>Your final score is <span id="final-score">${Math.round(results.score)}</span>.`;
        // Show game over modal
        showOverlay(elements.gameOverModal);
        announce(`Time's up! Your final score is ${Math.round(results.score)}.`);

        // Disable game buttons
        [elements.doneBtn, elements.extraTimeBtn, elements.headerInstructionsBtn].forEach(btn => btn.disabled = true);

        // Show results on the board
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

            // Prevent adding duplicate tooltips
            if (card.querySelector('.tooltip')) {
                card.querySelector('.tooltip').remove();
            }

            // Add tooltip with correct answers
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Correct: ${result.validWords.join(', ') || 'None'}`;
            card.appendChild(tooltip);

            // Add score display
            const scoreEl = document.createElement('div');
            scoreEl.className = 'score-display';
            scoreEl.textContent = `Score: ${Math.round(result.score)}`;
            card.appendChild(scoreEl);

            // Add event listeners for dynamic tooltip positioning
            card.addEventListener('mouseover', (e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (!tooltip) return;

                // First, make it visible to measure it
                tooltip.classList.add('show');

                const cardRect = e.currentTarget.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();
                const boardRect = elements.gameBoard.getBoundingClientRect();

                // Check if there's enough space below
                const spaceBelow = boardRect.bottom - cardRect.bottom;
                const spaceAbove = cardRect.top - boardRect.top;

                tooltip.classList.remove('pos-above', 'pos-below');

                if (spaceBelow >= tooltipRect.height + 10) {
                    tooltip.classList.add('pos-below');
                } else if (spaceAbove >= tooltipRect.height + 10) {
                    tooltip.classList.add('pos-above');
                } else {
                    // Default to below if neither has enough space (should be rare)
                    tooltip.classList.add('pos-below');
                }
            });

            card.addEventListener('mouseout', (e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.classList.remove('show');
                }
            });
        });
    };

    const reviewAnswers = () => {
        showOverlay(null); // Hide the overlay to show the board
        
        // Make sure game board is visible
        elements.gameBoard.style.display = 'grid';

        // Get final score and display it in the header
        const finalScore = Math.round(game.getGameState().score);
        elements.scoreDisplay.textContent = finalScore;
        elements.headerFinalScore.classList.remove('hidden');

        // Hide in-game controls
        elements.timerDisplay.classList.add('hidden');
        elements.doneBtn.classList.add('hidden');
        elements.extraTimeBtn.classList.add('hidden');
    };

    // --- Helper Functions ---
    
    const showInstructions = () => {
        console.log('Instructions button clicked');
        elements.instructions.classList.add('active');
    };

    // --- Event Listeners ---
    
    // Debug: Check if elements exist
    console.log('Start button element:', elements.startBtn);
    console.log('Instructions button element:', elements.instructionsBtn);

    if (elements.startBtn) {
        elements.startBtn.addEventListener('click', () => {
            console.log('Start button clicked');
            setRandomQuote();
            startGame();
        });
    } else {
        console.error('Start button not found!');
    }

    if (elements.instructionsBtn) {
        elements.instructionsBtn.addEventListener('click', showInstructions);
    } else {
        console.error('Instructions button not found!');
    }
    elements.playAgainBtn.addEventListener('click', (e) => {
        console.log('Play Again button clicked');
        e.preventDefault();
        e.stopPropagation();
        setRandomQuote();
        startGame();
    });
    elements.playAgainHeaderBtn.addEventListener('click', (e) => {
        console.log('Header Play Again button clicked');
        e.preventDefault();
        e.stopPropagation();
        
        // Return to start screen instead of immediately starting a new game
        if (game.getGameState().isPlaying) {
            game.endGame(); // End current game if playing
        }
        
        // Hide game elements
        elements.gameBoard.style.display = 'none';
        elements.extraTimeBtn.classList.add('hidden');
        elements.headerFinalScore.classList.add('hidden');
        
        // Show start screen with active class
        elements.startScreen.classList.add('active');
        showOverlay(null); // Clear any other overlays first
        elements.startScreen.classList.add('active'); // Then show start screen
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
            console.log('Back to Game button clicked');
            elements.instructions.classList.remove('active');
            if (game.getGameState().isPlaying) {
                game.resumeGame();
            }
        });
    }


    // Game over modal close button (Review Answers)
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', () => {
            console.log('Review Answers button clicked');
            elements.gameOverModal.classList.remove('active');
            
            // Setup tooltips for the review answers page
            setTimeout(() => {
                setupTooltips();
            }, 100);
        });
    }

    // Function to setup tooltips for cards
    function setupTooltips() {
        const cards = elements.gameBoard.querySelectorAll('.alphagram-card');
        
        cards.forEach((card) => {
            const tooltip = card.querySelector('.tooltip');
            if (!tooltip) return;

            card.addEventListener('mouseover', (e) => {
                // Create a new tooltip element and append to body for absolute positioning
                const newTooltip = document.createElement('div');
                newTooltip.textContent = tooltip.textContent;
                
                const cardRect = card.getBoundingClientRect();
                
                newTooltip.style.cssText = `
                    position: fixed;
                    background: rgba(45, 55, 72, 0.95);
                    color: #e2e8f0;
                    padding: 8px 12px;
                    border: 1px solid rgba(160, 174, 192, 0.3);
                    z-index: 999999;
                    font-size: 12px;
                    border-radius: 6px;
                    pointer-events: none;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    max-width: ${cardRect.width}px;
                    word-wrap: break-word;
                    white-space: normal;
                    line-height: 1.4;
                `;
                
                newTooltip.style.left = cardRect.left + 'px';
                newTooltip.style.top = cardRect.top + 'px';
                
                document.body.appendChild(newTooltip);
                card.tempTooltip = newTooltip;
            });

            card.addEventListener('mouseout', (e) => {
                // Remove temporary tooltip
                if (card.tempTooltip) {
                    document.body.removeChild(card.tempTooltip);
                    card.tempTooltip = null;
                }
                
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (tooltip) {
                    tooltip.classList.remove('show');
                }
            });
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
        
        const result = await authManager.completeProfileSetup(nickname, country);
        
        if (result.success) {
            hideProfileSetupModal();
            updateAuthUI(authManager.getCurrentUser());
            console.log('Profile setup completed:', result.profile);
        } else {
            // Show error message
            showProfileError(result.error);
        }
    });

    // --- Profile Setup Functions ---
    
    function showProfileSetupModal() {
        elements.profileSetupModal.classList.remove('hidden');
        elements.profileSetupModal.classList.add('active');
        // Clear any previous values
        elements.nicknameInput.value = '';
        elements.countrySelect.value = '';
        clearProfileError();
    }

    function hideProfileSetupModal() {
        elements.profileSetupModal.classList.add('hidden');
        elements.profileSetupModal.classList.remove('active');
    }

    function showProfileError(message) {
        // Remove any existing error message
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
            
            // Update user info
            const profile = authManager.getCurrentUserProfile();
            if (profile && profile.nickname) {
                elements.userName.textContent = profile.nickname;
            } else {
                elements.userName.textContent = authManager.getUserDisplayName();
            }
            
            const photoURL = authManager.getUserPhotoURL();
            if (photoURL) {
                elements.userAvatar.src = photoURL;
                elements.userAvatar.style.display = 'block';
            } else {
                elements.userAvatar.style.display = 'none';
            }
        } else {
            // User is signed out
            elements.signedOutView.classList.remove('hidden');
            elements.signedInView.classList.add('hidden');
        }
    }

    // Handle answer submission on input change
    elements.gameBoard.addEventListener('change', (e) => {
        if (e.target.classList.contains('answer-input')) {
            const card = e.target.closest('.alphagram-card');
            const alphagram = card.dataset.alphagram;
            const answer = e.target.value;
            game.submitAnswer(alphagram, answer);
        }
    });
});
