import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACTIVITY_COVER_URLS } from '../activity-cover-urls';

export class AddActivityCoverUrls1718364400000 implements MigrationInterface {
  name = 'AddActivityCoverUrls1718364400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [id, url] of Object.entries(ACTIVITY_COVER_URLS)) {
      await queryRunner.query(`UPDATE "activities" SET "coverUrl" = $1 WHERE "id" = $2`, [url, id]);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ids = Object.keys(ACTIVITY_COVER_URLS);
    await queryRunner.query(
      `UPDATE "activities" SET "coverUrl" = NULL WHERE "id" = ANY($1::uuid[])`,
      [ids],
    );
  }
}
