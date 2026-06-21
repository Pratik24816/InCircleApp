import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { NOTIFICATION_TONES } from '../notification-copy';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  pushActivity?: boolean;

  @IsOptional()
  @IsBoolean()
  pushChat?: boolean;

  @IsOptional()
  @IsBoolean()
  pushReminders?: boolean;

  @IsOptional()
  @IsBoolean()
  pushDiscovery?: boolean;

  @IsOptional()
  @IsIn([...NOTIFICATION_TONES])
  tone?: (typeof NOTIFICATION_TONES)[number];
}
