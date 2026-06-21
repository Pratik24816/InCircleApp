import type { Activity } from '../types/auth';

export type ActivityPerson = {
  id: string;
  fullName: string;
  profilePhoto?: string;
};

const FACE_EMOJIS = ['👩', '👨', '🧑', '👩‍🦱', '👨‍🦰', '👱‍♀️', '🧔', '👱'];

const FALLBACK_NAMES = ['Aarav', 'Neha', 'Dhruv', 'Kavya', 'Rohan', 'Anaya', 'Isha', 'Vikram'];

export function getFaceEmoji(name: string): string {
  const key = name.trim() || '?';
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i)) % FACE_EMOJIS.length;
  }
  return FACE_EMOJIS[hash];
}

export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] || fullName;
}

export function getActivityPeople(activity: Activity): ActivityPerson[] {
  if (activity.participants?.length) {
    return activity.participants;
  }

  const people: ActivityPerson[] = [];
  if (activity.creator) {
    people.push({
      id: activity.creator.id,
      fullName: activity.creator.fullName,
      profilePhoto: activity.creator.profilePhoto,
    });
  }

  let i = 0;
  while (people.length < Math.min(activity.joinedCount, 4) && i < FALLBACK_NAMES.length) {
    const seed = (activity.id.charCodeAt(0) + i) % FALLBACK_NAMES.length;
    const fullName = FALLBACK_NAMES[seed];
    if (!people.some(p => getFirstName(p.fullName) === fullName)) {
      people.push({ id: `${activity.id}-demo-${i}`, fullName, profilePhoto: '' });
    }
    i += 1;
  }

  return people;
}
