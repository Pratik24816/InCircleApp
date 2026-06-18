import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly configService;
    private googleClient;
    constructor(usersService: UsersService, jwtService: JwtService, configService: ConfigService);
    verifyGoogleToken(idToken: string): Promise<{
        googleId: any;
        email: any;
        fullName: any;
        googlePhotoUrl: any;
    }>;
    generateTokens(userId: string, email: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    devLogin(email: string): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: User;
    }>;
    signInWithGoogle(idToken: string): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: User;
    }>;
    refreshTokens(userId: string, refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
