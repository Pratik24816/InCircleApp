import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Activity, ActivityStatus } from './entities/activity.entity';
import { ActivityParticipant } from './entities/activity-participant.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { User } from '../users/entities/user.entity';
import { Category } from '../catalog/entities/category.entity';
import { resolveActivityCoverUrl } from '../database/activity-cover-urls';
import { NotificationsService } from '../notifications/notifications.service';
import { NOTIFICATION_TYPES } from '../notifications/notification.types';

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

const TONIGHT_DEMO_IDS = [
  'dddddddd-dddd-4ddd-8ddd-dddddddddd01',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd03',
  'dddddddd-dddd-4ddd-8ddd-dddddddddd04',
] as const;

const TONIGHT_DEMO_HOURS: Record<string, number> = {
  'dddddddd-dddd-4ddd-8ddd-dddddddddd01': 18,
  'dddddddd-dddd-4ddd-8ddd-dddddddddd02': 20,
  'dddddddd-dddd-4ddd-8ddd-dddddddddd03': 19,
  'dddddddd-dddd-4ddd-8ddd-dddddddddd04': 21,
};

export type ActivityParticipantPreview = {
  id: string;
  fullName: string;
  profilePhoto: string;
};

export type ActivityResponse = Activity & {
  distanceKm?: number;
  category?: Category;
  creator?: Pick<User, 'id' | 'fullName' | 'username' | 'profilePhoto'>;
  participants?: ActivityParticipantPreview[];
};

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(ActivityParticipant)
    private readonly participantRepo: Repository<ActivityParticipant>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  private withResolvedCover(activity: Activity): Activity {
    const coverUrl = resolveActivityCoverUrl({
      id: activity.id,
      coverUrl: activity.coverUrl,
      title: activity.title,
      tags: activity.tags,
      categorySlug: activity.category?.slug ?? null,
    });
    return { ...activity, coverUrl };
  }

  private mapActivity(activity: Activity, refLat?: number, refLng?: number): ActivityResponse {
    const normalized = this.normalizeTonightDemo(activity);
    const withCover = this.withResolvedCover(normalized);
    const result = { ...withCover } as ActivityResponse;
    if (refLat != null && refLng != null) {
      result.distanceKm = haversineKm(refLat, refLng, normalized.latitude, normalized.longitude);
    }
    return result;
  }

  private normalizeTonightDemo(activity: Activity): Activity {
    const hour = TONIGHT_DEMO_HOURS[activity.id];
    if (hour == null) {
      return activity;
    }
    const start = new Date();
    start.setHours(hour, 0, 0, 0);
    return { ...activity, startDatetime: start };
  }

  private getTonightWindow() {
    const now = new Date();
    const eveningStart = new Date(now);
    eveningStart.setHours(17, 0, 0, 0);
    const tonightEnd = new Date(now);
    tonightEnd.setHours(23, 59, 59, 999);
    const from = now.getTime() > eveningStart.getTime() ? now : eveningStart;
    return { from, to: tonightEnd };
  }

  private mapParticipantUser(user: User): ActivityParticipantPreview {
    return {
      id: user.id,
      fullName: user.fullName,
      profilePhoto: user.customPhotoUrl || user.googlePhotoUrl || '',
    };
  }

  private async attachParticipants(activities: ActivityResponse[]): Promise<ActivityResponse[]> {
    if (!activities.length) {
      return activities;
    }
    const ids = activities.map(a => a.id);
    const rows = await this.participantRepo.find({
      where: { activityId: In(ids), status: 'joined' },
      relations: { user: true },
      order: { joinedAt: 'ASC' },
    });

    const byActivity = new Map<string, ActivityParticipantPreview[]>();
    for (const row of rows) {
      if (!row.user) {
        continue;
      }
      const list = byActivity.get(row.activityId) ?? [];
      if (list.length < 4) {
        list.push(this.mapParticipantUser(row.user));
      }
      byActivity.set(row.activityId, list);
    }

    return activities.map(a => ({
      ...a,
      participants: byActivity.get(a.id) ?? [],
    }));
  }

  private async refreshActivityStatus(
    activity: Activity,
  ): Promise<{ previousStatus: ActivityStatus; activity: Activity }> {
    const previousStatus = activity.status;

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

    const saved = await this.activityRepo.save(activity);
    return { previousStatus, activity: saved };
  }

  private firstName(fullName: string): string {
    return fullName.trim().split(/\s+/)[0] || 'Someone';
  }

  private async getParticipantUserIds(
    activityId: string,
    statuses: Array<'joined' | 'maybe'> = ['joined', 'maybe'],
  ): Promise<string[]> {
    const rows = await this.participantRepo.find({
      where: { activityId, status: In(statuses) },
    });
    return rows.map(r => r.userId);
  }

  private async notifyStatusChange(
    activity: Activity,
    previousStatus: ActivityStatus,
    excludeUserId?: string,
  ): Promise<void> {
    if (previousStatus === activity.status) {
      return;
    }

    if (activity.status === 'almost_full') {
      const userIds = await this.getParticipantUserIds(activity.id, ['joined']);
      const targets = new Set([activity.creatorId, ...userIds]);
      if (excludeUserId) {
        targets.delete(excludeUserId);
      }

      await this.notificationsService.notifyManyEvents(
        [...targets].map(userId => ({
          userId,
          type: NOTIFICATION_TYPES.ACTIVITY_ALMOST_FULL,
          activityId: activity.id,
          dedupeKey: `almost_full:${activity.id}:${userId}`,
          copyVars: {
            activityTitle: activity.title,
            locationName: activity.locationName,
            city: activity.city,
            spotsLeft:
              activity.groupSize != null
                ? Math.max(1, activity.groupSize - activity.joinedCount)
                : 1,
          },
        })),
      );
      return;
    }

    if (activity.status === 'full') {
      const userIds = await this.getParticipantUserIds(activity.id, ['joined', 'maybe']);
      const targets = new Set([activity.creatorId, ...userIds]);
      if (excludeUserId) {
        targets.delete(excludeUserId);
      }

      await this.notificationsService.notifyManyEvents(
        [...targets].map(userId => ({
          userId,
          type: NOTIFICATION_TYPES.ACTIVITY_FULL,
          activityId: activity.id,
          dedupeKey: `full:${activity.id}:${userId}`,
          copyVars: {
            activityTitle: activity.title,
            locationName: activity.locationName,
            city: activity.city,
          },
        })),
      );
    }
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
    const mapped = items.map(a => this.mapActivity(a, query.lat, query.lng));
    return this.attachParticipants(mapped);
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
    if (!activity) {
      return null;
    }
    const [withParticipants] = await this.attachParticipants([
      this.mapActivity(activity, lat, lng),
    ]);
    return withParticipants;
  }

  async findTonight(city?: string, lat?: number, lng?: number) {
    const { from, to } = this.getTonightWindow();

    const qb = this.activityRepo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.category', 'category')
      .leftJoinAndSelect('a.creator', 'creator')
      .where('a.approvalStatus = :approved', { approved: 'approved' })
      .andWhere('a.status NOT IN (:...closed)', { closed: ['done', 'cancelled', 'closed'] })
      .andWhere(
        '(a.id IN (:...demoIds) OR (a.startDatetime BETWEEN :from AND :to AND DATE(a.startDatetime) = CURRENT_DATE))',
        { demoIds: [...TONIGHT_DEMO_IDS], from, to },
      );

    if (city) {
      qb.andWhere('a.city = :city', { city });
    }

    qb.orderBy('a.startDatetime', 'ASC');
    const items = await qb.getMany();
    const mapped = items.map(a => this.mapActivity(a, lat, lng));
    return this.attachParticipants(mapped);
  }

  async findById(id: string, lat?: number, lng?: number) {
    const activity = await this.activityRepo.findOne({
      where: { id },
      relations: { category: true, creator: true },
    });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    const [withParticipants] = await this.attachParticipants([this.mapActivity(activity, lat, lng)]);
    return withParticipants;
  }

  private readonly closedStatuses: ActivityStatus[] = ['done', 'cancelled', 'closed'];

  private async getOwnedActivity(id: string, userId: string): Promise<Activity> {
    const activity = await this.activityRepo.findOne({ where: { id } });
    if (!activity) {
      throw new NotFoundException('Activity not found');
    }
    if (activity.creatorId !== userId) {
      throw new ForbiddenException('Only the host can modify this activity');
    }
    if (this.closedStatuses.includes(activity.status)) {
      throw new BadRequestException('This activity can no longer be modified');
    }
    return activity;
  }

  async create(creatorId: string, dto: CreateActivityDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    const coverUrl = resolveActivityCoverUrl({
      coverUrl: dto.coverUrl ?? null,
      title: dto.title,
      tags: dto.tags ?? [],
      categorySlug: category?.slug ?? null,
    });

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
      vibeTags: dto.vibeTags ?? [],
      coverUrl,
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

    await this.notificationsService.notifyEvent({
      userId: creatorId,
      type: NOTIFICATION_TYPES.ACTIVITY_PUBLISHED,
      activityId: saved.id,
      dedupeKey: `published:${saved.id}`,
      copyVars: {
        activityTitle: dto.title,
        locationName: dto.locationName,
        city: dto.city,
      },
    });

    return this.findById(saved.id);
  }

  async update(id: string, userId: string, dto: UpdateActivityDto) {
    const activity = await this.getOwnedActivity(id, userId);

    if (dto.categoryId != null) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new BadRequestException('Invalid category');
      }
      activity.categoryId = dto.categoryId;
    }

    if (dto.title != null) {
      activity.title = dto.title;
    }
    if (dto.description != null) {
      activity.description = dto.description;
    }
    if (dto.startDatetime != null) {
      const start = new Date(dto.startDatetime);
      if (start.getTime() <= Date.now()) {
        throw new BadRequestException('Start time must be in the future');
      }
      activity.startDatetime = start;
    }
    if (dto.endDatetime !== undefined) {
      activity.endDatetime = dto.endDatetime ? new Date(dto.endDatetime) : null;
    }
    if (dto.locationName != null) {
      activity.locationName = dto.locationName;
    }
    if (dto.city != null) {
      activity.city = dto.city;
    }
    if (dto.latitude != null) {
      activity.latitude = dto.latitude;
    }
    if (dto.longitude != null) {
      activity.longitude = dto.longitude;
    }
    if (dto.groupType != null) {
      activity.groupType = dto.groupType;
    }
    if (dto.groupSize !== undefined) {
      activity.groupSize = dto.groupSize;
    }
    if (dto.tags != null) {
      activity.tags = dto.tags;
    }
    if (dto.vibeTags != null) {
      activity.vibeTags = dto.vibeTags;
    }

    const category =
      activity.category ??
      (await this.categoryRepo.findOne({ where: { id: activity.categoryId } }));

    activity.coverUrl = resolveActivityCoverUrl({
      id: activity.id,
      coverUrl: dto.coverUrl !== undefined ? dto.coverUrl : activity.coverUrl,
      title: activity.title,
      tags: activity.tags,
      categorySlug: category?.slug ?? null,
    });

    await this.activityRepo.save(activity);
    await this.refreshActivityStatus(activity);

    return this.findById(id);
  }

  async cancel(id: string, userId: string) {
    const activity = await this.getOwnedActivity(id, userId);
    activity.status = 'cancelled';
    await this.activityRepo.save(activity);
    return this.findById(id);
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

    const { previousStatus, activity: updated } = await this.refreshActivityStatus(activity);

    if (status === 'joined' && !wasJoined) {
      const joiner = await this.userRepo.findOne({ where: { id: userId } });
      const joinerName = this.firstName(joiner?.fullName ?? 'Someone');

      if (updated.creatorId !== userId) {
        await this.notificationsService.notifyEvent({
          userId: updated.creatorId,
          type: NOTIFICATION_TYPES.ACTIVITY_NEW_JOINER,
          activityId: updated.id,
          metadata: { joinerId: userId },
          dedupeKey: `new_joiner:${updated.id}:${userId}`,
          copyVars: {
            activityTitle: updated.title,
            actorName: joinerName,
            locationName: updated.locationName,
            city: updated.city,
          },
        });
      }

      await this.notificationsService.notifyEvent({
        userId,
        type: NOTIFICATION_TYPES.RSVP_CONFIRMED,
        activityId: updated.id,
        dedupeKey: `rsvp:${updated.id}:${userId}`,
        copyVars: {
          activityTitle: updated.title,
          locationName: updated.locationName,
          city: updated.city,
        },
      });
    }

    await this.notifyStatusChange(updated, previousStatus, userId);

    return this.findById(activityId);
  }

  async findForUser(userId: string, role: 'joined' | 'created' | 'completed') {
    if (role === 'created') {
      const items = await this.activityRepo.find({
        where: { creatorId: userId },
        relations: { category: true, creator: true },
        order: { startDatetime: 'DESC' },
      });
      return this.attachParticipants(items.map(a => this.mapActivity(a)));
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

    return this.attachParticipants(activities.map(a => this.mapActivity(a)));
  }
}
