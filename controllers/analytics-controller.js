/**
 * Analytics Controller
 * Handles server-side analytics endpoints and data processing
 */

const AnalyticsDB = require('../data/analytics-db');

class AnalyticsController {
    constructor() {
        this.db = new AnalyticsDB();
    }

    // Start a new game session
    async startSession(req, res) {
        try {
            const { userId, wordLengths } = req.body;
            const ipAddress = req.ip || req.connection.remoteAddress;
            const userAgent = req.get('User-Agent');

            const result = await this.db.startGameSession({
                userId,
                wordLengths,
                ipAddress,
                userAgent
            });

            res.json({
                success: true,
                sessionId: result.sessionId
            });
        } catch (error) {
            console.error('Error starting analytics session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to start analytics session'
            });
        }
    }

    // Record user registration/profile update
    async recordUser(req, res) {
        try {
            const { firebaseUid, nickname, country, privacyConsent } = req.body;

            if (!firebaseUid) {
                return res.status(400).json({
                    success: false,
                    error: 'Firebase UID is required'
                });
            }

            const result = await this.db.createOrUpdateUser({
                firebaseUid,
                nickname,
                country,
                privacyConsent: privacyConsent !== false // Default to true
            });

            res.json({
                success: true,
                userId: result.userId
            });
        } catch (error) {
            console.error('Error recording user:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to record user data'
            });
        }
    }

    // Record alphagram attempt
    async recordAttempt(req, res) {
        try {
            const { sessionId, alphagram, wordLength, solved, firstAttemptCorrect, 
                    secondAttemptCorrect, userAnswers, correctAnswers } = req.body;

            if (!sessionId || !alphagram) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID and alphagram are required'
                });
            }

            await this.db.recordAlphagramAttempt({
                sessionId,
                alphagram,
                wordLength,
                solved,
                firstAttemptCorrect,
                secondAttemptCorrect,
                userAnswers,
                correctAnswers
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Error recording attempt:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to record attempt'
            });
        }
    }

    // Finish game session
    async finishSession(req, res) {
        try {
            const { sessionId, totalAlphagrams, alphagramsSolved, finalScore, 
                    completed, gameDuration } = req.body;

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID is required'
                });
            }

            await this.db.finishGameSession(sessionId, {
                totalAlphagrams,
                alphagramsSolved,
                finalScore,
                completed,
                gameDuration
            });

            res.json({ success: true });
        } catch (error) {
            console.error('Error finishing session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to finish session'
            });
        }
    }

    // Get global statistics
    async getGlobalStats(req, res) {
        try {
            const days = parseInt(req.query.days) || 7;
            const stats = await this.db.getGlobalStats(days);
            
            // Format the response
            const formattedStats = {
                period: `${days} days`,
                totalGames: stats.total_games || 0,
                uniquePlayers: stats.unique_players || 0,
                totalAlphagramsPresented: stats.total_alphagrams_presented || 0,
                totalAlphagramsSolved: stats.total_alphagrams_solved || 0,
                averageScore: Math.round((stats.average_score || 0) * 100) / 100,
                completionRate: Math.round((stats.completion_rate || 0) * 100),
                averageGameDuration: Math.round((stats.average_game_duration || 0) / 60 * 100) / 100, // minutes
                solveRate: stats.total_alphagrams_presented > 0 ? 
                    Math.round((stats.total_alphagrams_solved / stats.total_alphagrams_presented) * 100) : 0
            };

            res.json({
                success: true,
                stats: formattedStats
            });
        } catch (error) {
            console.error('Error getting global stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get global statistics'
            });
        }
    }

    // Get daily statistics
    async getDailyStats(req, res) {
        try {
            const days = parseInt(req.query.days) || 30;
            const dailyStats = await this.db.getDailyStats(days);
            
            res.json({
                success: true,
                stats: dailyStats
            });
        } catch (error) {
            console.error('Error getting daily stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get daily statistics'
            });
        }
    }

    // Get word performance statistics
    async getWordStats(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const wordStats = await this.db.getWordStats(limit);
            
            res.json({
                success: true,
                stats: wordStats
            });
        } catch (error) {
            console.error('Error getting word stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get word statistics'
            });
        }
    }

    // Get recent activity
    async getRecentActivity(req, res) {
        try {
            const hours = parseInt(req.query.hours) || 24;
            const activity = await this.db.getRecentActivity(hours);
            
            res.json({
                success: true,
                activity: {
                    period: `${hours} hours`,
                    gamesPlayed: activity.games_in_period || 0,
                    activePlayers: activity.active_players || 0
                }
            });
        } catch (error) {
            console.error('Error getting recent activity:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get recent activity'
            });
        }
    }

    // Analytics dashboard data (combined stats)
    async getDashboardData(req, res) {
        try {
            const [globalStats, recentActivity, dailyStats] = await Promise.all([
                this.db.getGlobalStats(7),
                this.db.getRecentActivity(24),
                this.db.getDailyStats(7)
            ]);

            res.json({
                success: true,
                dashboard: {
                    overview: {
                        totalGames: globalStats.total_games || 0,
                        uniquePlayers: globalStats.unique_players || 0,
                        averageScore: Math.round((globalStats.average_score || 0) * 100) / 100,
                        completionRate: Math.round((globalStats.completion_rate || 0) * 100)
                    },
                    recentActivity: {
                        gamesLast24h: recentActivity.games_in_period || 0,
                        playersLast24h: recentActivity.active_players || 0
                    },
                    dailyTrend: dailyStats
                }
            });
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get dashboard data'
            });
        }
    }
}

module.exports = AnalyticsController;
