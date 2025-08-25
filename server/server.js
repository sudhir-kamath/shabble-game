// Main server file for multiplayer Shabble game
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const GameManager = require('./gameManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;
const gameManager = new GameManager();

// Global timer for all active games
setInterval(() => {
    gameManager.rooms.forEach((room) => {
        if (room.gameState.status === 'playing') {
            // Send timer update
            io.to(room.roomCode).emit('timer-update', {
                timeLeft: room.gameState.timeLeft
            });
            
            // Check if game should end due to timeout
            if (room.gameState.timeLeft <= 0) {
                room.endGame();
                io.to(room.roomCode).emit('game-ended', {
                    results: room.getGameResults()
                });
                console.log(`Game ended due to timeout in room ${room.roomCode}`);
            }
        }
    });
}, 1000);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Serve the main game page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new game room
    socket.on('create-room', (data) => {
        const { playerName } = data;
        const { roomCode, room } = gameManager.createRoom(socket.id, playerName);
        
        socket.join(roomCode);
        socket.emit('room-created', {
            roomCode,
            gameState: room.getPublicState()
        });
        
        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join an existing room
    socket.on('join-room', (data) => {
        const { roomCode, playerName } = data;
        const result = gameManager.joinRoom(roomCode, socket.id, playerName);
        
        if (result.success) {
            socket.join(roomCode);
            socket.emit('room-joined', {
                roomCode,
                gameState: result.room.getPublicState()
            });
            
            // Notify other players in the room
            socket.to(roomCode).emit('player-joined', {
                gameState: result.room.getPublicState()
            });
            
            console.log(`${playerName} joined room ${roomCode}`);
        } else {
            socket.emit('join-error', { error: result.error });
        }
    });

    // Start the game
    socket.on('start-game', () => {
        const room = gameManager.getRoomBySocket(socket.id);
        if (!room) {
            socket.emit('error', { message: 'Room not found' });
            return;
        }

        const player = room.getPlayer(socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', { message: 'Only the host can start the game' });
            return;
        }

        const result = gameManager.startGame(room.roomCode);
        if (result.success) {
            io.to(room.roomCode).emit('game-starting', {
                gameState: result.room.getPublicState()
            });
            
            // Send game-started after 3 seconds
            setTimeout(() => {
                io.to(room.roomCode).emit('game-started', {
                    gameState: result.room.getPublicState()
                });
            }, 3000);
            
            console.log(`Game started in room ${room.roomCode}`);
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // Submit an answer
    socket.on('submit-answer', (data) => {
        const { alphagram, answer } = data;
        const result = gameManager.submitAnswer(socket.id, alphagram, answer);
        
        if (result.success) {
            const room = gameManager.getRoomBySocket(socket.id);
            if (room) {
                // Send updated scores to all players in the room
                io.to(room.roomCode).emit('score-update', {
                    gameState: room.getPublicState()
                });
                
                // Send answer result to the player who submitted
                socket.emit('answer-result', {
                    alphagram,
                    result: result.result
                });
            }
        } else {
            socket.emit('error', { message: result.error });
        }
    });

    // End game manually
    socket.on('end-game', () => {
        const room = gameManager.getRoomBySocket(socket.id);
        if (!room) return;

        const player = room.getPlayer(socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', { message: 'Only the host can end the game' });
            return;
        }

        const result = gameManager.endGame(room.roomCode);
        if (result.success) {
            io.to(room.roomCode).emit('game-ended', {
                results: result.room.getGameResults()
            });
            
            console.log(`Game ended in room ${room.roomCode}`);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        
        const room = gameManager.removePlayer(socket.id);
        if (room) {
            // Notify remaining players
            socket.to(room.roomCode).emit('player-disconnected', {
                gameState: room.getPublicState()
            });
            
            // If game was in progress and only one player left, pause or end
            if (room.players.length === 1 && room.gameState.status === 'playing') {
                socket.to(room.roomCode).emit('game-paused', {
                    message: 'Opponent disconnected. Game paused.'
                });
            }
        }
    });

    // Handle reconnection attempts
    socket.on('reconnect-to-room', (data) => {
        const { roomCode, playerName } = data;
        const room = gameManager.rooms.get(roomCode);
        
        if (room) {
            const existingPlayer = room.players.find(p => p.name === playerName);
            if (existingPlayer) {
                // Update socket ID for reconnected player
                gameManager.playerRooms.delete(existingPlayer.socketId);
                existingPlayer.socketId = socket.id;
                existingPlayer.connected = true;
                gameManager.playerRooms.set(socket.id, roomCode);
                
                socket.join(roomCode);
                socket.emit('reconnected', {
                    roomCode,
                    gameState: room.getPublicState()
                });
                
                socket.to(roomCode).emit('player-reconnected', {
                    gameState: room.getPublicState()
                });
                
                console.log(`${playerName} reconnected to room ${roomCode}`);
            }
        }
    });
});

// Global timer for all active games
setInterval(() => {
    gameManager.rooms.forEach((room) => {
        if (room.gameState.status === 'playing') {
            io.to(room.roomCode).emit('timer-update', {
                timeLeft: room.gameState.timeLeft
            });
            
            // Auto-end game when time runs out
            if (room.gameState.timeLeft <= 0) {
                room.endGame();
                io.to(room.roomCode).emit('game-ended', {
                    results: room.getGameResults()
                });
            }
        }
    });
}, 1000);

server.listen(PORT, () => {
    console.log(`🎮 Shabble multiplayer server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to play!`);
});
