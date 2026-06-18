import { IsString, IsOptional, Length, Matches, IsNotEmpty } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(3, 20, { message: 'Username must be between 3 and 20 characters long' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain alphanumeric characters and underscores',
  })
  username?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Full name cannot be empty' })
  fullName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 160, { message: 'Bio cannot exceed 160 characters' })
  bio?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  city?: string;
}
