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

            console.log('Analytics session start - userId:', userId, 'wordLengths:', wordLengths);

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
            const { firebaseUid, nickname, country, privacyConsent, email, displayName } = req.body;
            
            const result = await this.db.createOrUpdateUser({
                firebaseUid,
                nickname,
                country,
                privacyConsent,
                email,
                displayName
            });

            res.json({
                success: true,
                userId: result.userId,
                sessionToken: result.sessionToken
            });
        } catch (error) {
            console.error('Error creating/updating user:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create/update user'
            });
        }
    }

    // Get user's complete analytics data
    async getUserStats(req, res) {
        try {
            const { firebaseUid } = req.params;
            
            if (!firebaseUid) {
                return res.status(400).json({
                    success: false,
                    error: 'Firebase UID is required'
                });
            }

            const userStats = await this.db.getUserStats(firebaseUid);
            
            if (!userStats) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }


            res.json({
                success: true,
                stats: userStats
            });
        } catch (error) {
            console.error('Error getting user stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get user statistics'
            });
        }
    }

    // Clear all user data from server
    async clearUserData(req, res) {
        try {
            const { firebaseUid } = req.body;
            
            if (!firebaseUid) {
                return res.status(400).json({
                    success: false,
                    error: 'Firebase UID is required'
                });
            }

            await this.db.clearUserData(firebaseUid);
            
            res.json({
                success: true,
                message: 'All user data cleared successfully'
            });
        } catch (error) {
            console.error('Error clearing user data:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to clear user data'
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
                firstAttemptScore, completed, gameDuration, alphagramResults } = req.body;

            console.log('Analytics session finish - sessionId:', sessionId, 'finalScore:', finalScore, 'firstAttemptScore:', firstAttemptScore);

            if (!sessionId) {
                return res.status(400).json({
                    success: false,
                    error: 'Session ID is required'
                });
            }

            const result = await this.db.finishGameSession(sessionId, {
                totalAlphagrams,
                alphagramsSolved,
                finalScore,
                firstAttemptScore,
                completed: completed ? 1 : 0,
                gameDuration,
                alphagramResults
            });

            res.json({
                success: true,
                changes: result.changes,
                membershipGranted: result.membershipGranted,
                totalGames: result.totalGames
            });
        } catch (error) {
            console.error('Error finishing analytics session:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to finish analytics session'
            });
        }
    }

    // Get membership status for a player
    async getMembershipStatus(req, res) {
        try {
            const { firebaseUid } = req.params;
            
            if (!firebaseUid) {
                return res.status(400).json({
                    success: false,
                    error: 'Firebase UID is required'
                });
            }

            const userId = this.db.hashData(firebaseUid);
            const result = await this.db.checkAndUpdateMembership(userId);
            
            const response = {
                success: true,
                isMember: result.membershipGranted || result.totalGames >= 25,
                totalGames: result.totalGames,
                membershipGranted: result.membershipGranted
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error getting membership status:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get membership status'
            });
        }
    }

    // Get advanced statistics for a member
    async getAdvancedStats(req, res) {
        try {
            const { firebaseUid } = req.params;
            const { wordLength, filter } = req.query;
            
            if (!firebaseUid) {
                return res.status(400).json({
                    success: false,
                    error: 'Firebase UID is required'
                });
            }

            const userId = this.db.hashData(firebaseUid);
            const result = await this.db.getPlayerAdvancedStats(userId);
            
            if (!result.isMember) {
                return res.status(403).json({
                    success: false,
                    error: 'Advanced statistics are only available to members'
                });
            }

            // Apply filters
            let filteredAlphagrams = result.alphagrams;
            
            // Filter by word length
            if (wordLength && wordLength !== 'all') {
                filteredAlphagrams = filteredAlphagrams.filter(a => a.word_length == wordLength);
            }
            
            // Filter by performance
            if (filter === 'mastered') {
                filteredAlphagrams = filteredAlphagrams.filter(a => a.success_rate >= 90);
            } else if (filter === 'struggling') {
                const strugglingThreshold = result.averageSuccessRate * 0.8;
                filteredAlphagrams = filteredAlphagrams.filter(a => a.success_rate < strugglingThreshold);
            }
            
            // Sort by success rate (lowest first) for word length view
            if (wordLength && wordLength !== 'all') {
                filteredAlphagrams.sort((a, b) => a.success_rate - b.success_rate);
            }

            res.json({
                success: true,
                isMember: true,
                averageSuccessRate: result.averageSuccessRate,
                alphagrams: filteredAlphagrams,
                summary: {
                    biggestChallenges: result.alphagrams.slice(0, 5), // Top 5 lowest success rates
                    strugglingThreshold: result.averageSuccessRate * 0.8
                }
            });
        } catch (error) {
            console.error('Error getting advanced statistics:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get advanced statistics'
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

    // Player-specific analytics endpoints
    async getPlayerList(req, res) {
        try {
            const players = await this.db.getPlayerList();
            
            res.json({
                success: true,
                players: players
            });
        } catch (error) {
            console.error('Error getting player list:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get player list'
            });
        }
    }

    async getPlayerStats(req, res) {
        try {
            const { playerId } = req.params;
            
            if (!playerId) {
                return res.status(400).json({
                    success: false,
                    error: 'Player ID is required'
                });
            }

            const [playerStats, wordLengthStats, alphagramStats, recentGames] = await Promise.all([
                this.db.getPlayerStats(playerId),
                this.db.getPlayerStatsByWordLength(playerId),
                this.db.getPlayerAlphagramStats(playerId),
                this.db.getPlayerRecentGames(playerId, 10)
            ]);

            if (!playerStats) {
                return res.status(404).json({
                    success: false,
                    error: 'Player not found'
                });
            }

            // Format the response
            const formattedStats = {
                player: {
                    id: playerStats.id,
                    nickname: playerStats.nickname,
                    country: playerStats.country,
                    memberSince: playerStats.created_at,
                    lastActive: playerStats.last_active
                },
                overview: {
                    totalGames: playerStats.total_games || 0,
                    averageScore: Math.round((playerStats.average_score || 0) * 100) / 100,
                    bestScore: playerStats.best_score || 0,
                    totalAlphagramsSeen: playerStats.total_alphagrams_seen || 0,
                    totalAlphagramsSolved: playerStats.total_alphagrams_solved || 0,
                    overallSuccessRate: playerStats.total_alphagrams_seen > 0 ? 
                        Math.round((playerStats.total_alphagrams_solved / playerStats.total_alphagrams_seen) * 100) : 0,
                    completionRate: Math.round((playerStats.completion_rate || 0) * 100),
                    averageGameDuration: Math.round((playerStats.average_game_duration || 0) / 60 * 100) / 100 // minutes
                },
                byWordLength: wordLengthStats.map(stat => ({
                    wordLength: stat.word_length,
                    gamesPlayed: stat.games_played,
                    averageScore: Math.round((stat.average_score || 0) * 100) / 100,
                    alphagramsSeen: stat.total_alphagrams_seen || 0,
                    alphagramsSolved: stat.total_alphagrams_solved || 0,
                    successRate: Math.round((stat.success_rate || 0) * 100),
                    completionRate: Math.round((stat.completion_rate || 0) * 100)
                })),
                alphagramPerformance: alphagramStats.slice(0, 20).map(stat => ({
                    alphagram: stat.alphagram,
                    wordLength: stat.word_length,
                    timesSeen: stat.times_seen,
                    timesSolved: stat.times_solved,
                    firstAttemptCorrect: stat.first_attempt_correct,
                    solveRate: Math.round((stat.solve_rate || 0) * 100)
                })),
                recentGames: recentGames.map(game => ({
                    sessionId: game.id,
                    date: game.session_start,
                    wordLengths: JSON.parse(game.word_lengths || '[]'),
                    alphagramsSeen: game.total_alphagrams,
                    alphagramsSolved: game.alphagrams_solved,
                    score: game.final_score,
                    firstAttemptScore: game.first_attempt_score || 0,
                    completed: game.completed === 1,
                    duration: Math.round((game.game_duration || 0) / 60 * 100) / 100 // minutes
                }))
            };

            res.json({
                success: true,
                stats: formattedStats
            });
        } catch (error) {
            console.error('Error getting player stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get player statistics'
            });
        }
    }

    async getPlayerAlphagramStats(req, res) {
        try {
            const { playerId } = req.params;
            const { wordLength } = req.query;
            
            if (!playerId) {
                return res.status(400).json({
                    success: false,
                    error: 'Player ID is required'
                });
            }

            const alphagramStats = await this.db.getPlayerAlphagramStats(playerId, wordLength);
            
            res.json({
                success: true,
                stats: alphagramStats.map(stat => ({
                    alphagram: stat.alphagram,
                    wordLength: stat.word_length,
                    timesSeen: stat.times_seen,
                    timesSolved: stat.times_solved,
                    firstAttemptCorrect: stat.first_attempt_correct,
                    solveRate: Math.round((stat.solve_rate || 0) * 100)
                }))
            });
        } catch (error) {
            console.error('Error getting player alphagram stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get player alphagram statistics'
            });
        }
    }
}

module.exports = AnalyticsController;
