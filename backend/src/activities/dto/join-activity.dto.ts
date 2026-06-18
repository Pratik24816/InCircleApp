import { IsEnum, IsOptional } from 'class-validator';

export class JoinActivityDto {
  @IsOptional()
  @IsEnum(['joined', 'maybe'])
  status?: 'joined' | 'maybe';
}
