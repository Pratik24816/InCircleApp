import { MigrationInterface, QueryRunner } from 'typeorm';

const TONIGHT_IDS = {
  football: 'dddddddd-dddd-4ddd-8ddd-dddddddddd01',
  openMic: 'dddddddd-dddd-4ddd-8ddd-dddddddddd02',
  coffee: 'dddddddd-dddd-4ddd-8ddd-dddddddddd03',
  boardGames: 'dddddddd-dddd-4ddd-8ddd-dddddddddd04',
} as const;

export class SeedTonightActivities1718364300000 implements MigrationInterface {
  name = 'SeedTonightActivities1718364300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const priya = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
    const dev = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
    const you = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

    await queryRunner.query(`
      INSERT INTO "activities" (
        "id", "creatorId", "categoryId", "title", "description",
        "startDatetime", "locationName", "city", "latitude", "longitude",
        "groupType", "groupSize", "joinedCount", "status", "approvalStatus",
        "featured", "tags", "vibeTags"
      )
      SELECT
        '${TONIGHT_IDS.football}',
        '${dev}',
        c.id,
        'Football Pickup',
        'Casual 5-a-side at the turf. All skill levels welcome.',
        (CURRENT_DATE + TIME '18:00:00'),
        'Arena Turf, Satellite',
        'Ahmedabad',
        23.0225,
        72.5714,
        'open_join',
        10,
        6,
        'open',
        'approved',
        false,
        'football,sports,tonight',
        'high_energy,Tonight pick-up,New players welcome'
      FROM "categories" c WHERE c.slug = 'sports'
      ON CONFLICT ("id") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "activities" (
        "id", "creatorId", "categoryId", "title", "description",
        "startDatetime", "locationName", "city", "latitude", "longitude",
        "groupType", "groupSize", "joinedCount", "status", "approvalStatus",
        "featured", "tags", "vibeTags"
      )
      SELECT
        '${TONIGHT_IDS.openMic}',
        '${priya}',
        c.id,
        'Open Mic Night',
        'Sing, poetry, or just vibe. Sign-up at the door.',
        (CURRENT_DATE + TIME '20:00:00'),
        'Mocha Art House, Navrangpura',
        'Ahmedabad',
        23.0308,
        72.5577,
        'open_join',
        30,
        14,
        'open',
        'approved',
        false,
        'music,open-mic,tonight',
        'casual,Performers welcome,Chill crowd'
      FROM "categories" c WHERE c.slug = 'social'
      ON CONFLICT ("id") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "activities" (
        "id", "creatorId", "categoryId", "title", "description",
        "startDatetime", "locationName", "city", "latitude", "longitude",
        "groupType", "groupSize", "joinedCount", "status", "approvalStatus",
        "featured", "tags", "vibeTags"
      )
      SELECT
        '${TONIGHT_IDS.coffee}',
        '${you}',
        c.id,
        'Coffee Meetup',
        'Late-evening chai & convo for builders and creatives.',
        (CURRENT_DATE + TIME '19:00:00'),
        'Blue Tokai, Prahlad Nagar',
        'Ahmedabad',
        23.0120,
        72.5100,
        'open_join',
        8,
        4,
        'open',
        'approved',
        false,
        'coffee,meetup,tonight',
        'casual,new_friends,Founders welcome'
      FROM "categories" c WHERE c.slug = 'social'
      ON CONFLICT ("id") DO NOTHING
    `);

    await queryRunner.query(`
      INSERT INTO "activities" (
        "id", "creatorId", "categoryId", "title", "description",
        "startDatetime", "locationName", "city", "latitude", "longitude",
        "groupType", "groupSize", "joinedCount", "status", "approvalStatus",
        "featured", "tags", "vibeTags"
      )
      SELECT
        '${TONIGHT_IDS.boardGames}',
        '${dev}',
        c.id,
        'Board Games',
        'Catan, Codenames & chaos. Snacks on the table.',
        (CURRENT_DATE + TIME '21:00:00'),
        'Dice & Dine Cafe, SG Highway',
        'Ahmedabad',
        23.0500,
        72.5200,
        'open_join',
        12,
        8,
        'open',
        'approved',
        false,
        'boardgames,social,tonight',
        'chill,Beginners welcome,Casual rounds'
      FROM "categories" c WHERE c.slug = 'social'
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "activities" WHERE "id" IN ('${TONIGHT_IDS.football}', '${TONIGHT_IDS.openMic}', '${TONIGHT_IDS.coffee}', '${TONIGHT_IDS.boardGames}')`,
    );
  }
}
