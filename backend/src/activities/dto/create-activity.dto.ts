import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ example: 'Morning Riverfront Walk', minLength: 3, maxLength: 120 })
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({ example: 'Easy 5 km walk. All paces welcome.', maxLength: 2000 })
  @IsString()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ format: 'uuid', description: 'Category ID from GET /categories' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-06-22T18:00:00.000Z',
    description: 'Must be in the future',
  })
  @IsDateString()
  startDatetime: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiProperty({ example: 'Sabarmati Riverfront Gate 3' })
  @IsString()
  locationName: string;

  @ApiProperty({ example: 'Ahmedabad' })
  @IsString()
  city: string;

  @ApiPropertyOptional({ example: 23.0225 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 72.5714 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({
    enum: ['need_one_person', 'fixed_group', 'open_join'],
    example: 'open_join',
  })
  @IsEnum(['need_one_person', 'fixed_group', 'open_join'])
  groupType: 'need_one_person' | 'fixed_group' | 'open_join';

  @ApiPropertyOptional({ example: 8, nullable: true })
  @IsOptional()
  @IsNumber()
  groupSize?: number | null;

  @ApiPropertyOptional({ type: [String], example: ['chill', 'walk'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [String], example: ['outdoors'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vibeTags?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}
