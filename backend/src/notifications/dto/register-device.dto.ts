import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @IsString()
  @IsNotEmpty()
  pushToken: string;

  @IsIn(['ios', 'android'])
  platform: 'ios' | 'android';
}
