// ============================================
// SwimDesk Coach - Constants
// ============================================

export const SD_ROUTES = {
  HOME: '/',
  LOGIN: '/prihlasenie',
  REGISTER: '/registracia',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  WORKOUTS: '/treningy',
  GROUPS: '/skupiny',
  GROUP_DETAIL: '/skupiny/:id',
  SWIMMERS: '/plavci',
  SWIMMER_DETAIL: '/plavci/:id',
  LIMITS: '/limity',
  SETTINGS: '/nastavenia',
} as const;

export const CATEGORY_LABELS: Record<string, string> = {
  benjamini: 'Benjamíni',
  mladsizaci: 'Mladší žiaci',
  starsiziaci: 'Starší žiaci',
  dorast: 'Dorast',
  juniori: 'Juniori',
};

export const STROKE_LABELS: Record<string, string> = {
  volny: 'Voľný štýl',
  znak: 'Znak',
  prsia: 'Prsia',
  motylik: 'Motýlik',
  polohovy: 'Polohový',
};

export const WORKOUT_TYPE_LABELS: Record<string, string> = {
  vytrvalost: 'Vytrvalosť',
  rychlost: 'Rýchlosť',
  technika: 'Technika',
  zavod: 'Závod',
  zmiesany: 'Zmiešaný',
};

export const PHASE_LABELS: Record<string, string> = {
  rozcvicka: 'Rozcvička',
  hlavna: 'Hlavná časť',
  upokojenie: 'Upokojenie',
};

export const INTENSITY_LABELS: Record<string, string> = {
  nizka: 'Nízka',
  stredna: 'Stredná',
  vysoka: 'Vysoká',
};

export const GENDER_LABELS: Record<string, string> = {
  M: 'Chlapec',
  F: 'Dievča',
};

export const COMPETITION_LABELS: Record<string, string> = {
  MSR_ziaci: 'MSR žiaci',
  MSR_dorast: 'MSR dorast',
  MCR_SR: 'MČR / SR',
  zimne_MSR: 'Zimné MSR',
};

// Format seconds to MM:SS.ss
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return secs.toFixed(2) + 's';
  }
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
}

// Parse MM:SS.ss or SS.ss to seconds
export function parseTime(input: string): number | null {
  const trimmed = input.trim().replace('s', '');
  if (trimmed.includes(':')) {
    const [mins, secs] = trimmed.split(':');
    const m = parseInt(mins, 10);
    const s = parseFloat(secs);
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }
  const s = parseFloat(trimmed);
  return isNaN(s) ? null : s;
}
