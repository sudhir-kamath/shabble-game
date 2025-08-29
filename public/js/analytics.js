/**
 * Shabble Game Analytics Framework
 * Tracks user game statistics and performance metrics
 */

class GameAnalytics {
    constructor() {
        this.storageKey = 'shabble-analytics';
        this.sessionKey = 'shabble-session';
        this.currentSession = null;
        this.init();
    }

    init() {
        // Initialize or load existing analytics data
        this.loadAnalyticsData();
        this.startNewSession();
    }

    // Data structure for user analytics
    getDefaultAnalyticsData() {
        return {
            version: '1.0',
            userId: null,
            totalStats: {
                gamesPlayed: 0,
                totalAlphagramsSeen: 0,
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
        }
    }

    // Game event tracking
    trackGameStart(wordLength, alphagrams) {
        if (!this.analyticsData.preferences.trackingEnabled) return;

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

        console.log('Analytics: Game started', { wordLength, alphagramCount: alphagrams.length });
    }

    trackFirstAttempt(results) {
        if (!this.analyticsData.preferences.trackingEnabled || !this.currentSession) return;

        this.currentSession.firstAttemptResults = results.results || [];
        this.currentSession.finalScore = results.score || 0;
        this.currentSession.gameEndTime = new Date().toISOString();
        this.currentSession.completed = true;
        
        // Update session alphagram data
        this.currentSession.alphagrams.forEach(sessionAlphagram => {
            const result = this.currentSession.firstAttemptResults.find(r => r.alphagram === sessionAlphagram.alphagram);
            if (result) {
                sessionAlphagram.firstAttemptCorrect = result.isCorrect === true;
                sessionAlphagram.missed = result.isCorrect !== true;
                sessionAlphagram.userAnswers.push({
                    attempt: 1,
                    answer: result.userInput,
                    correct: result.isCorrect === true,
                    score: result.score || 0
                });
            }
        });

        // Process and save the completed game
        this.processCompletedGame();

        console.log('Analytics: First attempt tracked', { 
            correct: this.currentSession.firstAttemptResults.filter(r => r.isCorrect === true).length,
            total: this.currentSession.firstAttemptResults.length 
        });
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
                sessionAlphagram.missed = result.isCorrect !== true;
                sessionAlphagram.userAnswers.push({
                    attempt: 2,
                    answer: result.userInput,
                    correct: result.isCorrect === true,
                    score: result.score || 0
                });
            }
        });

        // Update the existing game record instead of creating a new one
        this.updateExistingGameRecord();

        console.log('Analytics: Second attempt tracked', { 
            finalScore: this.currentSession.finalScore,
            completed: true 
        });
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
            
            console.log('Analytics: Existing game record updated', gameRecord);
        }
    }

    processCompletedGame() {
        if (!this.currentSession || !this.currentSession.completed) return;

        const session = this.currentSession;
        const stats = this.analyticsData.totalStats;

        // Calculate game duration
        const gameTime = session.gameEndTime && session.gameStartTime ? 
            new Date(session.gameEndTime) - new Date(session.gameStartTime) : 0;

        // Update total stats
        stats.gamesPlayed++;
        stats.totalAlphagramsSeen += session.alphagrams.length;
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

        // Calculate first attempt score from session data
        const firstAttemptScore = session.firstAttemptResults ? 
            session.firstAttemptResults.reduce((sum, result) => sum + (result.score || 0), 0) : 0;

        // Add to game history (keep last 100 games)
        const gameRecord = {
            sessionId: session.sessionId,
            date: session.gameEndTime,
            wordLength: session.wordLength,
            score: session.finalScore,
            firstAttemptScore: firstAttemptScore,
            alphagramCount: session.alphagrams.length,
            correctFirst: session.alphagrams.filter(a => a.firstAttemptCorrect).length,
            correctSecond: session.alphagrams.filter(a => a.secondAttemptCorrect).length,
            missed: session.alphagrams.filter(a => a.missed).length,
            perfect: perfectGame,
            duration: gameTime,
            userId: session.userId
        };

        this.analyticsData.gameHistory.unshift(gameRecord);
        if (this.analyticsData.gameHistory.length > 100) {
            this.analyticsData.gameHistory = this.analyticsData.gameHistory.slice(0, 100);
        }

        // Save updated analytics
        this.saveAnalyticsData();

        console.log('Analytics: Game processed and saved', gameRecord);
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
        console.log('Analytics: All data cleared');
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