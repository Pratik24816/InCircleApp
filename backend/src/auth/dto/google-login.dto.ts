import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsNotEmpty({ message: 'Google OAuth ID Token is required' })
  @IsString()
  token: string;
}
