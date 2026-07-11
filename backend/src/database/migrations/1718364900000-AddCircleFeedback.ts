import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCircleFeedback1718364900000 implements MigrationInterface {
  name = 'AddCircleFeedback1718364900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "circle_feedback" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "avatarId" character varying(32) NOT NULL,
        "name" character varying(64) NOT NULL,
        "message" text NOT NULL,
        "category" character varying(32) NOT NULL,
        "fireCount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_circle_feedback" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_circle_feedback_createdAt"
      ON "circle_feedback" ("createdAt" DESC)
    `);

    await queryRunner.query(`
      INSERT INTO "circle_feedback" ("avatarId", "name", "message", "category", "fireCount", "createdAt")
      SELECT * FROM (VALUES
        ('believer', 'Priya', 'Finally an app for spontaneous plans instead of endless group chats!', 'concept', 3, NOW() - INTERVAL '3 days'),
        ('hyped', 'Arjun', 'Hop In button is genius. One tap and you''re in. No friction.', 'hype', 5, NOW() - INTERVAL '2 days'),
        ('inspired', 'Dev', 'Need cricket pickup games filter ASAP. Ahmedabad needs this.', 'feature', 2, NOW() - INTERVAL '2 days'),
        ('happy', 'Meera', 'Late-night chai runs deserve their own vibe tag. Just saying.', 'suggestion', 1, NOW() - INTERVAL '1 day'),
        ('ready', 'Karan', 'The create flow looks smooth. Can''t wait to host my first rooftop plan.', 'hype', 4, NOW() - INTERVAL '1 day'),
        ('amazed', 'Anya', 'Cheesy notifications are actually fun? Didn''t expect that.', 'feedback', 2, NOW() - INTERVAL '12 hours'),
        ('intrigued', 'Rohan', 'CG Road to riverfront — hyperlocal discovery is the move.', 'concept', 1, NOW() - INTERVAL '12 hours'),
        ('impressed', 'Sara', 'This landing page alone makes me want to download on day one.', 'hype', 6, NOW() - INTERVAL '6 hours')
      ) AS seed("avatarId", "name", "message", "category", "fireCount", "createdAt")
      WHERE NOT EXISTS (SELECT 1 FROM "circle_feedback" LIMIT 1)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "circle_feedback"`);
  }
}
