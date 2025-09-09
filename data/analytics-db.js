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
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        const schemaPath = path.join(__dirname, 'analytics-schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        return new Promise((resolve, reject) => {
            this.db.exec(schema, (err) => {
                if (err) {
                    console.error('Error creating tables:', err);
                    reject(err);
                } else {
                    console.log('Analytics tables created successfully');
                    resolve();
                }
            });
        });
    }

    // Hash sensitive data for privacy
    hashData(data) {
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }

    // User management
    async createOrUpdateUser(userData) {
        const { firebaseUid, nickname, country, privacyConsent } = userData;
        
        return new Promise((resolve, reject) => {
            const userId = this.hashData(firebaseUid);
            
            this.db.run(`
                INSERT OR REPLACE INTO users 
                (id, firebase_uid, nickname, country, privacy_consent, last_active)
                VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [userId, firebaseUid, nickname, country, privacyConsent], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ userId, rowId: this.lastID });
                }
            });
        });
    }

    // Game session tracking
    async startGameSession(sessionData) {
        const { userId, wordLengths, ipAddress, userAgent } = sessionData;
        
        return new Promise((resolve, reject) => {
            const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const ipHash = ipAddress ? this.hashData(ipAddress) : null;
            const userAgentHash = userAgent ? this.hashData(userAgent) : null;
            
            this.db.run(`
                INSERT INTO game_sessions 
                (id, user_id, word_lengths, ip_hash, user_agent_hash)
                VALUES (?, ?, ?, ?, ?)
            `, [sessionId, userId, JSON.stringify(wordLengths), ipHash, userAgentHash], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ sessionId });
                }
            });
        });
    }

    async finishGameSession(sessionId, sessionResults) {
        const { totalAlphagrams, alphagramsSolved, finalScore, completed, gameDuration } = sessionResults;
        
        return new Promise((resolve, reject) => {
            this.db.run(`
                UPDATE game_sessions 
                SET session_end = CURRENT_TIMESTAMP,
                    total_alphagrams = ?,
                    alphagrams_solved = ?,
                    final_score = ?,
                    completed = ?,
                    game_duration = ?
                WHERE id = ?
            `, [totalAlphagrams, alphagramsSolved, finalScore, completed, gameDuration, sessionId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
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
                    u.nickname,
                    u.firebase_uid,
                    u.country,
                    u.created_at,
                    u.last_active,
                    COUNT(gs.id) as total_games
                FROM users u
                LEFT JOIN game_sessions gs ON u.id = gs.user_id
                GROUP BY u.id, u.nickname, u.firebase_uid, u.country, u.created_at, u.last_active
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
}

module.exports = AnalyticsDB;
