import type { CircleAvatarId, FeedbackCategoryId } from '../constants/circleAvatars';
import type { CircleMember } from './circleStorage';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const REACTED_KEY = 'hopiin-circle-reacted';
const FALLBACK_KEY = 'hopiin-circle-offline-v1';

type ApiMember = {
  id: string;
  avatarId: string;
  name: string;
  message: string;
  category: string;
  fireCount: number;
  memberNumber?: number;
  createdAt: string;
};

function mapMember(row: ApiMember): CircleMember {
  return {
    id: row.id,
    avatarId: row.avatarId as CircleAvatarId,
    name: row.name,
    message: row.message,
    category: row.category as FeedbackCategoryId,
    fireCount: row.fireCount ?? 0,
    memberNumber: row.memberNumber,
    createdAt: new Date(row.createdAt).getTime(),
  };
}

function loadOffline(): CircleMember[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CircleMember[];
  } catch {
    return [];
  }
}

function saveOffline(members: CircleMember[]) {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(members));
}

export function getReactedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(REACTED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function markReacted(id: string) {
  const set = getReactedIds();
  set.add(id);
  localStorage.setItem(REACTED_KEY, JSON.stringify([...set]));
}

export async function fetchCircleMembers(): Promise<{
  members: CircleMember[];
  fromApi: boolean;
}> {
  try {
    const res = await fetch(`${API_BASE}/circle-feedback?limit=100`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiMember[];
    const members = data.map(mapMember);
    return { members, fromApi: true };
  } catch {
    return { members: loadOffline(), fromApi: false };
  }
}

export async function submitCircleMember(
  input: Omit<CircleMember, 'id' | 'createdAt' | 'fireCount'>,
): Promise<{ member: CircleMember; fromApi: boolean }> {
  const payload = {
    avatarId: input.avatarId,
    name: input.name,
    message: input.message,
    category: input.category,
  };

  try {
    const res = await fetch(`${API_BASE}/circle-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        typeof err.message === 'string' ? err.message : `HTTP ${res.status}`,
      );
    }
    const data = (await res.json()) as ApiMember;
    return { member: mapMember(data), fromApi: true };
  } catch {
    const offline = loadOffline();
    const member: CircleMember = {
      ...input,
      id: `offline-${Date.now()}`,
      fireCount: 0,
      memberNumber: offline.length + 1,
      createdAt: Date.now(),
    };
    saveOffline([member, ...offline]);
    return { member, fromApi: false };
  }
}

export async function reactToMember(id: string): Promise<CircleMember | null> {
  try {
    const res = await fetch(`${API_BASE}/circle-feedback/${id}/react`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as ApiMember;
    markReacted(id);
    return mapMember(data);
  } catch {
    markReacted(id);
    return null;
  }
}

export function getShareUrl(): string {
  if (typeof window === 'undefined') return 'https://hopiin.app/#circle';
  return `${window.location.origin}${window.location.pathname}#circle`;
}

export function buildShareText(
  member: CircleMember,
  feelingLabel: string,
  memberNumber: number,
): string {
  const num = `#${String(memberNumber).padStart(2, '0')}`;
  return `Hopiin Future User ${num} 🎫\n${member.name} · feeling ${feelingLabel}\n\n"${member.message}"\n\nJoin before launch → ${getShareUrl()}`;
}
