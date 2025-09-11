/**
 * Analytics Routes
 * API endpoints for server-side analytics tracking
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics-controller');
const SessionMiddleware = require('../middleware/session-middleware');

const analyticsController = new AnalyticsController();
const sessionMiddleware = new SessionMiddleware();

// User tracking
router.post('/user', (req, res) => analyticsController.recordUser(req, res));

// Clear user data endpoint (requires session validation)
router.delete('/user/clear', sessionMiddleware.validateSession, (req, res) => analyticsController.clearUserData(req, res));

// User stats endpoint (requires session validation)
router.get('/user/:firebaseUid/stats', (req, res) => {
    // Extract session info from query params for GET requests
    const { sessionToken } = req.query;
    req.body = { firebaseUid: req.params.firebaseUid, sessionToken };
    sessionMiddleware.validateSession(req, res, () => analyticsController.getUserStats(req, res));
});

// Game session tracking (requires session validation)
router.post('/session/start', sessionMiddleware.optionalValidateSession, (req, res) => analyticsController.startSession(req, res));
router.post('/session/finish', sessionMiddleware.optionalValidateSession, (req, res) => analyticsController.finishSession(req, res));

// Alphagram attempt tracking
router.post('/attempt', (req, res) => analyticsController.recordAttempt(req, res));

// Statistics endpoints
router.get('/stats/global', (req, res) => analyticsController.getGlobalStats(req, res));
router.get('/stats/daily', (req, res) => analyticsController.getDailyStats(req, res));
router.get('/stats/words', (req, res) => analyticsController.getWordStats(req, res));
router.get('/stats/activity', (req, res) => analyticsController.getRecentActivity(req, res));

// Dashboard data endpoint
router.get('/dashboard', (req, res) => analyticsController.getDashboardData(req, res));

// Player-specific analytics endpoints
router.get('/players', (req, res) => analyticsController.getPlayerList(req, res));
router.get('/players/:playerId', (req, res) => analyticsController.getPlayerStats(req, res));
router.get('/players/:playerId/alphagrams', (req, res) => analyticsController.getPlayerAlphagramStats(req, res));

module.exports = router;
