"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const auth_service_1 = require("../services/auth.service");
const auth_request_1 = require("../dto/request/auth.request");
class AuthController {
    constructor() {
        this.authService = new auth_service_1.AuthService();
        /**
         * Register a new user
         * POST /auth/register
         */
        this.register = async (req, res) => {
            try {
                // Transform and validate request body
                const registerDto = (0, class_transformer_1.plainToClass)(auth_request_1.RegisterDto, req.body);
                const errors = await (0, class_validator_1.validate)(registerDto);
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
            }
            catch (error) {
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
        this.login = async (req, res) => {
            try {
                // Transform and validate request body
                const loginDto = (0, class_transformer_1.plainToClass)(auth_request_1.LoginDto, req.body);
                const errors = await (0, class_validator_1.validate)(loginDto);
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
            }
            catch (error) {
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
        this.logout = async (req, res) => {
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
            }
            catch (error) {
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
        this.getProfile = async (req, res) => {
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
            }
            catch (error) {
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
        this.refreshToken = async (req, res) => {
            try {
                // Transform and validate request body
                const refreshTokenDto = (0, class_transformer_1.plainToClass)(auth_request_1.RefreshTokenDto, req.body);
                const errors = await (0, class_validator_1.validate)(refreshTokenDto);
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
                const result = await this.authService.refreshToken(refreshTokenDto.refreshToken);
                res.status(200).json({
                    success: true,
                    message: 'Token refreshed successfully',
                    data: result
                });
            }
            catch (error) {
                res.status(401).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Token refresh failed',
                    error: error instanceof Error ? error.message : 'Invalid or expired refresh token'
                });
            }
        };
    }
}
exports.AuthController = AuthController;
