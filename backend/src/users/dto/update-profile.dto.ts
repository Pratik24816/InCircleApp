import { IsString, IsOptional, Length, Matches, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/** @see UPDATE_PROFILE_BODY_EXAMPLES in swagger-examples.ts */
export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'you_ahm',
    minLength: 3,
    maxLength: 20,
    description: 'Alphanumeric and underscores only. Sets isProfileCompleted on first username.',
  })
  @IsOptional()
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  username?: string;

  @ApiPropertyOptional({ example: 'You (Demo)' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  fullName?: string;

  @ApiPropertyOptional({ example: 'Building habits & meeting people IRL.', maxLength: 160 })
  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'Bio cannot exceed 160 characters' })
  bio?: string;

  @ApiPropertyOptional({ example: 'Ahmedabad', maxLength: 80 })
  @IsOptional()
  @IsString()
  @Length(1, 80)
  city?: string;
}
