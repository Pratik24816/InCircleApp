import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddActivityVibeTags1718364200000 implements MigrationInterface {
  name = 'AddActivityVibeTags1718364200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "vibeTags" text NOT NULL DEFAULT ''`,
    );

    await queryRunner.query(`
      UPDATE "activities" SET "vibeTags" = 'trending,chill,Coffee after walk,New people welcome'
      WHERE "id" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "vibeTags" = 'high_energy,Competitive but friendly,Almost full'
      WHERE "id" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "vibeTags" = 'casual,new_friends,Founders welcome'
      WHERE "id" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "vibeTags" = 'high_energy,Breakfast stop included,Outdoor loop'
      WHERE "id" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4'
    `);
    await queryRunner.query(`
      UPDATE "activities" SET "vibeTags" = 'chill,Quiet focus zone,Phones on silent'
      WHERE "id" = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "vibeTags"`);
  }
}
