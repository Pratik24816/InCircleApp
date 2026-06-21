import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { UserDevice } from './entities/user-device.entity';
import { UserNotificationPreference } from './entities/user-notification-preference.entity';
import type { NotifyEventPayload, NotifyPayload } from './notification.types';
import { NOTIFICATION_TYPES } from './notification.types';
import { RegisterDeviceDto } from './dto/register-device.dto';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';
import {
  formatNotificationCopy,
  resolveToneForType,
  type NotificationTone,
} from './notification-copy';
import { PushService } from './push.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(UserDevice)
    private readonly deviceRepo: Repository<UserDevice>,
    @InjectRepository(UserNotificationPreference)
    private readonly prefsRepo: Repository<UserNotificationPreference>,
    private readonly pushService: PushService,
  ) {}

  async notifyEvent(payload: NotifyEventPayload): Promise<Notification | null> {
    const prefs = await this.ensurePreferences(payload.userId);
    const preferredTone = (payload.toneOverride ??
      prefs.tone ??
      'cheesy') as NotificationTone;
    const tone = resolveToneForType(payload.type, preferredTone);
    const copy = formatNotificationCopy(payload.type, tone, payload.copyVars ?? {});

    const saved = await this.notify({
      userId: payload.userId,
      type: payload.type,
      title: copy.title,
      body: copy.body,
      activityId: payload.activityId,
      chatId: payload.chatId,
      dedupeKey: payload.dedupeKey,
      metadata: {
        ...payload.metadata,
        tone: copy.tone,
      },
    });

    if (saved) {
      await this.pushService.sendToUser(
        payload.userId,
        {
          title: copy.title,
          body: copy.body,
          type: payload.type,
          notificationId: saved.id,
          activityId: payload.activityId,
          chatId: payload.chatId,
        },
        prefs,
      );
    }

    return saved;
  }

  async notifyManyEvents(payloads: NotifyEventPayload[]): Promise<void> {
    await Promise.all(payloads.map(p => this.notifyEvent(p)));
  }

  async notify(payload: NotifyPayload): Promise<Notification | null> {
    if (payload.dedupeKey) {
      const existing = await this.notificationRepo.findOne({
        where: { userId: payload.userId, dedupeKey: payload.dedupeKey },
      });
      if (existing) {
        return existing;
      }
    }

    const row = this.notificationRepo.create({
      userId: payload.userId,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      activityId: payload.activityId ?? null,
      chatId: payload.chatId ?? null,
      metadata: payload.metadata ?? null,
      dedupeKey: payload.dedupeKey ?? null,
      read: false,
    });

    try {
      return await this.notificationRepo.save(row);
    } catch {
      if (payload.dedupeKey) {
        const existing = await this.notificationRepo.findOne({
          where: { userId: payload.userId, dedupeKey: payload.dedupeKey },
        });
        return existing;
      }
      throw new Error('Failed to save notification');
    }
  }

  async notifyMany(payloads: NotifyPayload[]): Promise<void> {
    await Promise.all(payloads.map(p => this.notify(p)));
  }

  async sendTestNotification(userId: string): Promise<Notification | null> {
    return this.notifyEvent({
      userId,
      type: NOTIFICATION_TYPES.TEST,
      dedupeKey: `test:${userId}:${Date.now()}`,
      copyVars: { city: 'Ahmedabad' },
    });
  }

  async getPreferences(userId: string): Promise<UserNotificationPreference> {
    return this.ensurePreferences(userId);
  }

  async updatePreferences(
    userId: string,
    dto: UpdateNotificationPreferencesDto,
  ): Promise<UserNotificationPreference> {
    const prefs = await this.ensurePreferences(userId);
    Object.assign(prefs, dto);
    return this.prefsRepo.save(prefs);
  }

  async listForUser(userId: string, limit = 50): Promise<Notification[]> {
    return this.notificationRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: Math.min(limit, 100),
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, notificationId: string): Promise<Notification> {
    const row = await this.notificationRepo.findOne({
      where: { id: notificationId, userId },
    });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (!row.read) {
      row.read = true;
      await this.notificationRepo.save(row);
    }
    return row;
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepo.update(
      { userId, read: false },
      { read: true },
    );
    return { updated: result.affected ?? 0 };
  }

  async registerDevice(userId: string, dto: RegisterDeviceDto): Promise<UserDevice> {
    const existing = await this.deviceRepo.findOne({ where: { pushToken: dto.pushToken } });
    if (existing) {
      existing.userId = userId;
      existing.platform = dto.platform;
      return this.deviceRepo.save(existing);
    }
    return this.deviceRepo.save(
      this.deviceRepo.create({
        userId,
        platform: dto.platform,
        pushToken: dto.pushToken,
      }),
    );
  }

  async removeDevice(userId: string, pushToken: string): Promise<void> {
    await this.deviceRepo.delete({ userId, pushToken });
  }

  async ensurePreferences(userId: string): Promise<UserNotificationPreference> {
    let prefs = await this.prefsRepo.findOne({ where: { userId } });
    if (!prefs) {
      prefs = await this.prefsRepo.save(
        this.prefsRepo.create({ userId, tone: 'cheesy', pushEnabled: true }),
      );
    }
    return prefs;
  }
}
