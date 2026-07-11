import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CircleFeedback } from './entities/circle-feedback.entity';
import { CreateCircleFeedbackDto } from './dto/create-circle-feedback.dto';

@Injectable()
export class CircleFeedbackService {
  constructor(
    @InjectRepository(CircleFeedback)
    private readonly repo: Repository<CircleFeedback>,
  ) {}

  async findRecent(limit = 100): Promise<CircleFeedback[]> {
    const take = Math.min(Math.max(limit, 1), 200);
    return this.repo.find({
      order: { createdAt: 'DESC' },
      take,
    });
  }

  async create(dto: CreateCircleFeedbackDto): Promise<CircleFeedback> {
    const count = await this.repo.count();
    const row = this.repo.create({
      avatarId: dto.avatarId,
      name: dto.name.trim() || 'Anonymous',
      message: dto.message.trim(),
      category: dto.category,
      fireCount: 0,
      memberNumber: count + 1,
    });
    return this.repo.save(row);
  }

  async react(id: string): Promise<CircleFeedback> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Circle member not found');
    row.fireCount += 1;
    return this.repo.save(row);
  }
}
