import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class UpdateUserInterestsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  interestIds: string[];
}
