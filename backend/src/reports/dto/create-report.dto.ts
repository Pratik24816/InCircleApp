import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReportDto {
  @IsString()
  reportType: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  activityId?: string;

  @IsOptional()
  @IsUUID()
  reportedUserId?: string;
}
