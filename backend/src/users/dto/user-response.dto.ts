import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid', example: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1' })
  id: string;

  @ApiProperty({ example: 'you@incircle.app' })
  email: string;

  @ApiPropertyOptional({ example: 'you_ahm', nullable: true })
  username: string | null;

  @ApiProperty({ example: 'You (Demo)' })
  fullName: string;

  @ApiPropertyOptional({ example: 'Building habits & meeting people IRL.', nullable: true })
  bio: string | null;

  @ApiProperty({ example: 'Ahmedabad' })
  city: string;

  @ApiPropertyOptional({ nullable: true })
  googlePhotoUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  customPhotoUrl: string | null;

  @ApiProperty({
    description: 'Resolved profile photo URL (customPhotoUrl or googlePhotoUrl)',
    example: 'http://localhost:3000/uploads/profile-photos/abc.jpg',
  })
  profilePhoto: string;

  @ApiProperty({ example: true })
  isProfileCompleted: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}

export class MeResponseDto extends UserResponseDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description: 'Interest IDs linked to the current user',
    example: ['5e132481-4a2b-4aae-a185-2df7b3fb9949'],
  })
  interestIds: string[];
}
