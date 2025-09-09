/**
 * Analytics Routes
 * API endpoints for server-side analytics tracking
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics-controller');

const analyticsController = new AnalyticsController();

// User tracking
router.post('/user', (req, res) => analyticsController.recordUser(req, res));

// Game session tracking
router.post('/session/start', (req, res) => analyticsController.startSession(req, res));
router.post('/session/finish', (req, res) => analyticsController.finishSession(req, res));

// Alphagram attempt tracking
router.post('/attempt', (req, res) => analyticsController.recordAttempt(req, res));

// Statistics endpoints
router.get('/stats/global', (req, res) => analyticsController.getGlobalStats(req, res));
router.get('/stats/daily', (req, res) => analyticsController.getDailyStats(req, res));
router.get('/stats/words', (req, res) => analyticsController.getWordStats(req, res));
router.get('/stats/activity', (req, res) => analyticsController.getRecentActivity(req, res));

// Dashboard endpoint
router.get('/dashboard', (req, res) => analyticsController.getDashboardData(req, res));

module.exports = router;
