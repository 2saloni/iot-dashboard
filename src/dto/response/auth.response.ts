export class AuthResponseDto {
    accessToken!: string;
    refreshToken!: string;
    user!: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
    };
}

export class LoginResponseDto extends AuthResponseDto {}

export class RegisterResponseDto extends AuthResponseDto {}

export class RefreshTokenResponseDto {
    accessToken!: string;
    refreshToken!: string;
}

export class UserProfileDto {
    id!: string;
    name!: string;
    email!: string;
    createdAt!: Date;
    updatedAt!: Date;
}
