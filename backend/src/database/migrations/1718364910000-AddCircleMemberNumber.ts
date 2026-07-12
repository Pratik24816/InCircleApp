import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCircleMemberNumber1718364910000 implements MigrationInterface {
  name = 'AddCircleMemberNumber1718364910000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "circle_feedback"
      ADD COLUMN IF NOT EXISTS "memberNumber" SERIAL NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "circle_feedback" DROP COLUMN IF EXISTS "memberNumber"
    `);
  }
}
