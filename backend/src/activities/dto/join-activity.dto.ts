import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class JoinActivityDto {
  @ApiPropertyOptional({
    enum: ['joined', 'maybe'],
    default: 'joined',
    example: 'joined',
    description: 'RSVP status when joining via POST /activities/:id/join',
  })
  @IsOptional()
  @IsEnum(['joined', 'maybe'])
  status?: 'joined' | 'maybe';
}
