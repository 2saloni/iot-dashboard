import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../entities/user.entity';
import { AppDataSource } from '../config/database.config';
import { RegisterDto, LoginDto } from '../dto/request/auth.request';
import { AuthResponseDto, RefreshTokenResponseDto, UserProfileDto } from '../dto/response/auth.response';
import { Singleton } from '../decorators/singleton.decorator';

@Singleton
export class AuthService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    private generateTokens(userId: string, email: string): { accessToken: string; refreshToken: string } {
        const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
        const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-token-secret';
        
        const accessToken = jwt.sign(
            { userId, email },
            accessTokenSecret,
            { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' } as jwt.SignOptions
        );

        const refreshToken = jwt.sign(
            { userId, email },
            refreshTokenSecret,
            { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' } as jwt.SignOptions
        );

        return { accessToken, refreshToken };
    }

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
        return await bcrypt.hash(password, saltRounds);
    }

    private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

    private formatUserResponse(user: User): UserProfileDto {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
    }

    async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
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
        } catch (error) {
            throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async login(loginDto: LoginDto): Promise<AuthResponseDto> {
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
        } catch (error) {
            throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async logout(userId: string): Promise<void> {
        try {
            await this.userRepository.update(userId, { refreshToken: undefined });
        } catch (error) {
            throw new Error(`Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getUserProfile(userId: string): Promise<UserProfileDto> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                throw new Error('User not found');
            }

            return this.formatUserResponse(user);
        } catch (error) {
            throw new Error(`Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    verifyAccessToken(token: string): { userId: string; email: string } {
        try {
            const accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-access-token-secret';
            return jwt.verify(token, accessTokenSecret) as { userId: string; email: string };
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }
}
