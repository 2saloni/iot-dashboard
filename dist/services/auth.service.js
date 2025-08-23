"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_entity_1 = require("../entities/user.entity");
const database_config_1 = require("../config/database.config");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
let AuthService = class AuthService {
    constructor() {
        this.userRepository = database_config_1.AppDataSource.getRepository(user_entity_1.User);
    }
    generateTokens(userId, email) {
        const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
        const accessToken = jsonwebtoken_1.default.sign({ userId, email }, accessTokenSecret, { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({ userId, email }, refreshTokenSecret, { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' });
        return { accessToken, refreshToken };
    }
    async hashPassword(password) {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        return await bcrypt_1.default.hash(password, saltRounds);
    }
    async comparePassword(password, hashedPassword) {
        return await bcrypt_1.default.compare(password, hashedPassword);
    }
    formatUserResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }
    async register(registerDto) {
        try {
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { email: registerDto.email }
            });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            // Hash password
            const hashedPassword = await this.hashPassword(registerDto.password);
            // Create user
            const user = this.userRepository.create({
                name: registerDto.name,
                email: registerDto.email,
                password: hashedPassword
            });
            const savedUser = await this.userRepository.save(user);
            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(savedUser.id, savedUser.email);
            // Save refresh token
            savedUser.refreshToken = refreshToken;
            await this.userRepository.save(savedUser);
            return {
                accessToken,
                refreshToken,
                user: this.formatUserResponse(savedUser)
            };
        }
        catch (error) {
            throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async login(loginDto) {
        try {
            // Find user with password
            const user = await this.userRepository.findOne({
                where: { email: loginDto.email },
                select: ['id', 'name', 'email', 'password', 'createdAt', 'updatedAt']
            });
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Verify password
            const isPasswordValid = await this.comparePassword(loginDto.password, user.password);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            // Generate tokens
            const { accessToken, refreshToken } = this.generateTokens(user.id, user.email);
            // Save refresh token
            await this.userRepository.update(user.id, { refreshToken });
            return {
                accessToken,
                refreshToken,
                user: this.formatUserResponse(user)
            };
        }
        catch (error) {
            throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async logout(userId) {
        try {
            await this.userRepository.update(userId, { refreshToken: undefined });
        }
        catch (error) {
            throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getUserProfile(userId) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });
            if (!user) {
                throw new Error('User not found');
            }
            return this.formatUserResponse(user);
        }
        catch (error) {
            throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async refreshToken(refreshToken) {
        try {
            // Verify the refresh token is valid
            const refreshTokenSecret = process.env.JWT_SECRET;
            const decoded = jsonwebtoken_1.default.verify(refreshToken, refreshTokenSecret);
            // Find user with the refresh token
            const user = await this.userRepository.findOne({
                where: {
                    id: decoded.userId,
                    refreshToken: refreshToken // Ensure the refresh token matches what's stored
                },
                select: ['id', 'name', 'email', 'refreshToken']
            });
            if (!user) {
                throw new Error('Invalid refresh token or user not found');
            }
            // Generate new tokens
            const { accessToken, refreshToken: newRefreshToken } = this.generateTokens(user.id, user.email);
            // Update user with new refresh token
            await this.userRepository.update(user.id, {
                refreshToken: newRefreshToken,
            });
            return {
                accessToken,
                refreshToken: newRefreshToken
            };
        }
        catch (error) {
            throw new Error(`Refresh token failed: ${error instanceof Error ? error.message : 'Invalid or expired refresh token'}`);
        }
    }
    verifyAccessToken(token) {
        try {
            const accessTokenSecret = process.env.JWT_SECRET;
            return jsonwebtoken_1.default.verify(token, accessTokenSecret);
        }
        catch (error) {
            throw new Error('Invalid access token');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], AuthService);
