import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { Public } from './guards/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.signInWithGoogle(googleLoginDto.token);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @GetUser() user: { id: string; email: string; refreshToken: string },
  ) {
    return this.authService.refreshTokens(user.id, user.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetUser('id') userId: string) {
    return this.authService.logout(userId);
  }
}
