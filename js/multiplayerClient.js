// Multiplayer client for real-time communication with server
class MultiplayerClient {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.roomCode = null;
        this.playerName = null;
        this.isHost = false;
        this.gameState = null;
        this.callbacks = {};
        
        // Bind methods
        this.connect = this.connect.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.createRoom = this.createRoom.bind(this);
        this.joinRoom = this.joinRoom.bind(this);
        this.startGame = this.startGame.bind(this);
        this.submitAnswer = this.submitAnswer.bind(this);
        this.endGame = this.endGame.bind(this);
    }
    
    // Connect to the server
    connect() {
        if (this.socket) return;
        
        // Use current host and port
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port || (protocol === 'wss:' ? '443' : '80');
        
        this.socket = io();
        
        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log('Connected to multiplayer server');
            this.emit('connected');
        });
        
        this.socket.on('disconnect', () => {
            this.isConnected = false;
            console.log('Disconnected from server');
            this.emit('disconnected');
        });
        
        // Room events
        this.socket.on('room-created', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = true;
            this.gameState = data.gameState;
            this.emit('room-created', data);
        });
        
        this.socket.on('room-joined', (data) => {
            this.roomCode = data.roomCode;
            this.isHost = false;
            this.gameState = data.gameState;
            this.emit('room-joined', data);
        });
        
        this.socket.on('join-error', (data) => {
            this.emit('join-error', data);
        });
        
        this.socket.on('player-joined', (data) => {
            this.gameState = data.gameState;
            this.emit('player-joined', data);
        });
        
        this.socket.on('player-disconnected', (data) => {
            this.gameState = data.gameState;
            this.emit('player-disconnected', data);
        });
        
        this.socket.on('player-reconnected', (data) => {
            this.gameState = data.gameState;
            this.emit('player-reconnected', data);
        });
        
        // Game events
        this.socket.on('game-starting', (data) => {
            this.gameState = data.gameState;
            this.emit('game-starting', data);
        });
        
        this.socket.on('game-started', (data) => {
            this.gameState = data.gameState;
            this.emit('game-started', data);
        });
        
        this.socket.on('game-ended', (data) => {
            this.emit('game-ended', data);
        });
        
        this.socket.on('game-paused', (data) => {
            this.emit('game-paused', data);
        });
        
        this.socket.on('timer-update', (data) => {
            if (this.gameState) {
                this.gameState.timeLeft = data.timeLeft;
            }
            this.emit('timer-update', data);
        });
        
        this.socket.on('score-update', (data) => {
            this.gameState = data.gameState;
            this.emit('score-update', data);
        });
        
        this.socket.on('answer-result', (data) => {
            this.emit('answer-result', data);
        });
        
        // Error handling
        this.socket.on('error', (data) => {
            console.error('Server error:', data.message);
            this.emit('error', data);
        });
        
        this.socket.on('reconnected', (data) => {
            this.roomCode = data.roomCode;
            this.gameState = data.gameState;
            this.emit('reconnected', data);
        });
    }
    
    // Disconnect from server
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.roomCode = null;
        this.gameState = null;
    }
    
    // Create a new room
    createRoom(playerName) {
        this.playerName = playerName;
        if (this.socket) {
            this.socket.emit('create-room', { playerName });
        }
    }
    
    // Join an existing room
    joinRoom(roomCode, playerName) {
        this.playerName = playerName;
        if (this.socket) {
            this.socket.emit('join-room', { roomCode, playerName });
        }
    }
    
    // Start the game (host only)
    startGame() {
        if (this.socket && this.isHost) {
            this.socket.emit('start-game');
        }
    }
    
    // Submit an answer
    submitAnswer(alphagram, answer) {
        if (this.socket) {
            this.socket.emit('submit-answer', { alphagram, answer });
        }
    }
    
    // End the game (host only)
    endGame() {
        if (this.socket && this.isHost) {
            this.socket.emit('end-game');
        }
    }
    
    // Reconnect to a room
    reconnectToRoom(roomCode, playerName) {
        if (this.socket) {
            this.socket.emit('reconnect-to-room', { roomCode, playerName });
        }
    }
    
    // Event system
    on(event, callback) {
        if (!this.callbacks[event]) {
            this.callbacks[event] = [];
        }
        this.callbacks[event].push(callback);
    }
    
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => callback(data));
        }
    }
    
    // Get current player info
    getCurrentPlayer() {
        if (!this.gameState || !this.playerName) return null;
        return this.gameState.players.find(p => p.name === this.playerName);
    }
    
    // Get opponent info
    getOpponent() {
        if (!this.gameState || !this.playerName) return null;
        return this.gameState.players.find(p => p.name !== this.playerName);
    }
    
    // Check if ready to start
    isReadyToStart() {
        return this.gameState && 
               this.gameState.players.length === 2 && 
               this.gameState.status === 'waiting' && 
               this.isHost;
    }
    
    // Get game status
    getGameStatus() {
        return this.gameState ? this.gameState.status : 'disconnected';
    }
}

// Create singleton instance
const multiplayerClient = new MultiplayerClient();

export { multiplayerClient };
