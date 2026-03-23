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
  senior: 'Seniori',
};

export const CATEGORY_SHORT_LABELS: Record<string, string> = {
  benjamini: 'U10',
  mladsizaci: 'U12',
  starsiziaci: 'U14',
  dorast: 'U16',
  juniori: 'U18',
  senior: '19+',
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

// Default discipline columns for the limits matrix
export const DEFAULT_LIMIT_DISCIPLINES = [
  '50VS25', '100VS25', '200VS25',
  '50ZN25', '100ZN25',
  '50PR25', '100PR25',
  '50MO25', '100MO25',
  '200PO25',
];

// Bulk import code mapping
export const IMPORT_CODE_MAP: Record<string, string> = {
  '50vs25': '50VS25',
  '100vs25': '100VS25',
  '200vs25': '200VS25',
  '400vs25': '400VS25',
  '800vs25': '800VS25',
  '1500vs25': '1500VS25',
  '50vs50': '50VS50',
  '100vs50': '100VS50',
  '200vs50': '200VS50',
  '400vs50': '400VS50',
  '50z25': '50ZN25',
  '100z25': '100ZN25',
  '200z25': '200ZN25',
  '50p25': '50PR25',
  '100p25': '100PR25',
  '200p25': '200PR25',
  '50m25': '50MO25',
  '100m25': '100MO25',
  '200m25': '200MO25',
  '100ph25': '100PO25',
  '200ph25': '200PO25',
  '400ph25': '400PO25',
};

// ============================================
// Category auto-calculation
// ============================================
export function getSwimmerCategory(birthYear: number, competitionYear: number = new Date().getFullYear()): string {
  const age = competitionYear - birthYear;
  if (age <= 10) return 'benjamini';
  if (age <= 12) return 'mladsizaci';
  if (age <= 14) return 'starsiziaci';
  if (age <= 16) return 'dorast';
  if (age <= 18) return 'juniori';
  return 'senior';
}

// ============================================
// Time formatting / parsing utilities
// ============================================

/** Parse time input "M:SS.ss" or "SS.ss" to seconds. Returns null on invalid. */
export function parseTimeInput(input: string): number | null {
  const trimmed = input.trim().replace(/s$/i, '');
  if (!trimmed) return null;

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length !== 2) return null;
    const m = parseInt(parts[0], 10);
    const s = parseFloat(parts[1]);
    if (isNaN(m) || isNaN(s) || m < 0 || s < 0 || s >= 60) return null;
    return m * 60 + s;
  }

  const s = parseFloat(trimmed);
  if (isNaN(s) || s < 0) return null;
  return s;
}

/** Format decimal seconds to "M:SS.ss" or "SS.ss" display string */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) {
    return secs.toFixed(2);
  }
  return `${mins}:${secs.toFixed(2).padStart(5, '0')}`;
}

/** Format gap in seconds: "+1.2s" (swimmer faster) or "−3.3s" (needs improvement) */
export function formatGap(prSeconds: number, limitSeconds: number): string {
  const diff = limitSeconds - prSeconds; // positive = swimmer is faster than limit
  if (diff >= 0) {
    return `+${diff.toFixed(1)}s`;
  }
  return `−${Math.abs(diff).toFixed(1)}s`;
}

/** Gap status for a PR vs SZPS limit */
export type GapStatus = 'splneny' | 'blizko' | 'daleko' | 'bez_limitu' | 'bez_pr';

export function getGapStatus(prSeconds: number | null, limitSeconds: number | null): GapStatus {
  if (limitSeconds == null) return 'bez_limitu';
  if (prSeconds == null) return 'bez_pr';
  const gap = prSeconds - limitSeconds;
  if (gap <= 0) return 'splneny';
  if (gap <= 3) return 'blizko';
  return 'daleko';
}

export const GAP_STATUS_LABELS: Record<GapStatus, string> = {
  splneny: 'Splnený',
  blizko: 'Blízko',
  daleko: 'Ďaleko',
  bez_limitu: 'Bez limitu',
  bez_pr: '—',
};

export const GAP_STATUS_COLORS: Record<GapStatus, string> = {
  splneny: 'text-[#10b478] bg-[#10b478]/10',
  blizko: 'text-[#f4a300] bg-[#f4a300]/10',
  daleko: 'text-muted-foreground bg-muted',
  bez_limitu: 'text-muted-foreground bg-muted/50',
  bez_pr: 'text-muted-foreground',
};

// Linear regression helper: returns { slope, intercept }
export function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } | null {
  const n = points.length;
  if (n < 2) return null;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const denom = n * sumXX - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
