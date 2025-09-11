/**
 * Shabble Game Analytics Framework
 * Tracks user game statistics and performance metrics
 */

class GameAnalytics {
    constructor() {
        this.storageKey = 'shabble-analytics';
        this.sessionKey = 'shabble-session';
        this.currentSession = null;
        this.serverSessionId = null;
        this.serverEnabled = true; // Enable server analytics by default
        this.init();
    }

    init() {
        // Initialize or load existing analytics data
        this.loadAnalyticsData();
        // Clean up any duplicate records
        this.cleanupGameHistory();
        this.startNewSession();
    }

    // Data structure for user analytics
    getDefaultAnalyticsData() {
        return {
            version: '1.0',
            userId: null,
            totalStats: {
                gamesPlayed: 0,
                totalAlphagramsPresented: 0,
                totalAlphagramsCorrectlySolved: 0,
                totalCorrectFirstAttempt: 0,
                totalCorrectSecondAttempt: 0,
                totalMissed: 0,
                bestScore: 0,
                averageScore: 0,
                totalScore: 0,
                perfectGames: 0,
                streakBest: 0,
                streakCurrent: 0
            },
            gameHistory: [], // Recent games (limit to last 100)
            wordStats: {}, // Per-word performance tracking
            categoryStats: {}, // Performance by word length
            timeStats: {
                totalPlayTime: 0,
                averageGameTime: 0,
                fastestGame: null,
                slowestGame: null
            },
            achievements: [], // Future achievement system
            preferences: {
                trackingEnabled: true,
                shareStats: false
            },
            lastUpdated: new Date().toISOString()
        };
    }

    // Session tracking for current game
    getDefaultSession() {
        return {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            gameStartTime: null,
            gameEndTime: null,
            wordLength: null,
            alphagrams: [],
            firstAttemptResults: [],
            secondAttemptResults: [],
            finalScore: 0,
            completed: false,
            userId: null
        };
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    loadAnalyticsData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            this.analyticsData = stored ? JSON.parse(stored) : this.getDefaultAnalyticsData();
            
            // Migrate old data structure if needed
            if (!this.analyticsData.version) {
                this.migrateData();
            }
        } catch (error) {
            console.warn('Failed to load analytics data:', error);
            this.analyticsData = this.getDefaultAnalyticsData();
        }
    }

    saveAnalyticsData() {
        try {
            this.analyticsData.lastUpdated = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(this.analyticsData));
        } catch (error) {
            console.warn('Failed to save analytics data:', error);
        }
    }

    // Session management
    startNewSession() {
        this.currentSession = this.getDefaultSession();
        
        // Set user ID if authenticated
        if (window.authManager && window.authManager.isSignedIn()) {
            const user = window.authManager.getCurrentUser();
            this.currentSession.userId = user?.uid || null;
            this.analyticsData.userId = user?.uid || null;
            
            // Register user with server analytics
            this.registerUserWithServer();
        }
    }

    // Server analytics methods
    async registerUserWithServer() {
        if (!this.serverEnabled || !window.authManager?.isSignedIn()) return;
        
        try {
            const user = window.authManager.getCurrentUser();
            const profile = window.authManager.getCurrentUserProfile();
            
            const response = await fetch('/api/analytics/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    nickname: profile?.nickname || user.displayName,
                    country: profile?.country,
                    privacyConsent: this.analyticsData.preferences.trackingEnabled
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('User registered with server analytics:', result);
            }
        } catch (error) {
            console.warn('Failed to register user with server analytics:', error);
        }
    }

    async startServerSession(wordLengths) {
        if (!this.serverEnabled || !this.analyticsData.preferences.trackingEnabled) {
            console.log('Server session not started - serverEnabled:', this.serverEnabled, 'trackingEnabled:', this.analyticsData.preferences.trackingEnabled);
            return;
        }
        
        console.log('Starting server session for word lengths:', wordLengths);
        
        try {
            // Try multiple ways to get the authenticated user
            let userId = null;
            let authSource = 'none';
            
            // Method 1: Check AuthManager
            if (window.authManager?.isSignedIn()) {
                userId = window.authManager.getCurrentUser()?.uid;
                authSource = 'authManager';
            }
            
            // Method 2: Check Firebase Auth directly
            if (!userId && window.firebaseAuth) {
                const currentUser = window.firebaseAuth.currentUser;
                if (currentUser) {
                    userId = currentUser.uid;
                    authSource = 'window.firebaseAuth';
                }
            }
            
            // Method 3: Check legacy Firebase
            if (!userId && window.firebase?.auth) {
                const currentUser = window.firebase.auth().currentUser;
                if (currentUser) {
                    userId = currentUser.uid;
                    authSource = 'firebase.auth';
                }
            }
            
            console.log('Auth debug - userId:', userId, 'source:', authSource);
            console.log('Starting server session for userId:', userId, 'wordLengths:', wordLengths);
            
            const response = await fetch('/api/analytics/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    wordLengths
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.serverSessionId = result.sessionId;
                console.log('Server analytics session started successfully:', this.serverSessionId);
            } else {
                console.error('Failed to start server session - HTTP', response.status);
            }
        } catch (error) {
            console.warn('Failed to start server analytics session:', error);
        }
    }

    async recordServerAttempt(alphagram, wordLength, solved, firstAttemptCorrect, secondAttemptCorrect, userAnswers, correctAnswers) {
        if (!this.serverEnabled || !this.serverSessionId || !this.analyticsData.preferences.trackingEnabled) return;
        
        try {
            await fetch('/api/analytics/attempt', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.serverSessionId,
                    alphagram,
                    wordLength,
                    solved,
                    firstAttemptCorrect,
                    secondAttemptCorrect,
                    userAnswers,
                    correctAnswers
                })
            });
        } catch (error) {
            console.warn('Failed to record server attempt:', error);
        }
    }

    async finishServerSession(totalAlphagrams, alphagramsSolved, finalScore, firstAttemptScore, completed, gameDuration) {
        if (!this.serverEnabled || !this.serverSessionId) {
            console.log('finishServerSession skipped - serverEnabled:', this.serverEnabled, 'serverSessionId:', this.serverSessionId);
            return;
        }
        
        try {
            console.log('Finishing server session with data:', {
                sessionId: this.serverSessionId,
                totalAlphagrams,
                alphagramsSolved,
                finalScore,
                firstAttemptScore,
                completed,
                gameDuration
            });
            
            const response = await fetch('/api/analytics/session/finish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.serverSessionId,
                    totalAlphagrams,
                    alphagramsSolved,
                    finalScore,
                    firstAttemptScore,
                    completed,
                    gameDuration
                })
            });
            
            if (!response.ok) {
                console.error('Server session finish failed:', response.status, response.statusText);
            } else {
                console.log('Server analytics session finished successfully');
            }
            
            // Don't null the session ID yet - second attempt may need it
            // this.serverSessionId = null;
        } catch (error) {
            console.warn('Failed to finish server analytics session:', error);
        }
    }

    // Game event tracking
    trackGameStart(wordLength, alphagrams) {
        if (!this.analyticsData.preferences.trackingEnabled) return;

        // Ensure we have a valid session
        if (!this.currentSession) {
            this.startNewSession();
        }

        this.currentSession.gameStartTime = new Date().toISOString();
        this.currentSession.wordLength = wordLength;
        this.currentSession.alphagrams = alphagrams.map(item => ({
            alphagram: item.alphagram,
            length: item.length || item.alphagram.length,
            seen: true,
            firstAttemptCorrect: false,
            secondAttemptCorrect: false,
            missed: false,
            userAnswers: []
        }));

        // Start server session
        const wordLengths = Array.isArray(wordLength) ? wordLength : [wordLength];
        console.log('Starting server session with word lengths:', wordLengths);
        this.startServerSession(wordLengths);

    }

    trackFirstAttempt(results) {
        if (!this.analyticsData.preferences.trackingEnabled || !this.currentSession) return;

        console.log('trackFirstAttempt called with results:', results);
        console.log('DEBUG: trackFirstAttempt - results.score from game:', results.score);
        
        this.currentSession.firstAttemptResults = results.results || [];
        this.currentSession.finalScore = results.score || 0;
        this.currentSession.gameEndTime = new Date().toISOString();
        this.currentSession.completed = true;
        
        // Calculate first attempt score from individual results
        let firstAttemptScore = 0;
        
        // Update session alphagram data
        this.currentSession.alphagrams.forEach(sessionAlphagram => {
            const result = this.currentSession.firstAttemptResults.find(r => r.alphagram === sessionAlphagram.alphagram);
            if (result) {
                sessionAlphagram.firstAttemptCorrect = result.isCorrect === true;
                sessionAlphagram.missed = result.isCorrect === false;
                
                // Ensure result has a score property
                const resultScore = result.score || 0;
                firstAttemptScore += resultScore;
                
                sessionAlphagram.userAnswers.push({
                    attempt: 1,
                    answer: result.userInput,
                    correct: result.isCorrect === true,
                    score: resultScore
                });
            }
        });
        
        // Store the calculated first attempt score in the session
        this.currentSession.firstAttemptScore = firstAttemptScore;
        
        console.log('First attempt score calculated:', firstAttemptScore);
        console.log('Session alphagrams after processing:', this.currentSession.alphagrams);

        // Process and save the completed game (but don't finish server session yet)
        this.processCompletedGame(false); // false = don't finish server session

    }

    trackSecondAttempt(results) {
        if (!this.analyticsData.preferences.trackingEnabled || !this.currentSession) return;

        this.currentSession.secondAttemptResults = results.results || [];
        this.currentSession.finalScore = results.score || 0;
        this.currentSession.gameEndTime = new Date().toISOString();

        // Update session alphagram data
        this.currentSession.alphagrams.forEach(sessionAlphagram => {
            const result = this.currentSession.secondAttemptResults.find(r => r.alphagram === sessionAlphagram.alphagram);
            if (result) {
                sessionAlphagram.secondAttemptCorrect = result.isCorrect === true;
                sessionAlphagram.missed = result.isCorrect === false;
                sessionAlphagram.userAnswers.push({
                    attempt: 2,
                    answer: result.userInput,
                    correct: result.isCorrect === true,
                    score: result.score || 0
                });
            }
        });

        // Process and save the completed game with server session finish
        this.processCompletedGame(true); // true = finish server session with final score

    }

    updateExistingGameRecord() {
        if (!this.currentSession) return;

        const session = this.currentSession;
        
        // Find the existing game record by sessionId
        const existingGameIndex = this.analyticsData.gameHistory.findIndex(
            game => game.sessionId === session.sessionId
        );

        if (existingGameIndex !== -1) {
            // Update the existing record with second attempt data
            const gameRecord = this.analyticsData.gameHistory[existingGameIndex];
            gameRecord.score = session.finalScore;
            gameRecord.correctSecond = session.alphagrams.filter(a => a.secondAttemptCorrect).length;
            gameRecord.missed = session.alphagrams.filter(a => a.missed).length;
            
            // Update game duration
            const gameTime = session.gameEndTime && session.gameStartTime ? 
                new Date(session.gameEndTime) - new Date(session.gameStartTime) : 0;
            gameRecord.duration = gameTime;

            // Save updated analytics
            this.saveAnalyticsData();
            
        }
    }

    processCompletedGame(finishServerSession = true) {
        if (!this.currentSession || !this.currentSession.completed) return;

        console.log('processCompletedGame called - finishServerSession:', finishServerSession);
        const session = this.currentSession;
        const stats = this.analyticsData.totalStats;

        // Calculate game duration
        const gameTime = session.gameEndTime && session.gameStartTime ? 
            new Date(session.gameEndTime) - new Date(session.gameStartTime) : 0;

        // Update total stats
        stats.gamesPlayed++;
        stats.totalAlphagramsPresented += session.alphagrams.length;
        stats.totalAlphagramsCorrectlySolved += session.alphagrams.filter(a => a.firstAttemptCorrect || a.secondAttemptCorrect).length;
        stats.totalCorrectFirstAttempt += session.alphagrams.filter(a => a.firstAttemptCorrect).length;
        stats.totalCorrectSecondAttempt += session.alphagrams.filter(a => a.secondAttemptCorrect).length;
        stats.totalMissed += session.alphagrams.filter(a => a.missed).length;
        stats.totalScore += session.finalScore;
        stats.averageScore = Math.round(stats.totalScore / stats.gamesPlayed);

        // Update best score
        if (session.finalScore > stats.bestScore) {
            stats.bestScore = session.finalScore;
        }

        // Check for perfect game
        const perfectGame = session.alphagrams.every(a => a.firstAttemptCorrect);
        if (perfectGame) {
            stats.perfectGames++;
            stats.streakCurrent++;
            if (stats.streakCurrent > stats.streakBest) {
                stats.streakBest = stats.streakCurrent;
            }
        } else {
            stats.streakCurrent = 0;
        }

        // Update time stats
        if (gameTime > 0) {
            stats.totalPlayTime += gameTime;
            stats.averageGameTime = Math.round(stats.totalPlayTime / stats.gamesPlayed);
            
            if (!stats.fastestGame || gameTime < stats.fastestGame) {
                stats.fastestGame = gameTime;
            }
            if (!stats.slowestGame || gameTime > stats.slowestGame) {
                stats.slowestGame = gameTime;
            }
        }

        // Update category stats (by word length)
        const lengthKey = `length_${session.wordLength}`;
        if (!this.analyticsData.categoryStats[lengthKey]) {
            this.analyticsData.categoryStats[lengthKey] = {
                gamesPlayed: 0,
                averageScore: 0,
                totalScore: 0,
                perfectGames: 0
            };
        }
        const categoryStats = this.analyticsData.categoryStats[lengthKey];
        categoryStats.gamesPlayed++;
        categoryStats.totalScore += session.finalScore;
        categoryStats.averageScore = Math.round(categoryStats.totalScore / categoryStats.gamesPlayed);
        if (perfectGame) categoryStats.perfectGames++;

        // Update word-specific stats
        session.alphagrams.forEach(alphagram => {
            const wordKey = alphagram.alphagram;
            if (!this.analyticsData.wordStats[wordKey]) {
                this.analyticsData.wordStats[wordKey] = {
                    seen: 0,
                    firstAttemptCorrect: 0,
                    secondAttemptCorrect: 0,
                    missed: 0,
                    lastSeen: null
                };
            }
            const wordStats = this.analyticsData.wordStats[wordKey];
            wordStats.seen++;
            if (alphagram.firstAttemptCorrect) wordStats.firstAttemptCorrect++;
            if (alphagram.secondAttemptCorrect) wordStats.secondAttemptCorrect++;
            if (alphagram.missed) wordStats.missed++;
            wordStats.lastSeen = new Date().toISOString();
        });

        // Use the pre-calculated first attempt score from session, or calculate it as fallback
        const firstAttemptScore = session.firstAttemptScore || 
            (session.firstAttemptResults ? 
                session.firstAttemptResults.reduce((sum, result) => sum + (result.score || 0), 0) : 0);
        
        console.log('processCompletedGame - firstAttemptScore:', firstAttemptScore);
        console.log('processCompletedGame - session.finalScore:', session.finalScore);
        console.log('processCompletedGame - session.firstAttemptScore:', session.firstAttemptScore);
        console.log('processCompletedGame - DEBUG: About to use finalScore for server:', session.finalScore);

        // Calculate counts for display
        const correctFirstCount = session.alphagrams.filter(a => a.firstAttemptCorrect).length;
        const correctSecondCount = session.alphagrams.filter(a => a.secondAttemptCorrect).length;
        const missedCount = session.alphagrams.filter(a => a.missed).length;
        const alphagramCount = session.alphagrams.length;
        
        // Add to game history (keep last 100 games)
        const gameRecord = {
            sessionId: session.sessionId,
            date: session.gameEndTime,
            wordLength: session.wordLength,
            score: session.finalScore,
            firstAttemptScore: firstAttemptScore,
            alphagramCount: alphagramCount,
            correctFirst: correctFirstCount,
            correctSecond: correctSecondCount,
            missed: missedCount,
            perfect: perfectGame,
            duration: gameTime,
            userId: session.userId
        };
        
        console.log('Game record created:', gameRecord);

        this.analyticsData.gameHistory.unshift(gameRecord);
        if (this.analyticsData.gameHistory.length > 100) {
            this.analyticsData.gameHistory = this.analyticsData.gameHistory.slice(0, 100);
        }

        console.log('About to save analytics data and call server finish');
        this.saveAnalyticsData();

        // Send data to server only if requested
        if (finishServerSession) {
            const alphagrams = session.alphagrams || [];
            const correctlySolved = alphagrams.filter(a => a.firstAttemptCorrect || a.secondAttemptCorrect).length;
            const finalScore = session.finalScore || 0;
            const gameDuration = session.timeTaken || 0;
            console.log('DEBUG: session.finalScore value being sent to server:', finalScore);
            
            console.log('About to call finishServerSession with:', {
                totalAlphagrams: alphagrams.length,
                alphagramsSolved: correctlySolved,
                finalScore: finalScore,
                firstAttemptScore: firstAttemptScore,
                completed: true,
                gameDuration: gameDuration,
                serverSessionId: this.serverSessionId,
                serverEnabled: this.serverEnabled
            });
            
            this.finishServerSession(
                alphagrams.length,
                correctlySolved,
                finalScore,
                firstAttemptScore,
                true,
                gameDuration
            );

            // Record individual alphagram attempts to server
            alphagrams.forEach(alphagram => {
                this.recordServerAttempt(
                    alphagram.alphagram,
                    alphagram.length,
                    alphagram.firstAttemptCorrect || alphagram.secondAttemptCorrect,
                    alphagram.firstAttemptCorrect,
                    alphagram.secondAttemptCorrect,
                    alphagram.userAnswers || [],
                    alphagram.correctAnswers || []
                );
            });
        }

    }

    finishGame(session) {
        if (!this.analyticsData.preferences.trackingEnabled) return;

        // Check if this game was already processed by trackFirstAttempt/processCompletedGame
        if (this.currentSession && this.currentSession.completed) {
            console.log('Game already processed by trackFirstAttempt, skipping finishGame record creation');
            // Only handle server-side analytics, don't create duplicate records
            const alphagrams = session.alphagrams || session.results || [];
            const correctlySolved = alphagrams.filter(a => a.isCorrect === true).length;
            const finalScore = session.finalScore || session.score || 0;
            const gameDuration = session.timeTaken || 0;
            
            // Don't call finishServerSession here - it's already handled by trackFirstAttempt/trackSecondAttempt
            // this.finishServerSession(
            //     alphagrams.length,
            //     correctlySolved,
            //     finalScore,
            //     true,
            //     gameDuration
            // );

            // Record individual alphagram attempts to server
            alphagrams.forEach(alphagram => {
                this.recordServerAttempt(
                    alphagram.alphagram,
                    alphagram.length,
                    alphagram.isCorrect === true,
                    alphagram.isCorrect === true,
                    false,
                    alphagram.userAnswers,
                    []
                );
            });

            // Reset current session
            this.currentSession = null;
            return;
        }

        // Update total statistics
        this.analyticsData.totalStats.gamesPlayed++;
        
        // Handle different session result formats
        const alphagrams = session.alphagrams || session.results || [];
        this.analyticsData.totalStats.totalAlphagramsPresented += alphagrams.length;
        
        // Count correctly solved alphagrams (only count true, not 'blank' or 'partial')
        const correctlySolved = alphagrams.filter(a => 
            a.isCorrect === true
        ).length;
        
        this.analyticsData.totalStats.totalAlphagramsCorrectlySolved += correctlySolved;
        
        // Update score statistics
        const finalScore = session.finalScore || session.score || 0;
        if (finalScore > this.analyticsData.totalStats.bestScore) {
            this.analyticsData.totalStats.bestScore = finalScore;
        }
        
        this.analyticsData.totalStats.totalScore += finalScore;
        this.analyticsData.totalStats.averageScore = 
            this.analyticsData.totalStats.totalScore / this.analyticsData.totalStats.gamesPlayed;

        // Add to game history (keep last 100 games) - ensure consistent structure
        const gameRecord = {
            date: new Date().toISOString(),
            score: finalScore,
            firstAttemptScore: finalScore, // For finishGame method, first attempt score equals final score
            alphagrams: alphagrams.length,
            alphagramCount: alphagrams.length, // Add for display consistency
            correctlySolved: correctlySolved,
            correctFirst: correctlySolved, // Add for display consistency
            correctSecond: 0, // No second attempt in this flow
            missed: alphagrams.length - correctlySolved,
            wordLength: session.wordLength || 'mixed',
            duration: session.timeTaken || 0,
            perfect: correctlySolved === alphagrams.length,
            userId: session.userId || null
        };
        
        this.analyticsData.gameHistory.unshift(gameRecord);
        if (this.analyticsData.gameHistory.length > 100) {
            this.analyticsData.gameHistory = this.analyticsData.gameHistory.slice(0, 100);
        }

        console.log('About to save analytics data and call server finish');
        this.saveAnalyticsData();

        // Send data to server
        const gameDuration = session.timeTaken || 0;
        console.log('About to call finishServerSession with:', {
            totalAlphagrams: alphagrams.length,
            alphagramsSolved: correctlySolved,
            finalScore: finalScore,
            firstAttemptScore: firstAttemptScore,
            completed: true,
            gameDuration: gameDuration,
            serverSessionId: this.serverSessionId,
            serverEnabled: this.serverEnabled
        });
        
        this.finishServerSession(
            alphagrams.length,
            correctlySolved,
            finalScore,
            firstAttemptScore,
            true,
            gameDuration
        );

        // Record individual alphagram attempts to server
        alphagrams.forEach(alphagram => {
            this.recordServerAttempt(
                alphagram.alphagram,
                alphagram.length,
                alphagram.isCorrect === true,
                alphagram.isCorrect === true,
                false, // No second attempt tracking in current system
                alphagram.userAnswers,
                [] // We don't have correct answers stored in the session
            );
        });

        // Save updated analytics
        this.saveAnalyticsData();
        
        // Reset current session
        this.currentSession = null;
    }

    // Data retrieval methods
    getStats() {
        const gameHistory = this.analyticsData.gameHistory || [];
        
        // Calculate average first attempt score from game history
        const averageFirstAttemptScore = gameHistory.length > 0 ? 
            Math.round(gameHistory.reduce((sum, game) => sum + (game.firstAttemptScore || 0), 0) / gameHistory.length) : 0;
        
        // Calculate average final score from game history
        const averageFinalScore = gameHistory.length > 0 ? 
            Math.round(gameHistory.reduce((sum, game) => sum + (game.score || 0), 0) / gameHistory.length) : 0;

        return {
            ...this.analyticsData.totalStats,
            averageFirstAttemptScore,
            averageFinalScore,
            recentGames: gameHistory.slice(0, 10),
            categoryBreakdown: this.analyticsData.categoryStats
        };
    }

    getDetailedStats() {
        return this.analyticsData;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    // Utility methods
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.sessionKey);
        this.analyticsData = this.getDefaultAnalyticsData();
        this.currentSession = null;
    }

    // Remove duplicate game records and fix data inconsistencies
    cleanupGameHistory() {
        if (!this.analyticsData.gameHistory || this.analyticsData.gameHistory.length === 0) return;

        console.log('Cleaning up game history, before:', this.analyticsData.gameHistory.length);
        
        // Group games by timestamp (within 1 minute) to identify duplicates
        const uniqueGames = [];
        const processedTimes = new Set();
        
        this.analyticsData.gameHistory.forEach(game => {
            const gameTime = new Date(game.date).getTime();
            const timeKey = Math.floor(gameTime / 60000); // Group by minute
            
            if (!processedTimes.has(timeKey)) {
                // Fix word length display for mixed games
                if (Array.isArray(game.wordLength)) {
                    game.wordLength = game.wordLength.join(',');
                } else if (game.wordLength === 'mixed') {
                    game.wordLength = '2,3,4,5';
                }
                
                uniqueGames.push(game);
                processedTimes.add(timeKey);
            }
        });
        
        this.analyticsData.gameHistory = uniqueGames;
        console.log('Cleaned up game history, after:', this.analyticsData.gameHistory.length);
        
        this.saveAnalyticsData();
    }

    exportData() {
        return JSON.stringify(this.analyticsData, null, 2);
    }

    migrateData() {
        // Handle future data structure migrations
        this.analyticsData.version = '1.0';
        this.saveAnalyticsData();
    }

    // Privacy controls
    setTrackingEnabled(enabled) {
        this.analyticsData.preferences.trackingEnabled = enabled;
        this.saveAnalyticsData();
    }

    isTrackingEnabled() {
        return this.analyticsData.preferences.trackingEnabled;
    }
}

// Initialize global analytics instance
window.gameAnalytics = new GameAnalytics();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameAnalytics;
}