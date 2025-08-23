"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = exports.AuthMiddleware = void 0;
const auth_service_1 = require("../services/auth.service");
class AuthMiddleware {
    constructor() {
        this.authService = new auth_service_1.AuthService();
        /**
         * Middleware to verify JWT token and authenticate requests
         */
        this.authenticate = (req, res, next) => {
            try {
                const authHeader = req.headers.authorization;
                if (!authHeader) {
                    res.status(401).json({
                        success: false,
                        message: 'Access token is required'
                    });
                    return;
                }
                // Extract token from "Bearer <token>" format
                const token = authHeader.split(' ')[1];
                if (!token) {
                    res.status(401).json({
                        success: false,
                        message: 'Invalid token format. Use Bearer <token>'
                    });
                    return;
                }
                // Verify the token
                const decoded = this.authService.verifyAccessToken(token);
                // Attach user info to request object
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email
                };
                next();
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
    }
}
exports.AuthMiddleware = AuthMiddleware;
// Create a singleton instance
const authMiddleware = new AuthMiddleware();
// Export middleware functions
exports.authenticate = authMiddleware.authenticate;
