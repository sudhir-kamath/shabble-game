// Game room and state management for multiplayer Shabble
const { generateGameSet, calculateScore } = require('./gameLogic');

class GameManager {
    constructor() {
        this.rooms = new Map(); // roomCode -> GameRoom
        this.playerRooms = new Map(); // socketId -> roomCode
    }

    // Generate a unique 6-digit room code
    generateRoomCode() {
        let code;
        do {
            code = Math.floor(100000 + Math.random() * 900000).toString();
        } while (this.rooms.has(code));
        return code;
    }

    // Create a new game room
    createRoom(hostSocketId, hostName) {
        const roomCode = this.generateRoomCode();
        const room = new GameRoom(roomCode, hostSocketId, hostName);
        
        this.rooms.set(roomCode, room);
        this.playerRooms.set(hostSocketId, roomCode);
        
        return { roomCode, room };
    }

    // Join an existing room
    joinRoom(roomCode, guestSocketId, guestName) {
        const room = this.rooms.get(roomCode);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.players.length >= 2) {
            return { success: false, error: 'Room is full' };
        }
        
        if (room.gameState.status !== 'waiting') {
            return { success: false, error: 'Game already in progress' };
        }
        
        room.addPlayer(guestSocketId, guestName);
        this.playerRooms.set(guestSocketId, roomCode);
        
        return { success: true, room };
    }

    // Get room by socket ID
    getRoomBySocket(socketId) {
        const roomCode = this.playerRooms.get(socketId);
        return roomCode ? this.rooms.get(roomCode) : null;
    }

    // Remove player from room
    removePlayer(socketId) {
        const roomCode = this.playerRooms.get(socketId);
        if (!roomCode) return null;
        
        const room = this.rooms.get(roomCode);
        if (!room) return null;
        
        room.removePlayer(socketId);
        this.playerRooms.delete(socketId);
        
        // Clean up empty rooms
        if (room.players.length === 0) {
            this.rooms.delete(roomCode);
        }
        
        return room;
    }

    // Start game in a room
    startGame(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room || room.players.length !== 2) {
            return { success: false, error: 'Need exactly 2 players to start' };
        }
        
        room.startGame();
        return { success: true, room };
    }

    // Submit an answer
    submitAnswer(socketId, alphagram, answer) {
        const room = this.getRoomBySocket(socketId);
        if (!room) return { success: false, error: 'Room not found' };
        
        return room.submitAnswer(socketId, alphagram, answer);
    }

    // End game
    endGame(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) return { success: false, error: 'Room not found' };
        
        room.endGame();
        return { success: true, room };
    }
}

class GameRoom {
    constructor(roomCode, hostSocketId, hostName) {
        this.roomCode = roomCode;
        this.players = [
            {
                socketId: hostSocketId,
                name: hostName,
                isHost: true,
                score: 0,
                answers: {},
                connected: true
            }
        ];
        
        this.gameState = {
            status: 'waiting', // waiting, starting, playing, finished
            timeLeft: 120,
            startTime: null,
            endTime: null,
            alphagrams: [],
            timer: null
        };
    }

    addPlayer(socketId, name) {
        this.players.push({
            socketId,
            name,
            isHost: false,
            score: 0,
            answers: {},
            connected: true
        });
    }

    removePlayer(socketId) {
        const index = this.players.findIndex(p => p.socketId === socketId);
        if (index !== -1) {
            this.players.splice(index, 1);
        }
    }

    getPlayer(socketId) {
        return this.players.find(p => p.socketId === socketId);
    }

    startGame() {
        this.gameState.status = 'starting';
        this.gameState.alphagrams = generateGameSet();
        this.gameState.startTime = Date.now();
        this.gameState.timeLeft = 120;
        
        // Initialize player answers
        this.players.forEach(player => {
            player.score = 0;
            player.answers = {};
            this.gameState.alphagrams.forEach(item => {
                player.answers[item.alphagram] = {
                    userInput: '',
                    isCorrect: null,
                    score: 0
                };
            });
        });
        
        // Start countdown after 3 seconds
        setTimeout(() => {
            this.gameState.status = 'playing';
            this.startTimer();
        }, 3000);
    }

    startTimer() {
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            
            if (this.gameState.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    submitAnswer(socketId, alphagram, answer) {
        if (this.gameState.status !== 'playing') {
            return { success: false, error: 'Game not in progress' };
        }
        
        const player = this.getPlayer(socketId);
        if (!player) {
            return { success: false, error: 'Player not found' };
        }
        
        const alphagramData = this.gameState.alphagrams.find(a => a.alphagram === alphagram);
        if (!alphagramData) {
            return { success: false, error: 'Invalid alphagram' };
        }
        
        // Calculate score
        const result = calculateScore(
            alphagram, 
            answer, 
            alphagramData.isFake, 
            alphagramData.validWords
        );
        
        // Update player's answer
        player.answers[alphagram] = {
            userInput: answer,
            isCorrect: result.isCorrect,
            score: result.score
        };
        
        // Recalculate total score
        player.score = Object.values(player.answers)
            .reduce((total, ans) => total + (ans.score || 0), 0);
        
        return {
            success: true,
            result: {
                isCorrect: result.isCorrect,
                score: result.score,
                totalScore: player.score
            }
        };
    }

    endGame() {
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
            this.gameState.timer = null;
        }
        
        this.gameState.status = 'finished';
        this.gameState.endTime = Date.now();
        
        // Calculate final scores for any unanswered questions
        this.players.forEach(player => {
            this.gameState.alphagrams.forEach(alphagramData => {
                const answer = player.answers[alphagramData.alphagram];
                if (answer && answer.userInput === '') {
                    answer.score = 0;
                    answer.isCorrect = false;
                }
            });
            
            // Recalculate final score
            player.score = Object.values(player.answers)
                .reduce((total, ans) => total + (ans.score || 0), 0);
        });
    }

    getGameResults() {
        return {
            roomCode: this.roomCode,
            players: this.players.map(p => ({
                name: p.name,
                score: p.score,
                isHost: p.isHost
            })),
            winner: this.players.reduce((winner, player) => 
                player.score > (winner?.score || -Infinity) ? player : winner, null
            ),
            alphagrams: this.gameState.alphagrams.map(alphagram => ({
                alphagram: alphagram.alphagram,
                isFake: alphagram.isFake,
                validWords: alphagram.validWords,
                playerAnswers: this.players.map(p => ({
                    name: p.name,
                    answer: p.answers[alphagram.alphagram]
                }))
            }))
        };
    }

    getPublicState() {
        return {
            roomCode: this.roomCode,
            status: this.gameState.status,
            timeLeft: this.gameState.timeLeft,
            players: this.players.map(p => ({
                name: p.name,
                score: p.score,
                isHost: p.isHost,
                connected: p.connected
            })),
            alphagrams: this.gameState.status === 'playing' || this.gameState.status === 'finished' 
                ? this.gameState.alphagrams.map(a => ({
                    alphagram: a.alphagram,
                    isFake: this.gameState.status === 'finished' ? a.isFake : undefined,
                    validWords: this.gameState.status === 'finished' ? a.validWords : undefined
                }))
                : []
        };
    }
}

module.exports = GameManager;
