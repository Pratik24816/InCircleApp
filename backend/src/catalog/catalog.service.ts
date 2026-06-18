import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { Category } from './entities/category.entity';
import { UserInterest } from './entities/user-interest.entity';

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Interest) private readonly interestRepo: Repository<Interest>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(UserInterest) private readonly userInterestRepo: Repository<UserInterest>,
  ) {}

  findAllInterests() {
    return this.interestRepo.find({ order: { name: 'ASC' } });
  }

  findAllCategories() {
    return this.categoryRepo.find({ order: { name: 'ASC' } });
  }

  async getUserInterestIds(userId: string): Promise<string[]> {
    const rows = await this.userInterestRepo.find({ where: { userId } });
    return rows.map(r => r.interestId);
  }

  async setUserInterests(userId: string, interestIds: string[]) {
    await this.userInterestRepo.delete({ userId });
    if (interestIds.length === 0) {
      return [];
    }
    const valid = await this.interestRepo.find({ where: { id: In(interestIds) } });
    const entities = valid.map(i =>
      this.userInterestRepo.create({ userId, interestId: i.id }),
    );
    await this.userInterestRepo.save(entities);
    return valid;
  }
}
