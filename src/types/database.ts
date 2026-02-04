// ============================================
// VERONIKA SWIM - Type Definitions
// ============================================

export type AppRole = 'client' | 'admin';

export type BookingStatus = 'pending' | 'booked' | 'cancelled' | 'completed' | 'no_show';

export type TransactionType = 'deposit' | 'training' | 'cancellation' | 'referral_bonus' | 'manual_adjustment';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  referral_code: string | null;
  referred_by: string | null;
  notifications_enabled: boolean;
  email_notifications: boolean;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface TrainingSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  recurring_day_of_week: number | null;
  recurring_start_time: string | null;
  recurring_end_time: string | null;
  is_available: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  slot_id: string;
  status: BookingStatus;
  price: number;
  cancellation_fee: number;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  is_last_minute: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  slot?: TrainingSlot;
  client?: Profile;
}

export interface Transaction {
  id: string;
  client_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  booking_id: string | null;
  created_by: string | null;
  created_at: string;
  // Joined data
  client?: Profile;
}

export interface ReferralReward {
  id: string;
  referrer_id: string;
  referred_id: string;
  first_training_completed: boolean;
  reward_credited: boolean;
  reward_amount: number;
  created_at: string;
  // Joined data
  referred?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  is_last_minute: boolean;
  related_slot_id: string | null;
  created_at: string;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

// Helper type for booking with slot details
export interface BookingWithDetails extends Booking {
  slot: TrainingSlot;
  client: Profile;
}

// Helper type for available slot display
export interface AvailableSlot extends TrainingSlot {
  isBooked: boolean;
  bookingId?: string;
}
