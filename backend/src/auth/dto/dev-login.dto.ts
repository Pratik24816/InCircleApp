import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DevLoginDto {
  @ApiProperty({
    example: 'you@incircle.app',
    description: 'Email of a seeded demo user (requires ENABLE_DEV_AUTH=true)',
  })
  @IsEmail()
  email: string;
}
