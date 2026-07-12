import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CircleFeedback } from './entities/circle-feedback.entity';
import { CircleFeedbackController } from './circle-feedback.controller';
import { CircleFeedbackService } from './circle-feedback.service';

@Module({
  imports: [TypeOrmModule.forFeature([CircleFeedback])],
  controllers: [CircleFeedbackController],
  providers: [CircleFeedbackService],
})
export class CircleFeedbackModule {}
