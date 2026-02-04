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
  CANCELLATION_POLICY: '/storno-pravidla',
  LOGIN: '/prihlasenie',
  REGISTER: '/registracia',
  DASHBOARD: '/prehlad',
  CALENDAR: '/kalendar',
  MY_TRAININGS: '/moje-treningy',
  PROFILE: '/profil',
  FINANCES: '/financie',
  REFERRAL: '/odporucanie',
  NOTIFICATIONS: '/notifikacie',
  ADMIN: {
    LOGIN: '/admin/prihlasenie',
    DASHBOARD: '/admin',
    CALENDAR: '/admin/kalendar',
    CLIENTS: '/admin/klienti',
    CLIENT_DETAIL: '/admin/klienti/:id',
    FINANCES: '/admin/financie',
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
  booked: 'Rezervované',
  cancelled: 'Zrušené',
  completed: 'Dokončené',
  no_show: 'Neprišiel/a',
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
