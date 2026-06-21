import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivityCategoryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Walk & Talk' })
  name: string;

  @ApiProperty({ example: 'walk-talk' })
  slug: string;

  @ApiProperty({ example: '🚶' })
  icon: string;
}

export class ActivityCreatorDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'You (Demo)' })
  fullName: string;

  @ApiPropertyOptional({ example: 'you_ahm', nullable: true })
  username: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  profilePhoto?: string;
}

export class ActivityParticipantDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Alex' })
  fullName: string;

  @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
  profilePhoto?: string;
}

export class ActivityResponseDto {
  @ApiProperty({ format: 'uuid', example: 'dddddddd-dddd-4ddd-8ddd-dddddddddd01' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  creatorId: string;

  @ApiProperty({ format: 'uuid' })
  categoryId: string;

  @ApiProperty({ example: 'Morning Riverfront Walk' })
  title: string;

  @ApiProperty({ example: 'Easy 5 km walk. All paces welcome.' })
  description: string;

  @ApiPropertyOptional({ nullable: true, example: 'https://example.com/cover.jpg' })
  coverUrl: string | null;

  @ApiProperty({ type: String, format: 'date-time' })
  startDatetime: Date;

  @ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })
  endDatetime: Date | null;

  @ApiProperty({ example: 'Sabarmati Riverfront Gate 3' })
  locationName: string;

  @ApiProperty({ example: 'Ahmedabad' })
  city: string;

  @ApiProperty({ example: 23.0225 })
  latitude: number;

  @ApiProperty({ example: 72.5714 })
  longitude: number;

  @ApiProperty({
    enum: ['need_one_person', 'fixed_group', 'open_join'],
    example: 'open_join',
  })
  groupType: 'need_one_person' | 'fixed_group' | 'open_join';

  @ApiPropertyOptional({ example: 8, nullable: true })
  groupSize: number | null;

  @ApiProperty({ example: 1 })
  joinedCount: number;

  @ApiProperty({
    enum: ['open', 'almost_full', 'full', 'done', 'cancelled', 'closed'],
    example: 'open',
  })
  status: string;

  @ApiProperty({
    enum: ['pending', 'approved', 'rejected'],
    example: 'approved',
  })
  approvalStatus: string;

  @ApiProperty({ example: false })
  featured: boolean;

  @ApiProperty({ type: [String], example: ['chill', 'walk'] })
  tags: string[];

  @ApiProperty({ type: [String], example: ['outdoors'] })
  vibeTags: string[];

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: 1.2, description: 'Distance in km when lat/lng query params are provided' })
  distanceKm?: number;

  @ApiPropertyOptional({ type: ActivityCategoryDto })
  category?: ActivityCategoryDto;

  @ApiPropertyOptional({ type: ActivityCreatorDto })
  creator?: ActivityCreatorDto;

  @ApiPropertyOptional({ type: [ActivityParticipantDto] })
  participants?: ActivityParticipantDto[];
}
