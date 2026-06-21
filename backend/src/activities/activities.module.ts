import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { Category } from '../catalog/entities/category.entity';
import { User } from '../users/entities/user.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController, UserActivitiesController } from './activities.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity, ActivityParticipant, Category, User]),
    NotificationsModule,
  ],
  controllers: [ActivitiesController, UserActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
