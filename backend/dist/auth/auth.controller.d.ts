import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    googleLogin(googleLoginDto: GoogleLoginDto): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: import("../users/entities/user.entity").User;
    }>;
    devLogin(dto: DevLoginDto): Promise<{
        tokens: {
            accessToken: string;
            refreshToken: string;
        };
        user: import("../users/entities/user.entity").User;
    }>;
    refresh(user: {
        id: string;
        email: string;
        refreshToken: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
