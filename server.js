const express = require('express');
const path = require('path');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Game API routes (we will create this)
const gameRoutes = require('./routes/game-routes');
app.use('/api/game', gameRoutes);

// Auth API routes (we will create this)
const authRoutes = require('./routes/auth-routes');
app.use('/api/auth', authRoutes);

// A simple test route
app.get('/api/hello', (req, res) => {
    res.send('Hello from the Shabble backend!');
});

// Serve the main index.html for any other requests, to support client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
