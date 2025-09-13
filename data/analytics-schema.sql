-- Shabble Game Analytics Database Schema
-- SQLite schema for tracking global game statistics

-- Users table for basic user info
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    firebase_uid TEXT UNIQUE,
    nickname TEXT,
    country TEXT,
    email TEXT,
    display_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_games INTEGER DEFAULT 0,
    privacy_consent BOOLEAN DEFAULT FALSE,
    active_session_token TEXT,
    session_created_at DATETIME,
    is_member BOOLEAN DEFAULT FALSE,
    member_since DATETIME
);

-- Game sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    session_start DATETIME DEFAULT CURRENT_TIMESTAMP,
    session_end DATETIME,
    word_lengths TEXT, -- JSON array of selected word lengths
    total_alphagrams INTEGER DEFAULT 0,
    alphagrams_solved INTEGER DEFAULT 0,
    final_score INTEGER DEFAULT 0,
    first_attempt_score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    game_duration INTEGER, -- seconds
    ip_hash TEXT, -- hashed IP for anonymous tracking
    user_agent_hash TEXT, -- hashed user agent
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Individual alphagram performance
CREATE TABLE IF NOT EXISTS alphagram_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    alphagram TEXT,
    word_length INTEGER,
    solved BOOLEAN DEFAULT FALSE,
    first_attempt_correct BOOLEAN DEFAULT FALSE,
    second_attempt_correct BOOLEAN DEFAULT FALSE,
    user_answers TEXT, -- JSON array of user's answers
    correct_answers TEXT, -- JSON array of correct answers
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES game_sessions(id)
);

-- Daily aggregated statistics
CREATE TABLE IF NOT EXISTS daily_stats (
    date DATE PRIMARY KEY,
    total_games INTEGER DEFAULT 0,
    total_players INTEGER DEFAULT 0,
    unique_players INTEGER DEFAULT 0,
    total_alphagrams_presented INTEGER DEFAULT 0,
    total_alphagrams_solved INTEGER DEFAULT 0,
    average_score REAL DEFAULT 0,
    completion_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Word performance statistics
CREATE TABLE IF NOT EXISTS word_stats (
    alphagram TEXT PRIMARY KEY,
    word_length INTEGER,
    times_presented INTEGER DEFAULT 0,
    times_solved INTEGER DEFAULT 0,
    solve_rate REAL DEFAULT 0,
    average_attempts REAL DEFAULT 0,
    first_attempt_rate REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player alphagram performance tracking (for advanced statistics)
CREATE TABLE IF NOT EXISTS player_alphagram_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    alphagram TEXT,
    word_length INTEGER,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    last_attempt_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, alphagram)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON game_sessions(session_start);
CREATE INDEX IF NOT EXISTS idx_attempts_session ON alphagram_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_attempts_alphagram ON alphagram_attempts(alphagram);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
CREATE INDEX IF NOT EXISTS idx_player_alphagram_user ON player_alphagram_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_player_alphagram_word_length ON player_alphagram_stats(word_length);
CREATE INDEX IF NOT EXISTS idx_player_alphagram_success_rate ON player_alphagram_stats(user_id, correct_attempts, total_attempts);
