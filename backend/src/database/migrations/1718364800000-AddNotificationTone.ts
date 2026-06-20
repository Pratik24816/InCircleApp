import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationTone1718364800000 implements MigrationInterface {
  name = 'AddNotificationTone1718364800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_notification_preferences"
      ADD COLUMN IF NOT EXISTS "pushEnabled" boolean NOT NULL DEFAULT true
    `);
    await queryRunner.query(`
      ALTER TABLE "user_notification_preferences"
      ADD COLUMN IF NOT EXISTS "tone" character varying NOT NULL DEFAULT 'cheesy'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_notification_preferences" DROP COLUMN IF EXISTS "tone"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_notification_preferences" DROP COLUMN IF EXISTS "pushEnabled"
    `);
  }
}
