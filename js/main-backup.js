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
        headerInstructionsBtn: document.getElementById('header-instructions-btn'),
        backBtn: document.getElementById('back-btn'),
        doneBtn: document.getElementById('done-btn'),
        extraTimeBtn: document.getElementById('extra-time'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        gameOverMessage: document.getElementById('game-over-message'),
        liveAnnouncer: document.getElementById('live-announcer'),
        headerFinalScore: document.getElementById('header-final-score'),
        // Auth elements
        googleSigninBtn: document.getElementById('google-signin-btn'),
        signoutBtn: document.getElementById('signout-btn'),
        signedOutView: document.getElementById('signed-out-view'),
        signedInView: document.getElementById('signed-in-view'),
        userName: document.getElementById('user-name'),
        // Profile setup elements
        profileSetup: document.getElementById('profile-setup'),
        nicknameInput: document.getElementById('nickname-input'),
        countrySelect: document.getElementById('country-select'),
        saveProfileBtn: document.getElementById('save-profile-btn'),
        skipProfileBtn: document.getElementById('skip-profile-btn')
    };

    // --- Authentication Functions ---
    
    const updateAuthUI = (user) => {
        if (user) {
            // User is signed in
            elements.signedOutView.classList.add('hidden');
            elements.signedInView.classList.remove('hidden');
            elements.userName.textContent = user.displayName || 'User';
            
            // Check if user needs to complete profile
            checkUserProfile(user);
        } else {
            // User is signed out
            elements.signedOutView.classList.remove('hidden');
            elements.signedInView.classList.add('hidden');
        }
    };

    const checkUserProfile = async (user) => {
        // Check if user has completed profile setup
        const userProfileKey = `profile_${user.uid}`;
        const savedProfile = localStorage.getItem(userProfileKey);
        
        if (!savedProfile) {
            // Show profile setup modal
            showProfileSetup(user);
        }
    };

    const showProfileSetup = (user) => {
        // Pre-fill nickname with display name if available
        if (user.displayName) {
            elements.nicknameInput.value = user.displayName;
        }
        
        // Show the profile setup modal
        elements.profileSetup.classList.add('active');
    };

    const saveUserProfile = (user) => {
        const nickname = elements.nicknameInput.value.trim();
        const country = elements.countrySelect.value;
        
        if (!nickname) {
            announce('Please enter a nickname');
            return;
        }
        
        const profile = {
            nickname: nickname,
            country: country,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage (in future this could be saved to Firebase)
        const userProfileKey = `profile_${user.uid}`;
        localStorage.setItem(userProfileKey, JSON.stringify(profile));
        
        // Update UI to show nickname
        elements.userName.textContent = nickname;
        
        // Hide profile setup modal
        elements.profileSetup.classList.remove('active');
        
        announce(`Welcome, ${nickname}! Profile saved successfully.`);
    };

    const skipProfileSetup = () => {
        elements.profileSetup.classList.remove('active');
        announce('You can set up your profile later from settings');
    };

    const handleGoogleSignIn = async () => {
        try {
            await authManager.signInWithGoogle();
            // Redirect will happen automatically
        } catch (error) {
            announce(`Sign-in failed: ${error.message}`);
        }
    };

    const handleSignOut = async () => {
        const result = await authManager.signOutUser();
        if (result.success) {
            announce('Signed out successfully');
        } else {
            announce(`Sign-out failed: ${result.error}`);
        }
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

    // Set initial random quote
    setRandomQuote();

    // Initialize authentication
    authManager.onUserStateChange = updateAuthUI;

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
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = false);

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
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = true);

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
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = true);

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
    
    // Set up event listeners
    elements.startBtn.addEventListener('click', startGame);
    elements.instructionsBtn.addEventListener('click', () => elements.instructions.classList.add('active'));
    elements.closeInstructionsBtn.addEventListener('click', () => elements.instructions.classList.remove('active'));
    elements.closeModalBtn.addEventListener('click', () => elements.gameOverModal.classList.remove('active'));
    elements.playAgainBtn.addEventListener('click', startGame);
    elements.playAgainHeaderBtn.addEventListener('click', startGame);
    elements.headerInstructionsBtn.addEventListener('click', () => elements.instructions.classList.add('active'));
    elements.backBtn.addEventListener('click', goHome);
    elements.doneBtn.addEventListener('click', endGame);
    elements.extraTimeBtn.addEventListener('click', addExtraTime);
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    // Auth event listeners
    elements.googleSigninBtn.addEventListener('click', handleGoogleSignIn);
    elements.signoutBtn.addEventListener('click', handleSignOut);
    
    // Profile setup event listeners
    elements.saveProfileBtn.addEventListener('click', () => {
        const currentUser = authManager.getCurrentUser();
        if (currentUser) {
            saveUserProfile(currentUser);
        }
    });
    elements.skipProfileBtn.addEventListener('click', skipProfileSetup);

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
            elements.gameOverModal.classList.remove('active');
            
            // Setup tooltips for the review answers page
            setTimeout(() => {
                setupTooltips();
            }, 100);
        });
    };

    // Function to setup tooltips for cards
    const setupTooltips = () => {
        const cards = elements.gameBoard.querySelectorAll('.alphagram-card');
        
        cards.forEach((card) => {
            const tooltip = card.querySelector('.tooltip');
            if (!tooltip) return;

            // Clear existing listeners
            card.onmouseover = null;
            card.onmouseout = null;

            // Add fresh event listeners
            card.addEventListener('mouseover', (e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip');
                if (!tooltip) return;

                // Ensure card has relative positioning for tooltip positioning
                if (window.getComputedStyle(card).position === 'static') {
                    card.style.position = 'relative';
                }

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

    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        toggleTheme();
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
