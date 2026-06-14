import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('auth.jwtRefreshSecret') || 'default_jwt_refresh_secret',
      passReqToCallback: true,
    } as any);
  }

  validate(req: Request, payload: { sub: string; email: string }) {
    const refreshToken = req.body?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is missing from the request body');
    }
    // Return payload and raw token, which attaches to request.user
    return {
      id: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}
