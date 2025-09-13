/**
 * Analytics Database Manager
 * Handles SQLite database operations for game analytics
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class AnalyticsDB {
    constructor() {
        this.dbPath = path.join(__dirname, 'analytics.db');
        this.db = null;
        this.init();
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening analytics database:', err);
                    reject(err);
                } else {
                    console.log('Connected to analytics database');
                    this.initDatabase().then(resolve).catch(reject);
                }
            });
        });
    }

    async initDatabase() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                // Read and execute schema
                const schemaPath = path.join(__dirname, 'analytics-schema.sql');
                const schema = fs.readFileSync(schemaPath, 'utf8');
                
                // Split by semicolon and execute each statement
                const statements = schema.split(';').filter(stmt => stmt.trim());
                
                statements.forEach(statement => {
                    this.db.run(statement.trim(), (err) => {
                        if (err && !err.message.includes('already exists')) {
                            console.error('Database schema error:', err);
                        }
                    });
                });
                
                // Add new columns if they don't exist (for existing databases)
                this.db.run(`ALTER TABLE users ADD COLUMN email TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding email column:', err);
                    }
                });
                
                this.db.run(`ALTER TABLE users ADD COLUMN display_name TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding display_name column:', err);
                    }
                });
                
                this.db.run(`ALTER TABLE users ADD COLUMN active_session_token TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding active_session_token column:', err);
                    }
                });
                
                this.db.run(`ALTER TABLE users ADD COLUMN session_created_at DATETIME`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding session_created_at column:', err);
                    }
                });
                
                // Add membership columns
                this.db.run(`ALTER TABLE users ADD COLUMN is_member BOOLEAN DEFAULT FALSE`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding is_member column:', err);
                    }
                });
                
                this.db.run(`ALTER TABLE users ADD COLUMN member_since DATETIME`, (err) => {
                    if (err && !err.message.includes('duplicate column')) {
                        console.error('Error adding member_since column:', err);
                    }
                });
                
                console.log('Analytics tables created successfully');
                resolve();
            });
        });
    }

    // Hash sensitive data for privacy
    hashData(data) {
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    // User management
    async createOrUpdateUser(userData) {
        const { firebaseUid, nickname, country, privacyConsent, email, displayName } = userData;
        
        return new Promise((resolve, reject) => {
            const userId = this.hashData(firebaseUid);
            const sessionToken = this.generateSessionToken();
            
            // First, invalidate any existing sessions for this user
            this.db.run(`
                UPDATE users 
                SET active_session_token = NULL, session_created_at = NULL
                WHERE firebase_uid = ?
            `, [firebaseUid], (err) => {
                if (err) {
                    console.error('Error invalidating existing sessions:', err);
                    reject(err);
                    return;
                }
                
                console.log(`Invalidated existing sessions for user ${firebaseUid}`);
                
                // Now create/update the user with new session token
                this.db.run(`
                    INSERT OR REPLACE INTO users 
                    (id, firebase_uid, nickname, country, privacy_consent, email, display_name, last_active, active_session_token, session_created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP)
                `, [userId, firebaseUid, nickname, country, privacyConsent, email, displayName, sessionToken], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(`Session invalidated and new session created for user ${firebaseUid}`);
                        resolve({ userId, sessionToken });
                    }
                });
            });
        });
    }

    // Generate unique session token
    generateSessionToken() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Validate session token
    async validateSession(firebaseUid, sessionToken) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT active_session_token, session_created_at 
                FROM users 
                WHERE firebase_uid = ?
            `, [firebaseUid], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve({ valid: false, reason: 'User not found' });
                } else if (row.active_session_token !== sessionToken) {
                    resolve({ valid: false, reason: 'Invalid session token' });
                } else {
                    // Check if session is expired (24 hours)
                    const sessionAge = Date.now() - new Date(row.session_created_at).getTime();
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    
                    if (sessionAge > maxAge) {
                        resolve({ valid: false, reason: 'Session expired' });
                    } else {
                        resolve({ valid: true });
                    }
                }
            });
        });
    }

    // Get user's complete analytics data
    async getUserStats(firebaseUid) {
        return new Promise((resolve, reject) => {
            const userId = this.hashData(firebaseUid);
            
            this.db.get(`
                SELECT 
                    u.nickname,
                    u.country,
                    COUNT(DISTINCT gs.id) as total_games,
                    COALESCE(SUM(gs.total_alphagrams), 0) as total_alphagrams,
                    COALESCE(SUM(gs.alphagrams_solved), 0) as alphagrams_solved,
                    COALESCE(MAX(gs.final_score), 0) as best_score,
                    COALESCE(AVG(gs.final_score), 0) as average_score
                FROM users u
                LEFT JOIN game_sessions gs ON u.id = gs.user_id
                WHERE u.firebase_uid = ?
                GROUP BY u.id
            `, [firebaseUid], (err, row) => {
                if (err) {
                    reject(err);
                } else if (!row) {
                    resolve(null);
                } else {
                    // Get recent games
                    this.db.all(`
                        SELECT 
                            gs.id,
                            gs.final_score,
                            gs.first_attempt_score,
                            gs.total_alphagrams,
                            gs.alphagrams_solved,
                            gs.completed,
                            gs.session_start as date,
                            gs.word_lengths,
                            gs.game_duration
                        FROM game_sessions gs
                        JOIN users u ON gs.user_id = u.id
                        WHERE u.firebase_uid = ?
                        ORDER BY gs.session_start DESC
                        LIMIT 50
                    `, [firebaseUid], (err, games) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Get word length accuracy breakdown
                            this.db.all(`
                                SELECT 
                                    aa.word_length,
                                    COUNT(*) as total_attempts,
                                    SUM(CASE WHEN aa.first_attempt_correct = 1 THEN 1 ELSE 0 END) as first_attempt_correct,
                                    SUM(CASE WHEN aa.solved = 1 THEN 1 ELSE 0 END) as total_solved
                                FROM alphagram_attempts aa
                                JOIN game_sessions gs ON aa.session_id = gs.id
                                JOIN users u ON gs.user_id = u.id
                                WHERE u.firebase_uid = ?
                                GROUP BY aa.word_length
                                ORDER BY aa.word_length
                            `, [firebaseUid], (err, wordLengthStats) => {
                                if (err) {
                                    console.error('Error fetching word length stats:', err);
                                    reject(err);
                                } else {
                                    
                                    resolve({
                                        ...row,
                                        recentGames: games || [],
                                        wordLengthAccuracy: wordLengthStats || []
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    // Clear all user data from server
    async clearUserData(firebaseUid) {
        return new Promise((resolve, reject) => {
            const userId = this.hashData(firebaseUid);
            
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');
                
                // Delete alphagram attempts
                this.db.run(`
                    DELETE FROM alphagram_attempts 
                    WHERE session_id IN (
                        SELECT gs.id FROM game_sessions gs 
                        JOIN users u ON gs.user_id = u.id 
                        WHERE u.firebase_uid = ?
                    )
                `, [firebaseUid]);
                
                // Delete game sessions
                this.db.run(`
                    DELETE FROM game_sessions 
                    WHERE user_id IN (
                        SELECT id FROM users WHERE firebase_uid = ?
                    )
                `, [firebaseUid]);
                
                // Reset user stats but keep the user record
                this.db.run(`
                    UPDATE users 
                    SET active_session_token = NULL, 
                        session_created_at = NULL,
                        last_active = CURRENT_TIMESTAMP
                    WHERE firebase_uid = ?
                `, [firebaseUid], function(err) {
                    if (err) {
                        reject(err);
                    } else {
                        this.db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                reject(commitErr);
                            } else {
                                console.log(`Cleared all data for user ${firebaseUid}`);
                                resolve();
                            }
                        });
                    }
                }.bind(this));
            });
        });
    }

    // Game session tracking
    async startGameSession({ userId, wordLengths, ipAddress, userAgent }) {
        return new Promise((resolve, reject) => {
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const ipHash = ipAddress ? this.hashData(ipAddress) : null;
            const userAgentHash = userAgent ? this.hashData(userAgent) : null;
            
            // If userId is provided, convert Firebase UID to internal user ID
            if (userId) {
                this.db.get(`SELECT id FROM users WHERE firebase_uid = ?`, [userId], (err, user) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    const internalUserId = user ? user.id : null;
                    console.log(`Converting Firebase UID ${userId} to internal ID ${internalUserId}`);
                    if (!user) {
                        console.log(`No user found for Firebase UID: ${userId}`);
                        this.db.all('SELECT firebase_uid, id, nickname FROM users', (err, rows) => {
                            console.log('Available users:', rows);
                        });
                    }
                    
                    this.db.run(`
                        INSERT INTO game_sessions 
                        (id, user_id, word_lengths, ip_hash, user_agent_hash)
                        VALUES (?, ?, ?, ?, ?)
                    `, [sessionId, internalUserId, JSON.stringify(wordLengths), ipHash, userAgentHash], function(err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve({ sessionId });
                        }
                    });
                });
            } else {
                // No user ID provided - reject anonymous sessions
                console.log('Rejecting anonymous session - authentication required');
                reject(new Error('Authentication required: Cannot create anonymous sessions'));
            }
        });
    }

    async finishGameSession(sessionId, sessionResults) {
        const { totalAlphagrams, alphagramsSolved, finalScore, firstAttemptScore, completed, gameDuration, alphagramResults } = sessionResults;
        
        console.log('DEBUG: finishGameSession received firstAttemptScore:', typeof firstAttemptScore, firstAttemptScore);
        
        return new Promise((resolve, reject) => {
            // First update the game session
            this.db.run(`
                UPDATE game_sessions 
                SET session_end = CURRENT_TIMESTAMP,
                    total_alphagrams = ?,
                    alphagrams_solved = ?,
                    final_score = ?,
                    first_attempt_score = ?,
                    completed = ?,
                    game_duration = ?
                WHERE id = ?
            `, [totalAlphagrams, alphagramsSolved, finalScore, firstAttemptScore, completed, gameDuration, sessionId], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Get user ID for this session
                this.db.get(`SELECT user_id FROM game_sessions WHERE id = ?`, [sessionId], async (err, sessionRow) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    
                    const userId = sessionRow.user_id;
                    
                    try {
                        // Update player alphagram performance if alphagram results provided
                        if (alphagramResults && alphagramResults.length > 0) {
                            await this.updatePlayerAlphagramStats(userId, alphagramResults);
                        }
                        
                        // Update user's last_active and total_games, then check membership
                        this.db.run(`
                            UPDATE users 
                            SET last_active = CURRENT_TIMESTAMP,
                                total_games = total_games + 1
                            WHERE id = ?
                        `, [userId], async (updateErr) => {
                            if (updateErr) {
                                reject(updateErr);
                            } else {
                                try {
                                    // Check and update membership status
                                    const membershipResult = await this.checkAndUpdateMembership(userId);
                                    resolve({ 
                                        changes: this.changes,
                                        membershipGranted: membershipResult.membershipGranted,
                                        totalGames: membershipResult.totalGames
                                    });
                                } catch (membershipErr) {
                                    console.error('Error checking membership:', membershipErr);
                                    resolve({ changes: this.changes }); // Don't fail the whole operation
                                }
                            }
                        });
                    } catch (statsErr) {
                        console.error('Error updating alphagram stats:', statsErr);
                        // Continue with user update even if stats fail
                        this.db.run(`
                            UPDATE users 
                            SET last_active = CURRENT_TIMESTAMP,
                                total_games = total_games + 1
                            WHERE id = ?
                        `, [userId], (updateErr) => {
                            if (updateErr) {
                                reject(updateErr);
                            } else {
                                resolve({ changes: this.changes });
                            }
                        });
                    }
                });
            });
        });
    }

    // Alphagram attempt tracking
    async recordAlphagramAttempt(attemptData) {
        const { sessionId, alphagram, wordLength, solved, firstAttemptCorrect, 
                secondAttemptCorrect, userAnswers, correctAnswers } = attemptData;
        
        return new Promise((resolve, reject) => {
            this.db.run(`
                INSERT INTO alphagram_attempts 
                (session_id, alphagram, word_length, solved, first_attempt_correct, 
                 second_attempt_correct, user_answers, correct_answers)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [sessionId, alphagram, wordLength, solved, firstAttemptCorrect, 
                secondAttemptCorrect, JSON.stringify(userAnswers), JSON.stringify(correctAnswers)], 
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ attemptId: this.lastID });
                }
            });
        });
    }

    // Analytics queries
    async getGlobalStats(days = 7) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    COUNT(DISTINCT id) as total_games,
                    COUNT(DISTINCT user_id) as unique_players,
                    SUM(total_alphagrams) as total_alphagrams_presented,
                    SUM(alphagrams_solved) as total_alphagrams_solved,
                    AVG(final_score) as average_score,
                    AVG(CASE WHEN completed = 1 THEN 1.0 ELSE 0.0 END) as completion_rate,
                    AVG(game_duration) as average_game_duration
                FROM game_sessions 
                WHERE session_start >= datetime('now', '-${days} days')
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    async getDailyStats(days = 30) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    DATE(session_start) as date,
                    COUNT(*) as games_played,
                    COUNT(DISTINCT user_id) as unique_players,
                    AVG(final_score) as avg_score,
                    SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_games
                FROM game_sessions 
                WHERE session_start >= datetime('now', '-${days} days')
                GROUP BY DATE(session_start)
                ORDER BY date DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getWordStats(limit = 50) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    alphagram,
                    word_length,
                    COUNT(*) as times_presented,
                    SUM(CASE WHEN solved = 1 THEN 1 ELSE 0 END) as times_solved,
                    AVG(CASE WHEN solved = 1 THEN 1.0 ELSE 0.0 END) as solve_rate,
                    AVG(CASE WHEN first_attempt_correct = 1 THEN 1.0 ELSE 0.0 END) as first_attempt_rate
                FROM alphagram_attempts 
                GROUP BY alphagram, word_length
                HAVING times_presented >= 5
                ORDER BY times_presented DESC
                LIMIT ?
            `, [limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getRecentActivity(hours = 24) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    COUNT(*) as games_in_period,
                    COUNT(DISTINCT user_id) as active_players
                FROM game_sessions 
                WHERE session_start >= datetime('now', '-${hours} hours')
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows[0]);
                }
            });
        });
    }

    // Player-specific analytics
    async getPlayerList() {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    u.id,
                    COALESCE(u.display_name, u.nickname, 'Player ' || SUBSTR(u.id, 1, 8)) as display_name,
                    u.nickname,
                    u.firebase_uid,
                    u.country,
                    u.email,
                    u.created_at,
                    u.last_active,
                    COUNT(gs.id) as total_games
                FROM users u
                LEFT JOIN game_sessions gs ON u.id = gs.user_id
                GROUP BY u.id, u.display_name, u.nickname, u.firebase_uid, u.country, u.email, u.created_at, u.last_active
                ORDER BY u.last_active DESC
            `, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getPlayerStats(playerId) {
        return new Promise((resolve, reject) => {
            this.db.get(`
                SELECT 
                    u.id,
                    u.nickname,
                    u.firebase_uid,
                    u.country,
                    u.created_at,
                    u.last_active,
                    COUNT(gs.id) as total_games,
                    AVG(gs.final_score) as average_score,
                    MAX(gs.final_score) as best_score,
                    SUM(gs.total_alphagrams) as total_alphagrams_seen,
                    SUM(gs.alphagrams_solved) as total_alphagrams_solved,
                    AVG(CASE WHEN gs.completed = 1 THEN 1.0 ELSE 0.0 END) as completion_rate,
                    AVG(gs.game_duration) as average_game_duration
                FROM users u
                LEFT JOIN game_sessions gs ON u.id = gs.user_id
                WHERE u.id = ? OR u.nickname = ? OR u.firebase_uid = ?
                GROUP BY u.id, u.nickname, u.firebase_uid, u.country, u.created_at, u.last_active
            `, [playerId, playerId, playerId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getPlayerStatsByWordLength(playerId) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    JSON_EXTRACT(gs.word_lengths, '$[0]') as word_length,
                    COUNT(gs.id) as games_played,
                    AVG(gs.final_score) as average_score,
                    SUM(gs.total_alphagrams) as total_alphagrams_seen,
                    SUM(gs.alphagrams_solved) as total_alphagrams_solved,
                    AVG(CASE WHEN gs.alphagrams_solved > 0 THEN 
                        CAST(gs.alphagrams_solved AS FLOAT) / gs.total_alphagrams 
                        ELSE 0 END) as success_rate,
                    AVG(CASE WHEN gs.completed = 1 THEN 1.0 ELSE 0.0 END) as completion_rate
                FROM users u
                JOIN game_sessions gs ON u.id = gs.user_id
                WHERE u.id = ? OR u.nickname = ? OR u.firebase_uid = ?
                GROUP BY JSON_EXTRACT(gs.word_lengths, '$[0]')
                ORDER BY word_length
            `, [playerId, playerId, playerId], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getPlayerAlphagramStats(playerId, wordLength = null) {
        return new Promise((resolve, reject) => {
            let query = `
                SELECT 
                    aa.alphagram,
                    aa.word_length,
                    COUNT(aa.id) as times_seen,
                    SUM(CASE WHEN aa.solved = 1 THEN 1 ELSE 0 END) as times_solved,
                    SUM(CASE WHEN aa.first_attempt_correct = 1 THEN 1 ELSE 0 END) as first_attempt_correct,
                    AVG(CASE WHEN aa.solved = 1 THEN 1.0 ELSE 0.0 END) as solve_rate
                FROM users u
                JOIN game_sessions gs ON u.id = gs.user_id
                JOIN alphagram_attempts aa ON gs.id = aa.session_id
                WHERE (u.id = ? OR u.nickname = ? OR u.firebase_uid = ?)
            `;
            
            let params = [playerId, playerId, playerId];
            
            if (wordLength) {
                query += ` AND aa.word_length = ?`;
                params.push(wordLength);
            }
            
            query += `
                GROUP BY aa.alphagram, aa.word_length
                ORDER BY times_seen DESC, aa.word_length, aa.alphagram
            `;
            
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getPlayerRecentGames(playerId, limit = 10) {
        return new Promise((resolve, reject) => {
            this.db.all(`
                SELECT 
                    gs.id,
                    gs.session_start,
                    gs.session_end,
                    gs.word_lengths,
                    gs.total_alphagrams,
                    gs.alphagrams_solved,
                    gs.final_score,
                    gs.first_attempt_score,
                    gs.completed,
                    gs.game_duration
                FROM users u
                JOIN game_sessions gs ON u.id = gs.user_id
                WHERE u.id = ? OR u.nickname = ? OR u.firebase_uid = ?
                ORDER BY gs.session_start DESC
                LIMIT ?
            `, [playerId, playerId, playerId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Analytics database connection closed');
                }
            });
        }
    }

    // Check and update membership status based on game count
    async checkAndUpdateMembership(userId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT total_games, is_member FROM users WHERE id = ?', [userId], (err, user) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (user && user.total_games >= 25 && !user.is_member) {
                    this.db.run(`
                        UPDATE users 
                        SET is_member = 1, member_since = CURRENT_TIMESTAMP 
                        WHERE id = ?
                    `, [userId], (updateErr) => {
                        if (updateErr) {
                            reject(updateErr);
                        } else {
                            resolve({ membershipGranted: true, totalGames: user.total_games });
                        }
                    });
                } else {
                    resolve({ membershipGranted: false, totalGames: user?.total_games || 0 });
                }
            });
        });
    }

    // Update player alphagram performance (called after each game)
    async updatePlayerAlphagramStats(userId, alphagramResults) {
        return new Promise((resolve, reject) => {
            const promises = alphagramResults.map(result => {
                return new Promise((resolveInner, rejectInner) => {
                    this.db.run(`
                        INSERT OR REPLACE INTO player_alphagram_stats 
                        (user_id, alphagram, word_length, total_attempts, correct_attempts, last_attempt_date, updated_at)
                        VALUES (
                            ?, ?, ?, 
                            COALESCE((SELECT total_attempts FROM player_alphagram_stats WHERE user_id = ? AND alphagram = ?), 0) + 1,
                            COALESCE((SELECT correct_attempts FROM player_alphagram_stats WHERE user_id = ? AND alphagram = ?), 0) + ?,
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP
                        )
                    `, [
                        userId, result.alphagram, result.wordLength,
                        userId, result.alphagram,
                        userId, result.alphagram, result.isCorrect ? 1 : 0
                    ], function(err) {
                        if (err) {
                            rejectInner(err);
                        } else {
                            resolveInner();
                        }
                    });
                });
            });

            Promise.all(promises).then(() => resolve()).catch(reject);
        });
    }

    // Get player's advanced statistics
    async getPlayerAdvancedStats(userId) {
        return new Promise((resolve, reject) => {
            // First check if user is a member
            this.db.get(`SELECT is_member FROM users WHERE id = ?`, [userId], (err, userRow) => {
                if (err) {
                    reject(err);
                } else if (!userRow || !userRow.is_member) {
                    resolve({ isMember: false });
                } else {
                    // Get alphagram performance data
                    this.db.all(`
                        SELECT 
                            alphagram,
                            word_length,
                            total_attempts,
                            correct_attempts,
                            ROUND((correct_attempts * 100.0 / total_attempts), 1) as success_rate,
                            last_attempt_date
                        FROM player_alphagram_stats 
                        WHERE user_id = ?
                        ORDER BY success_rate ASC, total_attempts DESC
                    `, [userId], (err, rows) => {
                        if (err) {
                            reject(err);
                        } else {
                            // Calculate player's average success rate
                            const totalAttempts = rows.reduce((sum, row) => sum + row.total_attempts, 0);
                            const totalCorrect = rows.reduce((sum, row) => sum + row.correct_attempts, 0);
                            const averageSuccessRate = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;
                            
                            resolve({
                                isMember: true,
                                averageSuccessRate,
                                alphagrams: rows
                            });
                        }
                    });
                }
            });
        });
    }
}

module.exports = AnalyticsDB;
