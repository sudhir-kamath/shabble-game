# Shabble - Multiplayer Word Game

A real-time multiplayer anagram game where two players compete to unscramble 4-letter words.

## 🎮 Features

- **Single Player Mode** - Original game experience
- **Multiplayer Mode** - Real-time competition with room codes
- **WebSocket Communication** - Live score updates and synchronization
- **Responsive Design** - Works on desktop and mobile
- **Dark/Light Theme** - Toggle between themes

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

### Manual Railway Deployment:

1. **Fork/Clone** this repository
2. **Sign up** at [railway.app](https://railway.app)
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your forked repository
5. **Deploy** - Railway will auto-detect and deploy!

Your game will be live at: `https://your-app-name.railway.app`

## 🛠️ Local Development

```bash
# Install dependencies
cd server
npm install

# Start server
npm start

# Open browser
http://localhost:3000
```

## 🎯 How to Play

### Single Player
1. Click "Single Player"
2. Solve 20 alphagrams in 2 minutes
3. Type 'x' for fake word sets

### Multiplayer
1. **Host**: Click "Multiplayer" → Create Room → Share 6-digit code
2. **Guest**: Enter code → Join Room
3. **Host** starts the game
4. Compete in real-time!

## 📁 Project Structure

```
├── server/
│   ├── server.js          # Express + Socket.IO server
│   ├── gameManager.js     # Room management
│   ├── gameLogic.js       # Game mechanics
│   └── package.json       # Server dependencies
├── js/
│   ├── main.js           # Main game logic
│   ├── game.js           # Single player game
│   ├── multiplayerClient.js # WebSocket client
│   └── dictionary.js     # Word dictionary
├── css/
│   └── styles.css        # Game styling
└── index.html           # Main game page
```

## 🌐 Alternative Deployment Options

### Render
1. Connect GitHub at [render.com](https://render.com)
2. Build: `cd server && npm install`
3. Start: `cd server && npm start`

### Fly.io
```bash
npm install -g @fly.io/flyctl
fly auth login
fly launch
fly deploy
```

## 🎨 Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Deployment**: Railway, Render, Fly.io

## 📝 License

MIT License - feel free to fork and modify!
