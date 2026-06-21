import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  ACTIVITY_COVER_URLS,
  CATEGORY_COVER_URLS,
  DEFAULT_COVER_URL,
  resolveActivityCoverUrl,
} from '../activity-cover-urls';

export class EnsureAllActivityCovers1718364600000 implements MigrationInterface {
  name = 'EnsureAllActivityCovers1718364600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const [id, url] of Object.entries(ACTIVITY_COVER_URLS)) {
      await queryRunner.query(`UPDATE "activities" SET "coverUrl" = $1 WHERE "id" = $2`, [url, id]);
    }

    const rows: { id: string; title: string; tags: string; slug: string | null; coverUrl: string | null }[] =
      await queryRunner.query(`
        SELECT a.id, a.title, a.tags, c.slug, a."coverUrl"
        FROM "activities" a
        LEFT JOIN "categories" c ON c.id = a."categoryId"
      `);

    for (const row of rows) {
      const tags = row.tags ? row.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      const url = resolveActivityCoverUrl({
        id: row.id,
        coverUrl: row.coverUrl,
        title: row.title,
        tags,
        categorySlug: row.slug,
      });
      await queryRunner.query(`UPDATE "activities" SET "coverUrl" = $1 WHERE "id" = $2`, [url, row.id]);
    }

    await queryRunner.query(
      `
      UPDATE "activities" a
      SET "coverUrl" = CASE c.slug
        WHEN 'fitness' THEN $1
        WHEN 'sports' THEN $2
        WHEN 'outdoor' THEN $3
        WHEN 'social' THEN $4
        ELSE $5
      END
      FROM "categories" c
      WHERE c.id = a."categoryId"
        AND (a."coverUrl" IS NULL OR a."coverUrl" = '' OR a."coverUrl" NOT LIKE 'https://images.pexels.com/%')
    `,
      [
        CATEGORY_COVER_URLS.fitness,
        CATEGORY_COVER_URLS.sports,
        CATEGORY_COVER_URLS.outdoor,
        CATEGORY_COVER_URLS.social,
        DEFAULT_COVER_URL,
      ],
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // no-op
  }
}
