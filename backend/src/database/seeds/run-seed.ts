import { AppDataSource } from '../data-source';
import { User } from '../../users/entities/user.entity';
import { Interest } from '../../catalog/entities/interest.entity';
import { Category } from '../../catalog/entities/category.entity';
import { UserInterest } from '../../catalog/entities/user-interest.entity';
import { Activity } from '../../activities/entities/activity.entity';
import { ActivityParticipant } from '../../activities/entities/activity-participant.entity';
import { Report } from '../../reports/entities/report.entity';
import { coverUrlForActivityId } from '../activity-cover-urls';

/** Fixed UUIDs so seed is idempotent and dev-login emails are stable */
const IDS = {
  users: {
    you: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    priya: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    dev: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    newbie: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa4',
  },
  activities: {
    walk: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
    cricket: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    chai: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3',
    cycling: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4',
    study: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5',
  },
  report: 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1',
} as const;

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const interestRepo = AppDataSource.getRepository(Interest);
  const categoryRepo = AppDataSource.getRepository(Category);
  const userInterestRepo = AppDataSource.getRepository(UserInterest);
  const activityRepo = AppDataSource.getRepository(Activity);
  const participantRepo = AppDataSource.getRepository(ActivityParticipant);
  const reportRepo = AppDataSource.getRepository(Report);

  const existing = await userRepo.findOne({ where: { email: 'you@incircle.app' } });
  if (existing) {
    console.log('Seed data already present (you@incircle.app exists). Skipping.');
    await AppDataSource.destroy();
    return;
  }

  const interests = await interestRepo.find();
  const categories = await categoryRepo.find();
  const bySlug = <T extends { slug: string }>(list: T[], slug: string) => {
    const item = list.find(x => x.slug === slug);
    if (!item) {
      throw new Error(`Missing catalog slug: ${slug}. Run migrations first.`);
    }
    return item;
  };

  const walking = bySlug(interests, 'walking');
  const coffee = bySlug(interests, 'coffee');
  const cycling = bySlug(interests, 'cycling');
  const cricket = bySlug(interests, 'cricket');
  const chai = bySlug(interests, 'chai');

  const fitness = bySlug(categories, 'fitness');
  const sports = bySlug(categories, 'sports');
  const social = bySlug(categories, 'social');
  const outdoor = bySlug(categories, 'outdoor');

  const users = await userRepo.save([
    userRepo.create({
      id: IDS.users.you,
      email: 'you@incircle.app',
      username: 'you_ahm',
      fullName: 'You (Demo)',
      bio: 'Building habits & meeting people IRL.',
      city: 'Ahmedabad',
      googleId: 'seed-google-you',
      googlePhotoUrl: null,
      isProfileCompleted: true,
    }),
    userRepo.create({
      id: IDS.users.priya,
      email: 'priya@incircle.app',
      username: 'priya_walks',
      fullName: 'Priya Shah',
      bio: 'Riverfront regular.',
      city: 'Ahmedabad',
      googleId: 'seed-google-priya',
      isProfileCompleted: true,
    }),
    userRepo.create({
      id: IDS.users.dev,
      email: 'dev@incircle.app',
      username: 'dev_cricket',
      fullName: 'Dev Patel',
      bio: 'Weekend sports host.',
      city: 'Ahmedabad',
      googleId: 'seed-google-dev',
      isProfileCompleted: true,
    }),
    userRepo.create({
      id: IDS.users.newbie,
      email: 'new@incircle.app',
      username: null,
      fullName: 'New User',
      bio: null,
      city: 'Ahmedabad',
      googleId: 'seed-google-new',
      isProfileCompleted: false,
    }),
  ]);

  const you = users[0];
  const priya = users[1];
  const dev = users[2];

  await userInterestRepo.save([
    { userId: you.id, interestId: walking.id },
    { userId: you.id, interestId: coffee.id },
    { userId: you.id, interestId: cycling.id },
    { userId: priya.id, interestId: walking.id },
    { userId: priya.id, interestId: chai.id },
    { userId: dev.id, interestId: cricket.id },
  ]);

  const start = (daysFromNow: number, hour: number, minute = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const activities = await activityRepo.save([
    activityRepo.create({
      id: IDS.activities.walk,
      creatorId: priya.id,
      categoryId: fitness.id,
      title: 'Morning Riverfront Walk',
      description: 'Easy 5 km walk along Sabarmati. All paces welcome.',
      startDatetime: start(1, 6, 30),
      locationName: 'Sabarmati Riverfront Gate 3',
      city: 'Ahmedabad',
      latitude: 23.0395,
      longitude: 72.5853,
      groupType: 'open_join',
      groupSize: 12,
      joinedCount: 3,
      status: 'open',
      approvalStatus: 'approved',
      featured: true,
      tags: ['walk', 'morning', 'fitness'],
      vibeTags: ['trending', 'chill', 'Coffee after walk', 'New people welcome'],
      coverUrl: coverUrlForActivityId(IDS.activities.walk),
    }),
    activityRepo.create({
      id: IDS.activities.cricket,
      creatorId: dev.id,
      categoryId: sports.id,
      title: 'Weekend Cricket Match',
      description: 'Need 2 more players for a friendly 8-over match.',
      startDatetime: start(3, 8, 0),
      locationName: 'GVG Ground',
      city: 'Ahmedabad',
      latitude: 23.0225,
      longitude: 72.5714,
      groupType: 'need_one_person',
      groupSize: 14,
      joinedCount: 12,
      status: 'almost_full',
      approvalStatus: 'approved',
      featured: false,
      tags: ['cricket', 'sports'],
      vibeTags: ['high_energy', 'Competitive but friendly', 'Almost full'],
      coverUrl: coverUrlForActivityId(IDS.activities.cricket),
    }),
    activityRepo.create({
      id: IDS.activities.chai,
      creatorId: you.id,
      categoryId: social.id,
      title: 'Chai & Networking',
      description: 'Casual chai meetup for founders and builders.',
      startDatetime: start(2, 17, 0),
      locationName: 'Mani\'s Tea Stall, CG Road',
      city: 'Ahmedabad',
      latitude: 23.0308,
      longitude: 72.5577,
      groupType: 'open_join',
      groupSize: 8,
      joinedCount: 2,
      status: 'open',
      approvalStatus: 'approved',
      featured: false,
      tags: ['chai', 'networking'],
      vibeTags: ['casual', 'new_friends', 'Founders welcome'],
      coverUrl: coverUrlForActivityId(IDS.activities.chai),
    }),
    activityRepo.create({
      id: IDS.activities.cycling,
      creatorId: priya.id,
      categoryId: outdoor.id,
      title: 'Sunday Cycling Loop',
      description: '25 km loop with a breakfast stop halfway.',
      startDatetime: start(5, 6, 0),
      locationName: 'Science City Circle',
      city: 'Ahmedabad',
      latitude: 23.0802,
      longitude: 72.4934,
      groupType: 'fixed_group',
      groupSize: 10,
      joinedCount: 6,
      status: 'open',
      approvalStatus: 'approved',
      featured: false,
      tags: ['cycling', 'outdoor'],
      vibeTags: ['high_energy', 'Breakfast stop included', 'Outdoor loop'],
      coverUrl: coverUrlForActivityId(IDS.activities.cycling),
    }),
    activityRepo.create({
      id: IDS.activities.study,
      creatorId: dev.id,
      categoryId: social.id,
      title: 'Library Study Session',
      description: 'Focused 2-hour study block. Phones on silent.',
      startDatetime: start(1, 19, 0),
      locationName: 'City Central Library',
      city: 'Ahmedabad',
      latitude: 23.0258,
      longitude: 72.5873,
      groupType: 'open_join',
      groupSize: 6,
      joinedCount: 4,
      status: 'open',
      approvalStatus: 'approved',
      featured: false,
      tags: ['study', 'focus'],
      vibeTags: ['chill', 'Quiet focus zone', 'Phones on silent'],
      coverUrl: coverUrlForActivityId(IDS.activities.study),
    }),
  ]);

  const [walk, cricketAct, chaiAct, cyclingAct, study] = activities;

  await participantRepo.save([
    { activityId: walk.id, userId: priya.id, status: 'joined' },
    { activityId: walk.id, userId: you.id, status: 'joined' },
    { activityId: walk.id, userId: dev.id, status: 'maybe' },
    { activityId: cricketAct.id, userId: dev.id, status: 'joined' },
    { activityId: cricketAct.id, userId: you.id, status: 'joined' },
    { activityId: chaiAct.id, userId: you.id, status: 'joined' },
    { activityId: chaiAct.id, userId: priya.id, status: 'joined' },
    { activityId: cyclingAct.id, userId: priya.id, status: 'joined' },
    { activityId: cyclingAct.id, userId: you.id, status: 'joined' },
    { activityId: study.id, userId: dev.id, status: 'joined' },
    { activityId: study.id, userId: you.id, status: 'maybe' },
  ]);

  await reportRepo.save(
    reportRepo.create({
      id: IDS.report,
      reporterId: you.id,
      reportType: 'activity',
      reason: 'spam',
      description: 'Demo report for testing moderation flow.',
      activityId: cricketAct.id,
      reportedUserId: null,
      status: 'pending',
    }),
  );

  console.log('Seed complete.');
  console.log('');
  console.log('Demo users (use Dev Login on mobile or POST /auth/dev):');
  console.log('  you@incircle.app   — full profile + interests (main demo)');
  console.log('  priya@incircle.app — host of featured walk');
  console.log('  dev@incircle.app   — cricket & study host');
  console.log('  new@incircle.app   — incomplete profile (onboarding flow)');
  console.log('');
  console.log(`Activities seeded: ${activities.length} (1 featured)`);

  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
