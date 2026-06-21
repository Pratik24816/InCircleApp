import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { DevLoginDto } from './dto/dev-login.dto';
import { DEV_LOGIN_BODY_EXAMPLES, GOOGLE_LOGIN_BODY_EXAMPLES } from './dto/swagger-examples';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from './guards/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with Google ID token' })
  @ApiBody({ type: GoogleLoginDto, examples: GOOGLE_LOGIN_BODY_EXAMPLES })
  @ApiOkResponse({
    description: 'Returns access and refresh tokens plus user object',
    schema: {
      example: {
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        },
        user: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
          email: 'you@incircle.app',
          fullName: 'You (Demo)',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid or missing Google token' })
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.signInWithGoogle(googleLoginDto.token);
  }

  @Public()
  @Post('dev')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dev login with seeded email (local only)' })
  @ApiBody({ type: DevLoginDto, examples: DEV_LOGIN_BODY_EXAMPLES })
  @ApiOkResponse({
    description: 'Returns access and refresh tokens plus user object',
    schema: {
      example: {
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        },
        user: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
          email: 'you@incircle.app',
          username: 'you_ahm',
          fullName: 'You (Demo)',
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Dev auth disabled or unknown email' })
  async devLogin(@Body() dto: DevLoginDto) {
    return this.authService.devLogin(dto.email);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token in Authorization header' })
  @ApiBearerAuth('JWT-auth')
  @ApiOkResponse({
    schema: {
      example: {
        tokens: {
          accessToken: 'eyJhbGciOiJIUzI1NiIs...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  async refresh(
    @GetUser() user: { id: string; email: string; refreshToken: string },
  ) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiOkResponse({ schema: { example: { message: 'Logged out successfully' } } })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
