import { Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto, RefreshTokenDto } from '../dto/request/auth.request';
import { RefreshTokenResponseDto } from '../dto/response/auth.response';

export class AuthController {
    private authService: AuthService = new AuthService();

    /**
     * Register a new user
     * POST /auth/register
     */
    register = async (req: Request, res: Response): Promise<void> => {
        try {
            // Transform and validate request body
            const registerDto = plainToClass(RegisterDto, req.body);
            const errors = await validate(registerDto);

            if (errors.length > 0) {
                const validationErrors = errors.map(error => ({
                    field: error.property,
                    errors: Object.values(error.constraints || {})
                }));

                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
                return;
            }

            // Register user
            const result = await this.authService.register(registerDto);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: result
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Registration failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Login user
     * POST /auth/login
     */
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            // Transform and validate request body
            const loginDto = plainToClass(LoginDto, req.body);
            const errors = await validate(loginDto);

            if (errors.length > 0) {
                const validationErrors = errors.map(error => ({
                    field: error.property,
                    errors: Object.values(error.constraints || {})
                }));

                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
                return;
            }

            // Login user
            const result = await this.authService.login(loginDto);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Login failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Logout user
     * POST /auth/logout
     * Requires authentication
     */
    logout = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            await this.authService.logout(userId);

            res.status(200).json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Logout failed',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Get user profile
     * GET /auth/profile
     * Requires authentication
     */
    getProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const profile = await this.authService.getUserProfile(userId);

            res.status(200).json({
                success: true,
                message: 'Profile retrieved successfully',
                data: profile
            });
        } catch (error) {
            res.status(404).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get profile',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    /**
     * Refresh access token using refresh token for auto-login
     * POST /auth/refresh
     */
    refreshToken = async (req: Request, res: Response): Promise<void> => {
        try {
            // Transform and validate request body
            const refreshTokenDto: RefreshTokenDto = plainToClass(RefreshTokenDto, req.body);
            const errors: ValidationError[] = await validate(refreshTokenDto);

            if (errors.length > 0) {
                const validationErrors = errors.map(error => ({
                    field: error.property,
                    errors: Object.values(error.constraints || {})
                }));

                res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
                return;
            }

            // Refresh token
            const result: RefreshTokenResponseDto = await this.authService.refreshToken(refreshTokenDto.refreshToken);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: result
            });
        } catch (error) {
            res.status(401).json({
                success: false,
                message: error instanceof Error ? error.message : 'Token refresh failed',
                error: error instanceof Error ? error.message : 'Invalid or expired refresh token'
            });
        }
    };

}
