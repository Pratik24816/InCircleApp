import { MigrationInterface, QueryRunner } from 'typeorm';
import { ACTIVITY_COVER_URLS } from '../activity-cover-urls';

export class FixActivityCoverUrls1718364500000 implements MigrationInterface {
  name = 'FixActivityCoverUrls1718364500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [id, url] of Object.entries(ACTIVITY_COVER_URLS)) {
      await queryRunner.query(`UPDATE "activities" SET "coverUrl" = $1 WHERE "id" = $2`, [url, id]);
    }

    // User-created pickleball and any activity missing a working cover
    await queryRunner.query(
      `
      UPDATE "activities"
      SET "coverUrl" = $1
      WHERE LOWER("title") LIKE '%pickleball%'
         OR LOWER("title") LIKE '%pickell%'
         OR LOWER("tags") LIKE '%pickleball%'
    `,
      [
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=900&h=400&q=80',
      ],
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op — previous URLs were broken
  }
}
