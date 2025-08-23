import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';

// Extend the Request interface to include user information
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

export class AuthMiddleware {
    private authService: AuthService = new AuthService();

    /**
     * Middleware to verify JWT token and authenticate requests
     */
    authenticate = (req: Request, res: Response, next: NextFunction): void => {
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
        } catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };


}

// Create a singleton instance
const authMiddleware = new AuthMiddleware();

// Export middleware functions
export const authenticate = authMiddleware.authenticate;
