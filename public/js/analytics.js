/**
 * Shabble Game Analytics Framework
 * Tracks user game statistics and performance metrics
 */

class GameAnalytics {
    constructor() {
        this.analyticsData = null;
        this.serverEnabled = true;
        this.sessionToken = null;
        this.serverSessionId = null;
        this.currentSession = null;
        this.db = null;
        this.needsReregistration = false;
        this.registrationAttempts = 0;
        this.maxRegistrationAttempts = 3;
        this.sessionToken = localStorage.getItem('shabble_session_token');
        this.sessionCheckInterval = null;
    }

    init() {
        // Initialize or load existing analytics data
        this.loadAnalyticsData();
        // Clean up any duplicate records
        this.cleanupGameHistory();
        this.startNewSession();
        
        // Add test function for debugging notifications
        window.testNotification = () => {
            this.showSessionInvalidatedNotification();
        };
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
        if (!this.serverEnabled || !this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled) return;
        
        // Prevent infinite registration attempts
        if (this.registrationAttempts >= this.maxRegistrationAttempts) {
            console.warn('Max registration attempts reached, stopping to prevent infinite loop');
            return;
        }
        
        this.registrationAttempts++;
        
        try {
            const user = window.authManager.getCurrentUser();
            const profile = window.authManager.getCurrentUserProfile();
            
            // Check if we have a valid existing session first
            const existingToken = localStorage.getItem('shabble_session_token');
            if (existingToken) {
                const isValid = await this.validateExistingSession(user.uid, existingToken);
                if (isValid) {
                    this.sessionToken = existingToken;
                    this.registrationAttempts = 0; // Reset counter on success
                    await this.syncUserDataFromServer(user.uid);
                    return;
                } else {
                    localStorage.removeItem('shabble_session_token');
                }
            }
            
            const response = await fetch('/api/analytics/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    nickname: profile?.nickname || user.displayName,
                    country: profile?.country,
                    privacyConsent: this.analyticsData.preferences.trackingEnabled,
                    email: user.email,
                    displayName: user.displayName
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Store session token for future requests
                this.sessionToken = result.sessionToken;
                localStorage.setItem('shabble_session_token', result.sessionToken);
                this.registrationAttempts = 0; // Reset counter on success
                
                // Show subtle info button instead of notification
                this.showNewSessionInfoButton();
                
                // Sync user data from server
                await this.syncUserDataFromServer(user.uid);
            }
        } catch (error) {
            console.error('Error registering user with server:', error);
            // Add exponential backoff for retries
            setTimeout(() => {
                this.registrationAttempts = Math.max(0, this.registrationAttempts - 1);
            }, 5000 * this.registrationAttempts);
        }
    }

    async validateExistingSession(firebaseUid, sessionToken) {
        try {
            const response = await fetch(`/api/analytics/user/${firebaseUid}/stats?sessionToken=${encodeURIComponent(sessionToken)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // If we get user stats successfully, the session is valid
                return result.success === true;
            }
            return false;
        } catch (error) {
            console.error('Error validating session:', error);
            return false;
        }
    }

    // Sync user analytics data from server
    async syncUserDataFromServer(firebaseUid) {
        // Check if we need to re-register after session invalidation
        if (this.needsReregistration && !this.sessionToken) {
            await this.registerUserWithServer();
            this.needsReregistration = false;
        }
        
        if (!this.sessionToken) return;
        
        try {
            const response = await fetch(`/api/analytics/user/${firebaseUid}/stats?sessionToken=${encodeURIComponent(this.sessionToken)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const serverStats = result.stats;
                
                this.mergeServerData(serverStats);
            } else if (response.status === 401) {
                // Session invalid, clear token and show notification
                this.sessionToken = null;
                localStorage.removeItem('shabble_session_token');
                console.warn('Session invalidated by server');
                this.showSessionInvalidatedNotification();
            }
        } catch (error) {
            console.warn('Failed to sync user data from server:', error);
        }
    }

    // Merge server analytics data with local data
    mergeServerData(serverStats) {
        if (!serverStats) {
            console.warn('No server stats to merge');
            return;
        }
        
        // Handle different response formats
        let user, recentGames;
        if (serverStats.user) {
            // New format with user object
            user = serverStats.user;
            recentGames = serverStats.recentGames || [];
        } else {
            // Direct format - serverStats is the user data
            user = serverStats;
            recentGames = [];
        }
        
        
        // Update total statistics with server data
        this.analyticsData.totalStats = {
            gamesPlayed: user.total_games || 0,
            totalAlphagramsPresented: user.total_alphagrams || 0,
            totalAlphagramsCorrectlySolved: user.alphagrams_solved || 0,
            averageScore: Math.round(user.average_score || 0),
            bestScore: user.best_score || 0,
            totalScore: (user.total_games || 0) * (user.average_score || 0),
            // Add missing fields that might be needed
            totalCorrectFirstAttempt: 0,
            totalCorrectSecondAttempt: 0,
            totalMissed: 0,
            perfectGames: 0,
            streakCurrent: 0,
            streakBest: 0,
            totalPlayTime: 0,
            averageGameTime: 0,
            fastestGame: null,
            slowestGame: null
        };
        
        // Merge recent games (keep most recent 50)
        const serverGameIds = new Set(recentGames.map(g => g.id));
        const localGamesNotOnServer = this.analyticsData.gameHistory.filter(
            localGame => !serverGameIds.has(localGame.sessionId)
        );
        
        // Convert server games to local format
        const serverGamesConverted = recentGames.map(game => ({
            sessionId: game.id || `server_${Date.now()}_${Math.random()}`,
            date: game.date || game.created_at || new Date().toISOString(),
            wordLength: game.word_lengths ? (typeof game.word_lengths === 'string' ? JSON.parse(game.word_lengths) : game.word_lengths) : 'mixed',
            score: game.final_score || 0,
            firstAttemptScore: game.first_attempt_score || 0,
            alphagrams: game.total_alphagrams || 0,
            alphagramCount: game.total_alphagrams || 0,
            correctFirst: Math.floor((game.alphagrams_solved || 0) * 0.7), // Estimate
            correctSecond: Math.floor((game.alphagrams_solved || 0) * 0.3), // Estimate  
            correctlySolved: game.alphagrams_solved || 0,
            missed: Math.max(0, (game.total_alphagrams || 0) - (game.alphagrams_solved || 0)),
            completed: game.completed === 1,
            perfect: (game.alphagrams_solved || 0) === (game.total_alphagrams || 0) && (game.total_alphagrams || 0) > 0,
            duration: game.game_duration || 0,
            userId: game.user_id
        }));
        
        // Combine and sort by date (most recent first)
        const allGames = [...serverGamesConverted, ...localGamesNotOnServer];
        allGames.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Keep only the most recent 50 games
        this.analyticsData.gameHistory = allGames.slice(0, 50);
        
        // Save updated data
        this.saveAnalyticsData();
        
    }

    async startServerSession(wordLengths) {
        if (!this.serverEnabled || !this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled) {
            return;
        }
        
        // Check if we need to re-register after session invalidation
        if (this.needsReregistration) {
            console.log('Re-registering user after session invalidation');
            await this.registerUserWithServer();
            this.needsReregistration = false;
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
                    wordLengths,
                    firebaseUid: userId,
                    sessionToken: this.sessionToken
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                this.serverSessionId = result.sessionId;
                console.log('Server analytics session started successfully:', this.serverSessionId);
            } else if (response.status === 401) {
                console.warn('Session invalidated - you have been signed in on another device');
                console.log('About to call showSessionInvalidatedNotification');
                this.showSessionInvalidatedNotification();
            } else {
                console.error('Failed to start server session - HTTP', response.status);
            }
        } catch (error) {
            console.warn('Failed to start server analytics session:', error);
        }
    }

    async recordServerAttempt(alphagram, wordLength, solved, firstAttemptCorrect, secondAttemptCorrect, userAnswers, correctAnswers) {
        if (!this.serverEnabled || !this.serverSessionId || !this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled) return;
        
        try {
            const response = await fetch('/api/analytics/attempt', {
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
                    correctAnswers,
                    firebaseUid: this.analyticsData.userId,
                    sessionToken: this.sessionToken
                })
            });
            
            if (response.status === 401) {
                console.warn('Session invalidated during attempt recording');
                this.showSessionInvalidatedNotification();
            }
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
            
            try {
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
                        gameDuration,
                        firebaseUid: this.analyticsData.userId,
                        sessionToken: this.sessionToken
                    })
                });
                
                if (response.ok) {
                    console.log('Server analytics session finished successfully');
                } else if (response.status === 401) {
                    console.warn('Session invalidated during session finish');
                    this.showSessionInvalidatedNotification();
                } else {
                    console.error('Failed to finish server session - HTTP', response.status);
                }
            } catch (error) {
                console.warn('Failed to finish server analytics session:', error);
            }
            
            // Don't null the session ID yet - second attempt may need it
            // this.serverSessionId = null;
        } catch (error) {
            console.warn('Failed to finish server analytics session:', error);
        }
    }

    // Game event tracking
    trackGameStart(wordLength, alphagrams) {
        // Initialize analytics data if not present
        if (!this.analyticsData) {
            this.initializeAnalyticsData();
        }
        
        if (!this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled) return;

        // Reset any existing session to prevent conflicts
        this.currentSession = null;
        this.serverSessionId = null;

        // Start a fresh session
        this.startNewSession();

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
        if (!this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled || !this.currentSession) return;

        
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
        // We'll finish the server session later when we know if there's a second attempt
        this.processCompletedGame(false); // false = don't finish server session

    }

    trackSecondAttempt(results) {
        if (!this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled || !this.currentSession) return;

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
        
        // Prevent duplicate server session finish calls
        if (finishServerSession && this.currentSession.serverSessionFinished) {
            console.log('Server session already finished, skipping duplicate call');
            return;
        }
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
        

        // Calculate counts for display
        const correctFirstCount = session.alphagrams.filter(a => a.firstAttemptCorrect).length;
        const correctSecondCount = session.alphagrams.filter(a => a.secondAttemptCorrect).length;
        const missedCount = session.alphagrams.filter(a => a.missed).length;
        const alphagramCount = session.alphagrams.length;
        
        // Check if a game record already exists for this session (to prevent duplicates)
        const existingGameIndex = this.analyticsData.gameHistory.findIndex(
            game => game.sessionId === session.sessionId
        );

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

        if (existingGameIndex !== -1) {
            // Update existing record instead of creating duplicate
            console.log('Updating existing game record at index:', existingGameIndex);
            this.analyticsData.gameHistory[existingGameIndex] = gameRecord;
        } else {
            // Add new record to game history
            console.log('Adding new game record to history');
            this.analyticsData.gameHistory.unshift(gameRecord);
            if (this.analyticsData.gameHistory.length > 100) {
                this.analyticsData.gameHistory = this.analyticsData.gameHistory.slice(0, 100);
            }
        }

        console.log('About to save analytics data and call server finish');
        this.saveAnalyticsData();

        // Send data to server only if requested
        if (finishServerSession) {
            const alphagrams = session.alphagrams || [];
            const correctlySolved = alphagrams.filter(a => a.firstAttemptCorrect || a.secondAttemptCorrect).length;
            const finalScore = session.finalScore || 0;
            const gameDuration = session.timeTaken || 0;
            
            
            this.finishServerSession(
                alphagrams.length,
                correctlySolved,
                finalScore,
                firstAttemptScore,
                true,
                gameDuration
            );
            
            // Mark server session as finished to prevent duplicates
            this.currentSession.serverSessionFinished = true;

            // Record individual alphagram attempts to server
            alphagrams.forEach(alphagram => {
                const wordLength = alphagram.length || alphagram.alphagram?.length || 0;
                
                this.recordServerAttempt(
                    alphagram.alphagram,
                    wordLength,
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
        if (!this.analyticsData || !this.analyticsData.preferences || !this.analyticsData.preferences.trackingEnabled) return;

        console.log('finishGame called with session:', session);
        console.log('currentSession exists:', !!this.currentSession);
        console.log('currentSession completed:', this.currentSession?.completed);
        console.log('serverSessionFinished:', this.currentSession?.serverSessionFinished);

        // Check if this game was already processed by trackFirstAttempt/processCompletedGame
        if (this.currentSession && this.currentSession.completed) {
            console.log('Game already processed by trackFirstAttempt, checking if server session needs finishing');
            
            // If server session hasn't been finished yet, finish it now (single-attempt games)
            if (!this.currentSession.serverSessionFinished) {
                console.log('Finishing server session for single-attempt game');
                const alphagrams = this.currentSession.alphagrams || [];
                const correctlySolved = alphagrams.filter(a => a.firstAttemptCorrect || a.secondAttemptCorrect).length;
                const finalScore = this.currentSession.finalScore || 0;
                const firstAttemptScore = this.currentSession.firstAttemptScore || finalScore;
                const gameDuration = this.currentSession.timeTaken || 0;
                
                this.finishServerSession(
                    alphagrams.length,
                    correctlySolved,
                    finalScore,
                    firstAttemptScore,
                    true,
                    gameDuration
                );
                
                // Mark server session as finished
                this.currentSession.serverSessionFinished = true;
                
                // Record individual alphagram attempts to server
                alphagrams.forEach(alphagram => {
                    const wordLength = alphagram.length || alphagram.alphagram?.length || 0;
                    
                    this.recordServerAttempt(
                        alphagram.alphagram,
                        wordLength,
                        alphagram.firstAttemptCorrect || alphagram.secondAttemptCorrect,
                        alphagram.firstAttemptCorrect,
                        alphagram.secondAttemptCorrect,
                        alphagram.userAnswers || [],
                        alphagram.correctAnswers || []
                    );
                });
            } else {
                console.log('Server session already finished, skipping duplicate finish call');
            }

            // Reset current session to prevent duplicate processing
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
            finalScore,
            true,
            gameDuration
        );
        
        // Record individual alphagram attempts to server
        alphagrams.forEach(alphagram => {
            const wordLength = alphagram.length || alphagram.alphagram?.length || 0;
            
            this.recordServerAttempt(
                alphagram.alphagram,
                wordLength,
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
        if (!this.analyticsData) {
            return this.getDefaultAnalyticsData().totalStats;
        }
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
            recentGames: this.analyticsData.gameHistory ? this.analyticsData.gameHistory.slice(0, 10) : [],
            categoryBreakdown: this.analyticsData.categoryStats
        };
    }

    getDetailedStats() {
        if (!this.analyticsData) {
            return this.getDefaultAnalyticsData();
        }
        return this.analyticsData;
    }

    getCurrentSession() {
        return this.currentSession;
    }

    // Utility methods
    async clearAllData() {
        // Clear server data first if user is authenticated and has session token
        if (this.analyticsData?.userId && this.sessionToken) {
            try {
                const response = await fetch('/api/analytics/user/clear', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        firebaseUid: this.analyticsData.userId,
                        sessionToken: this.sessionToken
                    })
                });
                
                if (response.ok) {
                    console.log('Server data cleared successfully');
                } else {
                    console.warn('Failed to clear server data:', response.status);
                }
            } catch (error) {
                console.warn('Error clearing server data:', error);
            }
        }
        
        // Clear local data
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem('shabble_session_token');
        this.analyticsData = this.getDefaultAnalyticsData();
        this.currentSession = null;
        this.sessionToken = null;
        this.serverEnabled = true; // Re-enable for future sessions
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
        if (!this.analyticsData || !this.analyticsData.preferences) return;
        this.analyticsData.preferences.trackingEnabled = enabled;
        this.saveAnalyticsData();
    }

    isTrackingEnabled() {
        return this.analyticsData?.preferences?.trackingEnabled || false;
    }

    // Show notification when session is invalidated
    showSessionInvalidatedNotification() {
        console.log('Showing session invalidated notification');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'session-invalidated-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>🔄 Session Updated</h3>
                <p>You've signed in on another device. Don't worry - your game progress is safe and will sync automatically across all your devices.</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: Arial, sans-serif;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            margin: 0;
        `;
        
        notification.querySelector('h3').style.cssText = `
            margin: 0 0 10px 0;
            font-size: 16px;
        `;
        
        notification.querySelector('p').style.cssText = `
            margin: 0 0 15px 0;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notification.querySelector('button').style.cssText = `
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
        
        // Clear invalid session token but keep server enabled
        this.sessionToken = null;
        localStorage.removeItem('shabble_session_token');
        
        // Mark that we need to re-register on next user action to avoid infinite loops
        this.needsReregistration = true;
        this.registrationAttempts = 0; // Reset attempts when session is invalidated
        
        console.log('Session invalidated notification shown and server analytics disabled');
    }

    // Show subtle info button that glows once
    showNewSessionInfoButton() {
        console.log('Showing new session info button');
        
        // Remove any existing info button
        const existingButton = document.querySelector('.session-info-button');
        if (existingButton) {
            existingButton.remove();
        }
        
        // Create info button
        const infoButton = document.createElement('div');
        infoButton.className = 'session-info-button';
        infoButton.innerHTML = `<i class="fas fa-info-circle"></i>`;
        
        // Add styles
        infoButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 32px;
            height: 32px;
            background: #2196F3;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            animation: sessionInfoGlow 2s ease-in-out;
        `;
        
        // Add glow animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes sessionInfoGlow {
                0% { box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
                50% { box-shadow: 0 0 20px rgba(33, 150, 243, 0.8), 0 0 30px rgba(33, 150, 243, 0.4); }
                100% { box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
            }
        `;
        document.head.appendChild(style);
        
        // Add click handler to show notification
        infoButton.addEventListener('click', () => {
            this.showNewSessionNotification();
            infoButton.remove();
        });
        
        // Add hover effect
        infoButton.addEventListener('mouseenter', () => {
            infoButton.style.transform = 'scale(1.1)';
        });
        
        infoButton.addEventListener('mouseleave', () => {
            infoButton.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(infoButton);
        
        // Auto-remove after 30 seconds if not clicked
        setTimeout(() => {
            if (infoButton.parentElement) {
                infoButton.remove();
            }
        }, 30000);
        
        console.log('New session info button shown');
    }

    // Show notification on new browser that other devices will be logged out
    showNewSessionNotification() {
        console.log('Showing new session notification');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'new-session-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <h3>✅ Signed In Successfully</h3>
                <p>You're now signed in! Other devices using this account will be automatically logged out for security.</p>
                <button onclick="this.parentElement.parentElement.remove()">Got it</button>
            </div>
        `;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2196F3;
            color: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 350px;
            font-family: Arial, sans-serif;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            margin: 0;
        `;
        
        notification.querySelector('h3').style.cssText = `
            margin: 0 0 10px 0;
            font-size: 16px;
        `;
        
        notification.querySelector('p').style.cssText = `
            margin: 0 0 15px 0;
            font-size: 14px;
            line-height: 1.4;
        `;
        
        notification.querySelector('button').style.cssText = `
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.3);
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 8000);
        
        console.log('New session notification shown');
    }
}

// Initialize global analytics instance
window.gameAnalytics = new GameAnalytics();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameAnalytics;
}