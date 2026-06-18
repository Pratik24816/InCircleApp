import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client();
  }

  async verifyGoogleToken(idToken: string) {
    const iosClientId = this.configService.get<string>('auth.googleClientIdIos');
    const androidClientId = this.configService.get<string>('auth.googleClientIdAndroid');
    const webClientId = this.configService.get<string>('auth.googleClientIdWeb');

    const audiences = [iosClientId, androidClientId, webClientId].filter((id): id is string => !!id);

    if (audiences.length === 0) {
      throw new Error('Google OAuth Client IDs are not configured on the server');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: audiences,
      }) as any;

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
    } catch (error) {
      throw new UnauthorizedException(`Google OAuth verification failed: ${error.message}`);
    }
  }

  async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('auth.jwtAccessSecret'),
        expiresIn: this.configService.get<string>('auth.jwtAccessExpiration') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('auth.jwtRefreshSecret'),
        expiresIn: this.configService.get<string>('auth.jwtRefreshExpiration') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async devLogin(email: string) {
    if (process.env.ENABLE_DEV_AUTH !== 'true') {
      throw new ForbiddenException('Dev login is disabled. Set ENABLE_DEV_AUTH=true in backend/.env');
    }

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException(`No seed user found for ${email}. Run: npm run seed`);
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return { tokens, user };
  }

  async signInWithGoogle(idToken: string) {
    const googleUser = await this.verifyGoogleToken(idToken);

    let user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Check if user already exists with the same email
      user = await this.usersService.findByEmail(googleUser.email);
      
      if (user) {
        // User registered via email previously; link Google profile
        user = await this.usersService.update(user.id, {
          googleId: googleUser.googleId,
          googlePhotoUrl: user.googlePhotoUrl || googleUser.googlePhotoUrl,
        });
      } else {
        // First-time Google registration: auto-populate email, fullName, and googlePhotoUrl
        user = await this.usersService.create({
          email: googleUser.email,
          fullName: googleUser.fullName,
          googleId: googleUser.googleId,
          googlePhotoUrl: googleUser.googlePhotoUrl,
          isProfileCompleted: false,
        });
      }
    } else {
      // Existing user: check if Google profile picture has updated
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

  async refreshTokens(userId: string, refreshToken: string) {
    const isMatched = await this.usersService.verifyRefreshToken(userId, refreshToken);
    if (!isMatched) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Refresh token rotation: issue new tokens and replace stored hash
    const tokens = await this.generateTokens(user.id, user.email);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }
}
