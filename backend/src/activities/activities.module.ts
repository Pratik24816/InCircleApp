import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './entities/activity.entity';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { ActivitiesService } from './activities.service';
import { ActivitiesController, UserActivitiesController } from './activities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Activity, ActivityParticipant])],
  controllers: [ActivitiesController, UserActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
