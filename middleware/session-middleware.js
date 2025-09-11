/**
 * Session Validation Middleware
 * Validates user session tokens for protected analytics endpoints
 */

const AnalyticsDB = require('../data/analytics-db');

class SessionMiddleware {
    constructor() {
        this.db = new AnalyticsDB();
    }

    // Optional session validation - doesn't fail if no session provided
    optionalValidateSession = async (req, res, next) => {
        try {
            const { firebaseUid, sessionToken } = req.body;
            
            // If no session info provided, just continue
            if (!firebaseUid || !sessionToken) {
                return next();
            }

            const validation = await this.db.validateSession(firebaseUid, sessionToken);
            
            if (validation.valid) {
                req.validatedUser = { firebaseUid, sessionToken };
            }
            // Don't fail if session is invalid, just continue without validated user
            next();
        } catch (error) {
            console.error('Optional session validation error:', error);
            next(); // Continue even if validation fails
        }
    };

    // Middleware to validate session token
    validateSession = async (req, res, next) => {
        try {
            const { firebaseUid, sessionToken } = req.body;
            
            if (!firebaseUid || !sessionToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Firebase UID and session token required'
                });
            }

            const validation = await this.db.validateSession(firebaseUid, sessionToken);
            
            if (!validation.valid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired session',
                    reason: validation.reason
                });
            }

            // Add user info to request for downstream handlers
            req.validatedUser = { firebaseUid, sessionToken };
            next();
        } catch (error) {
            console.error('Session validation error:', error);
            res.status(500).json({
                success: false,
                error: 'Session validation failed'
            });
        }
    };

    // Middleware for optional session validation (doesn't block if no session)
    optionalSession = async (req, res, next) => {
        try {
            const { firebaseUid, sessionToken } = req.body;
            
            if (firebaseUid && sessionToken) {
                const validation = await this.db.validateSession(firebaseUid, sessionToken);
                if (validation.valid) {
                    req.validatedUser = { firebaseUid, sessionToken };
                }
            }
            
            next();
        } catch (error) {
            console.error('Optional session validation error:', error);
            next(); // Continue even if validation fails
        }
    };
}

module.exports = SessionMiddleware;
