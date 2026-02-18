// ============================================
// VERONIKA SWIM - App Constants
// ============================================

// Cancellation fee rules
export const CANCELLATION_RULES = {
  MORE_THAN_48H: { hours: 48, percentage: 0, label: '> 48 hodín' },
  BETWEEN_24_48H: { hours: 24, percentage: 50, label: '24-48 hodín' },
  LESS_THAN_24H: { hours: 0, percentage: 80, label: '< 24 hodín' },
  NO_SHOW: { hours: -1, percentage: 100, label: 'Neúčasť' },
} as const;

// Default training price
export const DEFAULT_TRAINING_PRICE = 25.00;

// Referral bonus amount
export const REFERRAL_BONUS = 25.00;

// App routes
export const ROUTES = {
  HOME: '/',
  CLIENTS_LANDING: '/klienti',
  REFERRAL_LANDING: '/referral',
  CANCELLATION_POLICY: '/storno-pravidla',
  LOGIN: '/prihlasenie',
  REGISTER: '/registracia',
  FORGOT_PASSWORD: '/zabudnute-heslo',
  RESET_PASSWORD: '/reset-hesla',
  DASHBOARD: '/prehlad',
  CALENDAR: '/kalendar',
  MY_TRAININGS: '/moje-treningy',
  PROFILE: '/profil',
  FINANCES: '/financie',
  REFERRAL_PAGE: '/odporucanie',
  NOTIFICATIONS: '/notifikacie',
  ADMIN: {
    LOGIN: '/admin/prihlasenie',
    DASHBOARD: '/admin',
    CALENDAR: '/admin/kalendar',
    CLIENTS: '/admin/klienti',
    CLIENT_DETAIL: '/admin/klienti/:id',
    FINANCES: '/admin/financie',
    FINANCE_HISTORY: '/admin/financie/historia',
    SETTINGS: '/admin/nastavenia',
    BROADCAST: '/admin/broadcast',
  },
} as const;

// Transaction type labels in Slovak
export const TRANSACTION_LABELS = {
  deposit: 'Vklad',
  training: 'Tréning',
  cancellation: 'Storno poplatok',
  referral_bonus: 'Odmena za odporúčanie',
  manual_adjustment: 'Manuálna úprava',
} as const;

// Booking status labels in Slovak
export const BOOKING_STATUS_LABELS = {
  pending: 'Čaká na schválenie',
  booked: 'Potvrdené',
  cancelled: 'Zrušené',
  completed: 'Dokončené',
  no_show: 'Neprišiel/a',
  proposed: 'Navrhnutý',
  awaiting_confirmation: 'Čaká na potvrdenie',
} as const;

export const APPROVAL_STATUS_LABELS = {
  pending: 'Čaká na schválenie',
  approved: 'Schválený',
  rejected: 'Zamietnutý',
} as const;

export const CLIENT_TYPE_LABELS = {
  fixed: 'Fixný',
  flexible: 'Flexibilný',
} as const;

// Day names in Slovak
export const DAY_NAMES = [
  'Nedeľa',
  'Pondelok',
  'Utorok',
  'Streda',
  'Štvrtok',
  'Piatok',
  'Sobota',
] as const;

// Month names in Slovak
export const MONTH_NAMES = [
  'Január',
  'Február',
  'Marec',
  'Apríl',
  'Máj',
  'Jún',
  'Júl',
  'August',
  'September',
  'Október',
  'November',
  'December',
] as const;
