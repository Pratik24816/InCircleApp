import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private readonly reportRepo: Repository<Report>) {}

  create(reporterId: string, dto: CreateReportDto) {
    const report = this.reportRepo.create({
      reporterId,
      reportType: dto.reportType,
      reason: dto.reason,
      description: dto.description ?? null,
      activityId: dto.activityId ?? null,
      reportedUserId: dto.reportedUserId ?? null,
    });
    return this.reportRepo.save(report);
  }
}
