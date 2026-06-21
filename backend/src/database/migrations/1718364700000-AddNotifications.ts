import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotifications1718364700000 implements MigrationInterface {
  name = 'AddNotifications1718364700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "type" character varying NOT NULL,
        "title" character varying NOT NULL,
        "body" text NOT NULL,
        "read" boolean NOT NULL DEFAULT false,
        "activityId" uuid,
        "chatId" uuid,
        "metadata" jsonb,
        "dedupeKey" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notifications_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_notifications_activity" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_notifications_user_dedupe"
      ON "notifications" ("userId", "dedupeKey")
      WHERE "dedupeKey" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_user_created"
      ON "notifications" ("userId", "createdAt" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_devices" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "platform" character varying NOT NULL,
        "pushToken" text NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_devices" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_device_token" UNIQUE ("pushToken"),
        CONSTRAINT "FK_user_devices_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_notification_preferences" (
        "userId" uuid NOT NULL,
        "pushActivity" boolean NOT NULL DEFAULT true,
        "pushChat" boolean NOT NULL DEFAULT true,
        "pushReminders" boolean NOT NULL DEFAULT true,
        "pushDiscovery" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_notification_preferences" PRIMARY KEY ("userId"),
        CONSTRAINT "FK_notification_prefs_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_notification_preferences"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_devices"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_notifications_user_created"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_notifications_user_dedupe"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notifications"`);
  }
}
