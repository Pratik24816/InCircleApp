let localKey: string | undefined;
try {
  localKey = require('./places.config.local').GOOGLE_PLACES_API_KEY as string;
} catch {
  localKey = undefined;
}

/** Set GOOGLE_PLACES_API_KEY in places.config.local.ts (see places.config.local.example.ts). */
export const GOOGLE_PLACES_API_KEY = localKey ?? 'REPLACE_WITH_GOOGLE_PLACES_API_KEY';

export const isPlacesConfigured = (): boolean =>
  GOOGLE_PLACES_API_KEY.length > 10 && !GOOGLE_PLACES_API_KEY.startsWith('REPLACE_WITH');
