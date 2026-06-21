import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/notification.types';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private readonly reportRepo: Repository<Report>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({
      reporterId,
      reportType: dto.reportType,
      reason: dto.reason,
      description: dto.description ?? null,
      activityId: dto.activityId ?? null,
      reportedUserId: dto.reportedUserId ?? null,
    });
    const saved = await this.reportRepo.save(report);

    await this.notificationsService.notifyEvent({
      userId: reporterId,
      type: NOTIFICATION_TYPES.REPORT_RECEIVED,
      activityId: dto.activityId ?? null,
      metadata: { reportId: saved.id },
      dedupeKey: `report:${saved.id}`,
    });

    return saved;
  }
}
