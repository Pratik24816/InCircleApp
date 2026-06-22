import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    description: 'Google OAuth ID token from the client app',
  })
  @IsNotEmpty({ message: 'Google OAuth ID Token is required' })
  @IsString()
  token: string;
}
