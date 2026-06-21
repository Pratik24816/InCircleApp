import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDevice } from './entities/user-device.entity';
import { NOTIFICATION_TYPES, type NotificationType } from './notification.types';

type PushPayload = {
  title: string;
  body: string;
  type: string;
  notificationId?: string;
  activityId?: string | null;
  chatId?: string | null;
};

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private firebaseApp: import('firebase-admin').app.App | null = null;

  constructor(
    @InjectRepository(UserDevice)
    private readonly deviceRepo: Repository<UserDevice>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.initFirebase();
  }

  private async initFirebase(): Promise<void> {
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (!json && !path) {
      this.logger.warn(
        'Push disabled: set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH for lock-screen push.',
      );
      return;
    }

    try {
      const admin = await import('firebase-admin');
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.apps[0]!;
        return;
      }

      const credential = json
        ? admin.credential.cert(JSON.parse(json) as Record<string, string>)
        : admin.credential.cert(path!);

      this.firebaseApp = admin.initializeApp({ credential });
      this.logger.log('Firebase Admin initialized — external push enabled.');
    } catch (error) {
      this.logger.warn(`Firebase init failed: ${error instanceof Error ? error.message : error}`);
      this.firebaseApp = null;
    }
  }

  isEnabled(): boolean {
    return this.firebaseApp != null;
  }

  shouldPushForType(type: string, prefs: {
    pushEnabled: boolean;
    pushActivity: boolean;
    pushChat: boolean;
  }): boolean {
    if (!prefs.pushEnabled) {
      return false;
    }
    if (type === NOTIFICATION_TYPES.REPORT_RECEIVED) {
      return false;
    }
    if (type.includes('chat')) {
      return prefs.pushChat;
    }
    return prefs.pushActivity;
  }

  async sendToUser(
    userId: string,
    payload: PushPayload,
    prefs: { pushEnabled: boolean; pushActivity: boolean; pushChat: boolean },
  ): Promise<{ sent: number; skipped: boolean }> {
    if (!this.shouldPushForType(payload.type, prefs)) {
      return { sent: 0, skipped: true };
    }

    const devices = await this.deviceRepo.find({ where: { userId } });
    if (!devices.length) {
      this.logger.debug(`No devices for user ${userId} — in-app only.`);
      return { sent: 0, skipped: false };
    }

    if (!this.firebaseApp) {
      this.logger.debug(
        `[Push preview] → ${devices.length} device(s): "${payload.title}" / "${payload.body}"`,
      );
      return { sent: 0, skipped: false };
    }

    const admin = await import('firebase-admin');
    let sent = 0;

    await Promise.all(
      devices.map(async device => {
        try {
          await admin.messaging().send({
            token: device.pushToken,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data: {
              type: payload.type,
              notificationId: payload.notificationId ?? '',
              activityId: payload.activityId ?? '',
              chatId: payload.chatId ?? '',
              title: payload.title,
              body: payload.body,
            },
            android: {
              priority: 'high',
              notification: {
                channelId: 'incircle_plans',
                icon: 'ic_notification',
                color: '#8CFF4F',
              },
            },
          });
          sent += 1;
        } catch (error) {
          this.logger.warn(`FCM failed for ${device.id}: ${error instanceof Error ? error.message : error}`);
        }
      }),
    );

    return { sent, skipped: false };
  }
}
