import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushService: PushService,
  ) {}

  @Get('preferences')
  getPreferences(@GetUser('id') userId: string) {
    return this.notificationsService.getPreferences(userId);
  }

  @Patch('preferences')
  updatePreferences(@GetUser('id') userId: string, @Body() dto: UpdateNotificationPreferencesDto) {
    return this.notificationsService.updatePreferences(userId, dto);
  }

  @Post('test')
  sendTest(@GetUser('id') userId: string) {
    return this.notificationsService.sendTestNotification(userId);
  }

  @Get('push-status')
  pushStatus() {
    return { enabled: this.pushService.isEnabled() };
  }

  @Get()
  list(@GetUser('id') userId: string, @Query('limit') limit?: string) {
    const parsed = limit ? parseInt(limit, 10) : 50;
    return this.notificationsService.listForUser(userId, Number.isNaN(parsed) ? 50 : parsed);
  }

  @Get('unread-count')
  unreadCount(@GetUser('id') userId: string) {
    return this.notificationsService.getUnreadCount(userId).then(count => ({ count }));
  }

  @Patch('read-all')
  markAllRead(@GetUser('id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Patch(':id/read')
  markRead(@GetUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(userId, id);
  }

  @Post('devices')
  registerDevice(@GetUser('id') userId: string, @Body() dto: RegisterDeviceDto) {
    return this.notificationsService.registerDevice(userId, dto);
  }

  @Delete('devices')
  removeDevice(@GetUser('id') userId: string, @Body() body: { pushToken: string }) {
    return this.notificationsService.removeDevice(userId, body.pushToken);
  }
}
