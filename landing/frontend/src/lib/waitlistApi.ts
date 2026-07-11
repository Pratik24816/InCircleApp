const API_BASE = import.meta.env.VITE_API_URL ?? '/api';
const FALLBACK_KEY = 'hopiin-waitlist-offline-v1';

export type WaitlistResult = {
  ok: boolean;
  email: string;
  alreadyRegistered?: boolean;
  fromApi: boolean;
};

function loadOffline(): string[] {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function saveOffline(emails: string[]) {
  localStorage.setItem(FALLBACK_KEY, JSON.stringify(emails));
}

export async function joinWaitlist(email: string): Promise<WaitlistResult> {
  const normalized = email.trim().toLowerCase();

  try {
    const res = await fetch(`${API_BASE}/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: normalized }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      email?: string;
      alreadyRegistered?: boolean;
      message?: string;
    };

    if (!res.ok) {
      throw new Error(typeof data.message === 'string' ? data.message : `HTTP ${res.status}`);
    }

    return {
      ok: true,
      email: data.email ?? normalized,
      alreadyRegistered: data.alreadyRegistered,
      fromApi: true,
    };
  } catch {
    const offline = loadOffline();
    const alreadyRegistered = offline.includes(normalized);
    if (!alreadyRegistered) {
      saveOffline([...offline, normalized]);
    }
    return { ok: true, email: normalized, alreadyRegistered, fromApi: false };
  }
}
