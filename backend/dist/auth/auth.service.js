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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const google_auth_library_1 = require("google-auth-library");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    configService;
    googleClient;
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client();
    }
    async verifyGoogleToken(idToken) {
        const iosClientId = this.configService.get('auth.googleClientIdIos');
        const androidClientId = this.configService.get('auth.googleClientIdAndroid');
        const webClientId = this.configService.get('auth.googleClientIdWeb');
        const audiences = [iosClientId, androidClientId, webClientId].filter((id) => !!id);
        if (audiences.length === 0) {
            throw new Error('Google OAuth Client IDs are not configured on the server');
        }
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: audiences,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Token payload is empty');
            }
            return {
                googleId: payload.sub,
                email: payload.email,
                fullName: payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim(),
                googlePhotoUrl: payload.picture || null,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException(`Google OAuth verification failed: ${error.message}`);
        }
    }
    async generateTokens(userId, email) {
        const payload = { sub: userId, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('auth.jwtAccessSecret'),
                expiresIn: this.configService.get('auth.jwtAccessExpiration'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('auth.jwtRefreshSecret'),
                expiresIn: this.configService.get('auth.jwtRefreshExpiration'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async devLogin(email) {
        if (process.env.ENABLE_DEV_AUTH !== 'true') {
            throw new common_1.ForbiddenException('Dev login is disabled. Set ENABLE_DEV_AUTH=true in backend/.env');
        }
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException(`No seed user found for ${email}. Run: npm run seed`);
        }
        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
        return { tokens, user };
    }
    async signInWithGoogle(idToken) {
        const googleUser = await this.verifyGoogleToken(idToken);
        let user = await this.usersService.findByGoogleId(googleUser.googleId);
        if (!user) {
            user = await this.usersService.findByEmail(googleUser.email);
            if (user) {
                user = await this.usersService.update(user.id, {
                    googleId: googleUser.googleId,
                    googlePhotoUrl: user.googlePhotoUrl || googleUser.googlePhotoUrl,
                });
            }
            else {
                user = await this.usersService.create({
                    email: googleUser.email,
                    fullName: googleUser.fullName,
                    googleId: googleUser.googleId,
                    googlePhotoUrl: googleUser.googlePhotoUrl,
                    isProfileCompleted: false,
                });
            }
        }
        else {
            if (googleUser.googlePhotoUrl && user.googlePhotoUrl !== googleUser.googlePhotoUrl) {
                user = await this.usersService.update(user.id, {
                    googlePhotoUrl: googleUser.googlePhotoUrl,
                });
            }
        }
        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
        return {
            tokens,
            user,
        };
    }
    async refreshTokens(userId, refreshToken) {
        const isMatched = await this.usersService.verifyRefreshToken(userId, refreshToken);
        if (!isMatched) {
            throw new common_1.ForbiddenException('Invalid or expired refresh token');
        }
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.usersService.updateRefreshToken(userId, null);
        return { success: true, message: 'Logged out successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map