export type Plan = {
  emoji: string;
  label: string;
  place: string;
};

export const PLANS: Plan[] = [
  { emoji: '🏏', label: 'Pickup cricket', place: 'CG Road' },
  { emoji: '☕', label: 'Chai run', place: 'Law Garden' },
  { emoji: '🌙', label: 'Riverfront walk', place: 'Sabarmati' },
  { emoji: '📚', label: 'Study session', place: 'Campus' },
  { emoji: '🎵', label: 'Rooftop night', place: 'Navrangpura' },
  { emoji: '⚽', label: 'Football kickabout', place: 'Satellite' },
  { emoji: '🍕', label: 'Late pizza', place: 'Vastrapur' },
  { emoji: '🏃', label: 'Sunset jog', place: 'Riverfront' },
];

export type GameId = 'spin-stop' | 'memory' | 'trace' | 'dodge';

export type GameMeta = {
  id: GameId;
  title: string;
  emoji: string;
  tagline: string;
};

export const GAMES: GameMeta[] = [
  { id: 'spin-stop', title: 'Spin & Stop', emoji: '🎡', tagline: 'Spin plans around the logo' },
  { id: 'memory', title: 'Memory Match', emoji: '🃏', tagline: 'Match logo to plans' },
  { id: 'trace', title: 'Trace the Logo', emoji: '✍️', tagline: 'Draw the radar ring' },
  { id: 'dodge', title: 'Logo Dodge', emoji: '🏃', tagline: 'Dodge feeds, catch plans' },
];
