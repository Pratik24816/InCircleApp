import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { UserDevice } from './entities/user-device.entity';
import { UserNotificationPreference } from './entities/user-notification-preference.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserDevice, UserNotificationPreference])],
  controllers: [NotificationsController],
  providers: [NotificationsService, PushService],
  exports: [NotificationsService, PushService],
})
export class NotificationsModule {}
