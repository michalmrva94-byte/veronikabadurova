// ============================================
// SwimDesk Coach - Type Definitions
// ============================================

export type CoachRole = 'admin' | 'coach';

export type Gender = 'M' | 'F';

export type Stroke = 'volny' | 'znak' | 'prsia' | 'motylik' | 'polohovy';

export type WorkoutType = 'vytrvalost' | 'rychlost' | 'technika' | 'zavod' | 'zmiesany';

export type SetPhase = 'rozcvicka' | 'hlavna' | 'upokojenie';

export type SetIntensity = 'nizka' | 'stredna' | 'vysoka';

export type SwimmerCategory = 'benjamini' | 'mladsizaci' | 'starsiziaci' | 'dorast' | 'juniori';

export interface Club {
  id: string;
  name: string;
  created_at: string;
}

export interface SDProfile {
  id: string;
  user_id: string;
  club_id: string;
  role: CoachRole;
  first_name: string;
  last_name: string;
  created_at: string;
}

export interface Group {
  id: string;
  club_id: string;
  name: string;
  category: string | null;
  coach_id: string | null;
  created_at: string;
  // Joined
  coach?: SDProfile;
  swimmers_count?: number;
}

export interface Swimmer {
  id: string;
  club_id: string;
  group_id: string | null;
  first_name: string;
  last_name: string;
  birth_year: number | null;
  gender: Gender | null;
  paysy_id: string | null;
  created_at: string;
  // Joined
  group?: Group;
}

export interface Discipline {
  id: string;
  code: string;
  name: string;
  distance: number;
  stroke: Stroke;
  pool_size: number;
}

export interface SzpsLimit {
  id: string;
  discipline_id: string;
  category: string;
  gender: Gender;
  competition: string;
  valid_year: number;
  time_seconds: number;
  // Joined
  discipline?: Discipline;
}

export interface PersonalRecord {
  id: string;
  swimmer_id: string;
  discipline_id: string;
  time_seconds: number;
  recorded_at: string;
  pool_size: number;
  competition_name: string | null;
  created_at: string;
  // Joined
  discipline?: Discipline;
  swimmer?: Swimmer;
}

export interface Workout {
  id: string;
  club_id: string;
  group_id: string | null;
  coach_id: string | null;
  workout_date: string;
  type: WorkoutType;
  title: string;
  total_meters: number;
  notes: string | null;
  created_at: string;
  // Joined
  group?: Group;
  coach?: SDProfile;
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workout_id: string;
  set_order: number;
  phase: SetPhase;
  description: string;
  meters: number;
  intensity: SetIntensity;
  duration_min: number | null;
  created_at: string;
}

export interface SeasonPlan {
  id: string;
  swimmer_id: string;
  discipline_id: string;
  target_time_seconds: number;
  weeks: number;
  start_date: string;
  ai_plan_json: Record<string, unknown> | null;
  created_by: string | null;
  created_at: string;
  // Joined
  swimmer?: Swimmer;
  discipline?: Discipline;
}
