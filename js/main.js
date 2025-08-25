import { game } from './game.js';
import { multiplayerClient } from './multiplayerClient.js';

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
        multiplayerSetup: document.getElementById('multiplayer-setup'),
        waitingRoom: document.getElementById('waiting-room'),
        gameStarting: document.getElementById('game-starting'),

        // Buttons
        singlePlayerBtn: document.getElementById('single-player-btn'),
        multiplayerBtn: document.getElementById('multiplayer-btn'),
        instructionsBtn: document.getElementById('instructions-btn'),
        headerInstructionsBtn: document.getElementById('header-instructions-btn'),
        backBtn: document.getElementById('back-btn'),
        backToMenuBtn: document.getElementById('back-to-menu-btn'),
        playAgainBtn: document.getElementById('play-again-btn'),
        reviewBtn: document.getElementById('review-btn'),
        doneBtn: document.getElementById('done-btn'),
        extraTimeBtn: document.getElementById('extra-time'),
        themeToggleBtn: document.getElementById('theme-toggle'),
        playAgainHeaderBtn: document.getElementById('play-again-header-btn'),
        
        // Multiplayer buttons
        createRoomBtn: document.getElementById('create-room-btn'),
        joinRoomBtn: document.getElementById('join-room-btn'),
        startMultiplayerGameBtn: document.getElementById('start-multiplayer-game-btn'),
        leaveRoomBtn: document.getElementById('leave-room-btn'),

        // Display
        timerDisplay: document.getElementById('timer'),
        scoreDisplay: document.getElementById('score'),
        opponentScoreDisplay: document.getElementById('opponent-score-value'),
        opponentScoreContainer: document.getElementById('opponent-score'),
        headerFinalScore: document.getElementById('header-final-score'),
        finalScoreDisplay: document.getElementById('final-score'),
        gameOverMessage: document.getElementById('game-over-message'),
        quoteText: document.getElementById('quote-text'),
        liveAnnouncer: document.getElementById('live-announcer'),
        
        // Multiplayer elements
        playerNameInput: document.getElementById('player-name'),
        roomCodeInput: document.getElementById('room-code-input'),
        roomCodeDisplay: document.getElementById('room-code-display'),
        playersUl: document.getElementById('players-ul'),
        waitingMessage: document.getElementById('waiting-message'),
        gameReady: document.getElementById('game-ready'),
        countdownNumber: document.getElementById('countdown-number'),
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

    // Initialize theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    }

    // Set initial random quote
    setRandomQuote();

    elements.themeToggleBtn.addEventListener('click', toggleTheme);
    
    // Game mode variables
    let isMultiplayer = false;
    let connectionStatus = null;

    // --- Game Logic Integration ---

    const startGame = () => {
        if (isMultiplayer) {
            // Multiplayer game start is handled by server events
            return;
        }
        
        const initialState = game.startNewGame();

        // --- UI Reset --- 
        showOverlay(null);
        elements.headerFinalScore.classList.add('hidden');
        elements.opponentScoreContainer.classList.add('hidden'); // Hide opponent score in single player
        elements.timerDisplay.classList.remove('hidden');
        elements.doneBtn.classList.remove('hidden');
        elements.extraTimeBtn.classList.remove('hidden');
        [elements.doneBtn, elements.extraTimeBtn].forEach(btn => btn.disabled = false);

        // --- Render New Game --- 
        renderGameBoard(initialState.alphagrams);
        updateTimerDisplay(initialState.timeLeft);

        // --- Final Setup ---
        elements.gameBoard.querySelectorAll('.answer-input').forEach(input => {
            input.disabled = false;
            input.value = '';
        });

        game.onTimeUpdate = updateTimerDisplay;
        announce('Game started. Good luck!');
    };

    const endGame = () => {
        if (isMultiplayer) {
            multiplayerClient.endGame();
            return;
        }
        
        const results = game.endGame();
        elements.finalScoreDisplay.textContent = Math.round(results.score);
        elements.gameOverMessage.innerHTML = `Your final score is <span id="final-score">${Math.round(results.score)}</span>.`;
        elements.headerFinalScore.classList.add('hidden');
        elements.opponentScoreContainer.classList.add('hidden');
        showOverlay(elements.gameOverScreen);
        announce(`Game over. Your final score is ${Math.round(results.score)}.`);

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
        elements.finalScoreDisplay.textContent = Math.round(results.score);
        elements.gameOverMessage.innerHTML = `You ran out of time! Next time you can buy an extra 30 seconds at a cost of 25 points.<br><br>Your final score is <span id="final-score">${Math.round(results.score)}</span>.`;
        // Ensure header score is hidden on game over screen
        elements.headerFinalScore.classList.add('hidden');
        showOverlay(elements.gameOverScreen);
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

    // Game mode selection
    elements.singlePlayerBtn.addEventListener('click', () => {
        isMultiplayer = false;
        setRandomQuote();
        startGame();
    });
    
    elements.multiplayerBtn.addEventListener('click', () => {
        isMultiplayer = true;
        showOverlay(elements.multiplayerSetup);
        if (!multiplayerClient.isConnected) {
            multiplayerClient.connect();
        }
    });
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
        setRandomQuote();
        startGame();
    });
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
        if (isMultiplayer) {
            // Return to appropriate multiplayer screen
            if (multiplayerClient.roomCode) {
                showOverlay(elements.waitingRoom);
            } else {
                showOverlay(elements.multiplayerSetup);
            }
        } else if (game.getGameState().isPaused) {
            game.resumeGame();
        }
    });
    
    elements.backToMenuBtn.addEventListener('click', () => {
        if (multiplayerClient.isConnected) {
            multiplayerClient.disconnect();
        }
        isMultiplayer = false;
        showOverlay(elements.startScreen);
    });

    elements.doneBtn.addEventListener('click', endGame);
    elements.themeToggleBtn.addEventListener('click', toggleTheme);

    elements.extraTimeBtn.addEventListener('click', () => {
        if (isMultiplayer) {
            // Extra time disabled in multiplayer
            return;
        }
        
        const result = game.useExtraTime();
        if (result.success) {
            updateTimerDisplay(result.newTimeLeft);
            elements.extraTimeBtn.disabled = true;
            announce('30 seconds added. 25 points deducted.');
        }
    });

    // Multiplayer event handlers
    elements.createRoomBtn.addEventListener('click', () => {
        const playerName = elements.playerNameInput.value.trim();
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        multiplayerClient.createRoom(playerName);
    });
    
    elements.joinRoomBtn.addEventListener('click', () => {
        const playerName = elements.playerNameInput.value.trim();
        const roomCode = elements.roomCodeInput.value.trim().toUpperCase();
        
        if (!playerName) {
            alert('Please enter your name');
            return;
        }
        
        if (!roomCode || roomCode.length !== 6) {
            alert('Please enter a valid 6-digit room code');
            return;
        }
        
        multiplayerClient.joinRoom(roomCode, playerName);
    });
    
    elements.startMultiplayerGameBtn.addEventListener('click', () => {
        multiplayerClient.startGame();
    });
    
    elements.leaveRoomBtn.addEventListener('click', () => {
        if (multiplayerClient.isConnected) {
            multiplayerClient.disconnect();
        }
        showOverlay(elements.multiplayerSetup);
        multiplayerClient.connect();
    });
    
    // Room code input formatting
    elements.roomCodeInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^0-9]/g, '').slice(0, 6);
    });
    
    // Load theme from localStorage
    if (localStorage.getItem('theme') === 'light') {
        toggleTheme();
    }
    
    // Initialize multiplayer event listeners
    setupMultiplayerEvents();

    // Handle answer submission on input change
    elements.gameBoard.addEventListener('change', (e) => {
        if (e.target.classList.contains('answer-input')) {
            const card = e.target.closest('.alphagram-card');
            const alphagram = card.dataset.alphagram;
            const answer = e.target.value;
            
            if (isMultiplayer) {
                multiplayerClient.submitAnswer(alphagram, answer);
            } else {
                game.submitAnswer(alphagram, answer);
            }
        }
    });
    
    // Multiplayer event setup
    function setupMultiplayerEvents() {
        // Connection events
        multiplayerClient.on('connected', () => {
            updateConnectionStatus('connected');
        });
        
        multiplayerClient.on('disconnected', () => {
            updateConnectionStatus('disconnected');
        });
        
        // Room events
        multiplayerClient.on('room-created', (data) => {
            elements.roomCodeDisplay.textContent = data.roomCode;
            updatePlayersList(data.gameState.players);
            showOverlay(elements.waitingRoom);
            updateWaitingRoomState(data.gameState);
        });
        
        multiplayerClient.on('room-joined', (data) => {
            elements.roomCodeDisplay.textContent = data.roomCode;
            updatePlayersList(data.gameState.players);
            showOverlay(elements.waitingRoom);
            updateWaitingRoomState(data.gameState);
        });
        
        multiplayerClient.on('join-error', (data) => {
            alert(`Failed to join room: ${data.error}`);
        });
        
        multiplayerClient.on('player-joined', (data) => {
            updatePlayersList(data.gameState.players);
            updateWaitingRoomState(data.gameState);
        });
        
        multiplayerClient.on('player-disconnected', (data) => {
            updatePlayersList(data.gameState.players);
            if (data.gameState.status === 'playing') {
                announce('Opponent disconnected');
            }
        });
        
        // Game events
        multiplayerClient.on('game-starting', (data) => {
            showOverlay(elements.gameStarting);
            startCountdown();
        });
        
        multiplayerClient.on('game-started', (data) => {
            showOverlay(null);
            startMultiplayerGame(data.gameState);
        });
        
        multiplayerClient.on('timer-update', (data) => {
            updateTimerDisplay(data.timeLeft);
        });
        
        multiplayerClient.on('score-update', (data) => {
            updateMultiplayerScores(data.gameState);
        });
        
        multiplayerClient.on('game-ended', (data) => {
            showMultiplayerResults(data.results);
        });
        
        multiplayerClient.on('error', (data) => {
            alert(`Error: ${data.message}`);
        });
    }
    
    function updateConnectionStatus(status) {
        // Remove existing status indicator
        const existing = document.querySelector('.connection-status');
        if (existing) existing.remove();
        
        // Create new status indicator
        const statusDiv = document.createElement('div');
        statusDiv.className = `connection-status ${status}`;
        statusDiv.textContent = status === 'connected' ? 'Connected' : 'Disconnected';
        document.body.appendChild(statusDiv);
        
        // Auto-hide after 3 seconds if connected
        if (status === 'connected') {
            setTimeout(() => {
                if (statusDiv.parentNode) {
                    statusDiv.remove();
                }
            }, 3000);
        }
    }
    
    function updatePlayersList(players) {
        elements.playersUl.innerHTML = '';
        players.forEach(player => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${player.name}</span>
                <div>
                    ${player.isHost ? '<span class="player-host-badge">Host</span>' : ''}
                    ${!player.connected ? '<span class="player-disconnected">Disconnected</span>' : ''}
                </div>
            `;
            elements.playersUl.appendChild(li);
        });
    }
    
    function updateWaitingRoomState(gameState) {
        const canStart = gameState.players.length === 2 && gameState.status === 'waiting';
        const isHost = multiplayerClient.isHost;
        
        if (canStart && isHost) {
            elements.waitingMessage.classList.add('hidden');
            elements.gameReady.classList.remove('hidden');
        } else {
            elements.waitingMessage.classList.remove('hidden');
            elements.gameReady.classList.add('hidden');
            
            if (gameState.players.length === 2) {
                elements.waitingMessage.innerHTML = '<p>Waiting for host to start the game...</p>';
            } else {
                elements.waitingMessage.innerHTML = '<p>Waiting for opponent to join...</p>';
            }
        }
    }
    
    function startCountdown() {
        let count = 3;
        elements.countdownNumber.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                elements.countdownNumber.textContent = count;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
    
    function startMultiplayerGame(gameState) {
        // Show game UI elements
        elements.headerFinalScore.classList.add('hidden');
        elements.opponentScoreContainer.classList.remove('hidden');
        elements.timerDisplay.classList.remove('hidden');
        elements.doneBtn.classList.remove('hidden');
        elements.extraTimeBtn.classList.add('hidden'); // Disable extra time in multiplayer
        
        // Render game board
        renderGameBoard(gameState.alphagrams);
        
        // Enable inputs
        elements.gameBoard.querySelectorAll('.answer-input').forEach(input => {
            input.disabled = false;
            input.value = '';
        });
        
        // Update scores
        updateMultiplayerScores(gameState);
        
        announce('Multiplayer game started! Good luck!');
    }
    
    function updateMultiplayerScores(gameState) {
        const currentPlayer = multiplayerClient.getCurrentPlayer();
        const opponent = multiplayerClient.getOpponent();
        
        if (currentPlayer) {
            elements.scoreDisplay.textContent = currentPlayer.score;
        }
        
        if (opponent) {
            elements.opponentScoreDisplay.textContent = opponent.score;
        }
    }
    
    function showMultiplayerResults(results) {
        // Hide multiplayer UI
        elements.opponentScoreContainer.classList.add('hidden');
        
        // Create custom multiplayer results overlay
        const resultsOverlay = document.createElement('div');
        resultsOverlay.className = 'overlay active';
        resultsOverlay.innerHTML = `
            <div class="overlay-content">
                <h2>Game Over!</h2>
                <div class="results-comparison">
                    ${results.players.map(player => `
                        <div class="player-result ${results.winner && results.winner.name === player.name ? 'winner' : ''}">
                            <h3>${player.name}</h3>
                            <div class="final-score">${player.score}</div>
                            ${results.winner && results.winner.name === player.name ? '<div class="winner-badge">Winner!</div>' : ''}
                        </div>
                    `).join('')}
                </div>
                <button id="play-again-multiplayer-btn" class="btn primary-btn">Play Again</button>
                <button id="leave-game-btn" class="btn secondary-btn">Leave Game</button>
            </div>
        `;
        
        document.body.appendChild(resultsOverlay);
        
        // Add event listeners
        resultsOverlay.querySelector('#play-again-multiplayer-btn').addEventListener('click', () => {
            if (multiplayerClient.isHost) {
                multiplayerClient.startGame();
            }
            resultsOverlay.remove();
        });
        
        resultsOverlay.querySelector('#leave-game-btn').addEventListener('click', () => {
            multiplayerClient.disconnect();
            resultsOverlay.remove();
            showOverlay(elements.startScreen);
            isMultiplayer = false;
        });
        
        // Show detailed results on the board
        showMultiplayerBoardResults(results);
    }
    
    function showMultiplayerBoardResults(results) {
        results.alphagrams.forEach(result => {
            const card = elements.gameBoard.querySelector(`[data-alphagram="${result.alphagram}"]`);
            if (!card) return;
            
            const input = card.querySelector('.answer-input');
            input.disabled = true;
            
            // Show correct answers
            card.classList.remove('correct', 'incorrect', 'partial');
            
            // Add tooltip with all player answers
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                <strong>Correct: ${result.validWords.join(', ') || 'None'}</strong><br>
                ${result.playerAnswers.map(pa => 
                    `${pa.name}: ${pa.answer.userInput || '(no answer)'}`
                ).join('<br>')}
            `;
            card.appendChild(tooltip);
            
            // Add hover events
            card.addEventListener('mouseover', () => tooltip.classList.add('show'));
            card.addEventListener('mouseout', () => tooltip.classList.remove('show'));
        });
    }
});
