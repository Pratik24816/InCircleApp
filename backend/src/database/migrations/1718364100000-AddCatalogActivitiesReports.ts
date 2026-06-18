import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCatalogActivitiesReports1718364100000 implements MigrationInterface {
  name = 'AddCatalogActivitiesReports1718364100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "city" character varying NOT NULL DEFAULT 'Ahmedabad'`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "interests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        CONSTRAINT "PK_interests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_interests_name" UNIQUE ("name"),
        CONSTRAINT "UQ_interests_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "icon" character varying NOT NULL DEFAULT '✨',
        "color" character varying NOT NULL DEFAULT '#8CFF4F',
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_interests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "interestId" uuid NOT NULL,
        CONSTRAINT "PK_user_interests" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_interest" UNIQUE ("userId", "interestId"),
        CONSTRAINT "FK_user_interests_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_interests_interest" FOREIGN KEY ("interestId") REFERENCES "interests"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "creatorId" uuid NOT NULL,
        "categoryId" uuid NOT NULL,
        "title" character varying NOT NULL,
        "description" text NOT NULL,
        "coverUrl" text,
        "startDatetime" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endDatetime" TIMESTAMP WITH TIME ZONE,
        "locationName" character varying NOT NULL,
        "city" character varying NOT NULL DEFAULT 'Ahmedabad',
        "latitude" double precision NOT NULL DEFAULT 0,
        "longitude" double precision NOT NULL DEFAULT 0,
        "groupType" character varying NOT NULL DEFAULT 'open_join',
        "groupSize" integer,
        "joinedCount" integer NOT NULL DEFAULT 0,
        "status" character varying NOT NULL DEFAULT 'open',
        "approvalStatus" character varying NOT NULL DEFAULT 'approved',
        "featured" boolean NOT NULL DEFAULT false,
        "tags" text NOT NULL DEFAULT '',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activities" PRIMARY KEY ("id"),
        CONSTRAINT "FK_activities_creator" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_activities_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activity_participants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "activityId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "status" character varying NOT NULL DEFAULT 'joined',
        "joinedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_participants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_activity_participant" UNIQUE ("activityId", "userId"),
        CONSTRAINT "FK_participants_activity" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_participants_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "reporterId" uuid NOT NULL,
        "reportType" character varying NOT NULL,
        "reason" character varying NOT NULL,
        "description" text,
        "status" character varying NOT NULL DEFAULT 'pending',
        "activityId" uuid,
        "reportedUserId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_reports" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reports_reporter" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_reports_activity" FOREIGN KEY ("activityId") REFERENCES "activities"("id") ON DELETE SET NULL
      )
    `);

    // Seed interests
    await queryRunner.query(`
      INSERT INTO "interests" ("name", "slug") VALUES
        ('Walking', 'walking'), ('Cricket', 'cricket'), ('Coffee', 'coffee'), ('Chai', 'chai'),
        ('Study', 'study'), ('Sightseeing', 'sightseeing'), ('Pickleball', 'pickleball'), ('Cycling', 'cycling'),
        ('Gym', 'gym'), ('Books', 'books'), ('Music', 'music'), ('Nature', 'nature'),
        ('Football', 'football'), ('Photography', 'photography'), ('Coding', 'coding')
      ON CONFLICT DO NOTHING
    `);

    // Seed categories
    await queryRunner.query(`
      INSERT INTO "categories" ("name", "slug", "icon", "color") VALUES
        ('Fitness', 'fitness', '🏃', '#8CFF4F'),
        ('Sports', 'sports', '🏏', '#4DB5FF'),
        ('Social', 'social', '☕', '#FFB020'),
        ('Culture', 'culture', '🎭', '#A78BFA'),
        ('Outdoor', 'outdoor', '🌿', '#22C55E')
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "reports"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_participants"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activities"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_interests"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "interests"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "city"`);
  }
}
