import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

const CATEGORIES = ['concept', 'suggestion', 'feature', 'feedback', 'hype', 'other'] as const;

const AVATAR_IDS = [
  'hyped',
  'amazed',
  'in-love',
  'curious',
  'inspired',
  'happy',
  'ready',
  'impressed',
  'intrigued',
  'thoughtful',
  'thrilled',
  'believer',
] as const;

export class CreateCircleFeedbackDto {
  @IsString()
  @IsIn(AVATAR_IDS)
  avatarId: string;

  @IsString()
  @MaxLength(64)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(280)
  message: string;

  @IsString()
  @IsIn(CATEGORIES)
  category: string;
}
