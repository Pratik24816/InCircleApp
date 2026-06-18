import {
  IsArray,
  IsBoolean,
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
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsUUID()
  categoryId: string;

  @IsDateString()
  startDatetime: string;

  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @IsString()
  locationName: string;

  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsEnum(['need_one_person', 'fixed_group', 'open_join'])
  groupType: 'need_one_person' | 'fixed_group' | 'open_join';

  @IsOptional()
  @IsNumber()
  groupSize?: number | null;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  coverUrl?: string;
}
