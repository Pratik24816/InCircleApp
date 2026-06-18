import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../catalog/entities/category.entity';

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type ActivityResponse = Activity & {
  distanceKm?: number;
  category?: Category;
  creator?: Pick<User, 'id' | 'fullName' | 'username' | 'profilePhoto'>;
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(ActivityParticipant)
    private readonly participantRepo: Repository<ActivityParticipant>,
  ) {}

  private mapActivity(activity: Activity, refLat?: number, refLng?: number): ActivityResponse {
    const result = { ...activity } as ActivityResponse;
    if (refLat != null && refLng != null) {
      result.distanceKm = haversineKm(refLat, refLng, activity.latitude, activity.longitude);
    }
    return result;
  }

  private async refreshActivityStatus(activity: Activity): Promise<Activity> {
    if (activity.groupSize != null && activity.joinedCount >= activity.groupSize) {
      activity.status = 'full';
    } else if (
      activity.groupSize != null &&
      activity.joinedCount >= activity.groupSize - 1 &&
      activity.status !== 'full'
    ) {
      activity.status = 'almost_full';
    } else if (activity.status === 'full' || activity.status === 'almost_full') {
      activity.status = 'open';
    }
    return this.activityRepo.save(activity);
  }

  async findAll(query: {
    city?: string;
    categoryId?: string;
    q?: string;
    lat?: number;
    lng?: number;
    excludeFeatured?: boolean;
  }) {
    const qb = this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'category')
      .leftJoinAndSelect('a.creator', 'creator')
      .where('a.approvalStatus = :approved', { approved: 'approved' })
      .andWhere('a.status NOT IN (:...closed)', { closed: ['done', 'cancelled', 'closed'] });

    if (query.city) {
      qb.andWhere('a.city = :city', { city: query.city });
    }
    if (query.categoryId) {
      qb.andWhere('a.categoryId = :categoryId', { categoryId: query.categoryId });
    }
    if (query.q) {
      qb.andWhere('(LOWER(a.title) LIKE :q OR LOWER(a.locationName) LIKE :q)', {
        q: `%${query.q.toLowerCase()}%`,
      });
    }
    if (query.excludeFeatured) {
      qb.andWhere('a.featured = false');
    }

    qb.orderBy('a.startDatetime', 'ASC');
    const items = await qb.getMany();
    return items.map(a => this.mapActivity(a, query.lat, query.lng));
  }

  async findFeatured(city?: string, lat?: number, lng?: number) {
    const qb = this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'category')
      .leftJoinAndSelect('a.creator', 'creator')
      .where('a.featured = true')
      .andWhere('a.approvalStatus = :approved', { approved: 'approved' });

    if (city) {
      qb.andWhere('a.city = :city', { city });
    }
    qb.orderBy('a.startDatetime', 'ASC').limit(1);
    const activity = await qb.getOne();
    return activity ? this.mapActivity(activity, lat, lng) : null;
  }

  async findById(id: string, lat?: number, lng?: number) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: { category: true, creator: true },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    return this.mapActivity(activity, lat, lng);
  }

  async create(creatorId: string, dto: CreateActivityDto) {
    const activity = this.activityRepo.create({
      creatorId,
      categoryId: dto.categoryId,
      title: dto.title,
      description: dto.description,
      startDatetime: new Date(dto.startDatetime),
      endDatetime: dto.endDatetime ? new Date(dto.endDatetime) : null,
      locationName: dto.locationName,
      city: dto.city,
      latitude: dto.latitude ?? 0,
      longitude: dto.longitude ?? 0,
      groupType: dto.groupType,
      groupSize: dto.groupSize ?? null,
      tags: dto.tags ?? [],
      coverUrl: dto.coverUrl ?? null,
      approvalStatus: 'approved',
      status: 'open',
      joinedCount: 1,
    });
    const saved = await this.activityRepo.save(activity);
    await this.participantRepo.save(
      this.participantRepo.create({
        activityId: saved.id,
        userId: creatorId,
        status: 'joined',
      }),
    );
    return this.findById(saved.id);
  }

  async join(activityId: string, userId: string, status: 'joined' | 'maybe' = 'joined') {
    const activity = await this.activityRepo.findOne({ where: { id: activityId } });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.status === 'full' && status === 'joined') {
      throw new BadRequestException('Activity is full');
    }

    let participant = await this.participantRepo.findOne({
      where: { activityId, userId },
    });

    const wasJoined = participant?.status === 'joined';

    if (participant) {
      participant.status = status;
      await this.participantRepo.save(participant);
    } else {
      participant = await this.participantRepo.save(
        this.participantRepo.create({ activityId, userId, status }),
      );
    }

    if (status === 'joined' && !wasJoined) {
      activity.joinedCount += 1;
      await this.activityRepo.save(activity);
    } else if (status !== 'joined' && wasJoined) {
      activity.joinedCount = Math.max(0, activity.joinedCount - 1);
      await this.activityRepo.save(activity);
    }

    await this.refreshActivityStatus(activity);
    return this.findById(activityId);
  }

  async findForUser(userId: string, role: 'joined' | 'created' | 'completed') {
    if (role === 'created') {
      const items = await this.activityRepo.find({
        where: { creatorId: userId },
        relations: { category: true, creator: true },
        order: { startDatetime: 'DESC' },
      });
      return items.map(a => this.mapActivity(a));
    }

    const participants = await this.participantRepo.find({
      where: { userId, status: role === 'completed' ? 'joined' : 'joined' },
      relations: { activity: { category: true, creator: true } },
    });

    let activities = participants.map(p => p.activity).filter(Boolean);

    if (role === 'completed') {
      activities = activities.filter(a => a.status === 'done');
    } else {
      activities = activities.filter(a => a.status !== 'done' && a.creatorId !== userId);
    }

    return activities.map(a => this.mapActivity(a));
  }
}
