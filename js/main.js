import { game } from './game.js';

console.log('main.js loaded successfully');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    // DOM Elements
    const elements = {
        // Screens & Overlays
        startScreen: document.getElementById('start-screen'),
        instructionsScreen: document.getElementById('instructions'),
        gameOverScreen: document.getElementById('game-over'),
        gameBoard: document.getElementById('game-board'),

        // Buttons
        startBtn: document.getElementById('start-btn'),
        instructionsBtn: document.getElementById('instructions-btn'),
        headerInstructionsBtn: document.getElementById('header-instructions-btn'),
        backBtn: document.getElementById('back-btn'),
        playAgainBtn: document.getElementById('play-again-btn'),
        reviewBtn: document.getElementById('review-btn'),
        doneBtn: document.getElementById('done-btn'),
        extraTimeBtn: document.getElementById('extra-time'),
        themeToggleBtn: document.getElementById('theme-toggle'),

        // Display
        timerDisplay: document.getElementById('timer'),
        scoreDisplay: document.getElementById('score'), // Re-add score display
        headerFinalScore: document.getElementById('header-final-score'),
        finalScoreDisplay: document.getElementById('final-score'),
        liveAnnouncer: document.getElementById('live-announcer'),
    };

    // --- UI Update Functions ---

    const announce = (message) => {
        elements.liveAnnouncer.textContent = message;
    };

    const updateTimerDisplay = (timeLeft) => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        elements.timerDisplay.textContent = timeString;

        // Announce time at key intervals
        if (timeLeft === 60) announce('One minute remaining.');
        if (timeLeft === 30) announce('Thirty seconds remaining.');
        if (timeLeft === 10) announce('Ten seconds remaining.');
    };


    const renderGameBoard = (alphagrams) => {
        elements.gameBoard.innerHTML = '';
        alphagrams.forEach(({ alphagram }, index) => {
            const card = document.createElement('div');
            card.className = 'alphagram-card';
            card.dataset.alphagram = alphagram;
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

    // --- Game Logic Integration ---

    const startGame = () => {
        const initialState = game.startNewGame();

        // --- UI Reset --- 
        // Ensure a clean slate regardless of the previous screen (e.g., review screen)
        showOverlay(null); // Hide all overlays (like game-over)
        elements.headerFinalScore.classList.add('hidden'); // Hide review score
        elements.timerDisplay.classList.remove('hidden'); // Show timer
        elements.doneBtn.classList.remove('hidden'); // Show game buttons
        elements.extraTimeBtn.classList.remove('hidden');
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = false);

        // --- Render New Game --- 
        renderGameBoard(initialState.alphagrams);
        updateTimerDisplay(initialState.timeLeft);

        // --- Final Setup ---
        // This is critical: ensures the new inputs are enabled and empty.
        elements.gameBoard.querySelectorAll('.answer-input').forEach(input => {
            input.disabled = false;
            input.value = '';
        });

        game.onTimeUpdate = updateTimerDisplay; // Hook up timer updates
        announce('Game started. Good luck!');
    };

    const endGame = () => {
        const results = game.endGame();
        elements.finalScoreDisplay.textContent = Math.round(results.score);
        // Ensure header score is hidden on game over screen
        elements.headerFinalScore.classList.add('hidden');
        showOverlay(elements.gameOverScreen);
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

    const reviewAnswers = () => {
        showOverlay(null); // Hide the overlay to show the board

        // Get final score and display it in the header
        const finalScore = Math.round(game.getGameState().score);
        elements.scoreDisplay.textContent = finalScore;
        elements.headerFinalScore.classList.remove('hidden');

        // Hide in-game controls
        elements.timerDisplay.classList.add('hidden');
        elements.doneBtn.classList.add('hidden');
        elements.extraTimeBtn.classList.add('hidden');
    };

    // --- Event Listeners ---

    elements.startBtn.addEventListener('click', startGame);
    elements.playAgainBtn.addEventListener('click', startGame);
    elements.reviewBtn.addEventListener('click', reviewAnswers);

    const showInstructions = () => {
        elements.instructionsScreen.classList.add('active');
    };

    elements.instructionsBtn.addEventListener('click', showInstructions);

    elements.headerInstructionsBtn.addEventListener('click', () => {
        if (game.getGameState().isPlaying) {
            game.pauseGame();
            showInstructions();
        }
    });

    elements.backBtn.addEventListener('click', () => {
        elements.instructionsScreen.classList.remove('active');
        if (game.getGameState().isPaused) {
            game.resumeGame();
        }
    });

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
