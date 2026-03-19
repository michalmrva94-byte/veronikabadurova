export type SwimmerGroup = "benjamini" | "ziaci" | "juniori" | "seniori"
export type SwimDiscipline = "volny" | "znak" | "prsia" | "motyl" | "kombinacia"
export type DayOfWeek = "pondelok" | "utorok" | "streda" | "stvrtok" | "piatok" | "sobota" | "nedela"
export type ClubAdminRole = "owner" | "admin" | "editor"

export interface Club {
  id: string
  slug: string
  name: string
  full_name: string | null
  founded_year: number | null
  city: string | null
  country: string
  logo_url: string | null
  cover_image_url: string | null
  primary_color: string
  accent_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClubContent {
  id: string
  club_id: string
  section: string
  content_sk: string | null
  content_en: string | null
  media_url: string | null
  sort_order: number
  is_visible: boolean
  updated_at: string
}

export interface Coach {
  id: string
  club_id: string
  full_name: string
  title: string | null
  bio_sk: string | null
  photo_url: string | null
  specialization: SwimDiscipline[] | null
  groups: SwimmerGroup[] | null
  email: string | null
  phone: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingGroup {
  id: string
  club_id: string
  slug: SwimmerGroup
  display_name: string
  age_from: number | null
  age_to: number | null
  description_sk: string | null
  color: string | null
  icon_emoji: string | null
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface TrainingScheduleEntry {
  id: string
  club_id: string
  group_id: string
  day_of_week: DayOfWeek
  start_time: string
  end_time: string
  location: string | null
  pool_lane: string | null
  coach_id: string | null
  is_active: boolean
  training_groups?: TrainingGroup
  coaches?: Pick<Coach, "id" | "full_name">
}

export interface NewsArticle {
  id: string
  club_id: string
  slug: string
  title_sk: string
  body_sk: string
  cover_image_url: string | null
  published_at: string
  is_published: boolean
}

export interface CompetitionResult {
  id: string
  club_id: string
  competition_name: string
  competition_date: string
  location: string | null
  swimmer_name: string
  group_id: string | null
  discipline: SwimDiscipline
  distance_m: number
  result_time_ms: number
  place: number | null
  is_personal_record: boolean
  import_batch_id: string | null
  import_source: string
  training_groups?: Pick<TrainingGroup, "id" | "display_name" | "slug">
}

export interface ParentProfile {
  id: string
  user_id: string
  full_name: string
  email: string
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Swimmer {
  id: string
  club_id: string
  parent_id: string
  full_name: string
  birth_year: number | null
  group_id: string | null
  paysy_member_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  training_groups?: Pick<TrainingGroup, "id" | "display_name" | "slug" | "color" | "icon_emoji">
}

export interface PaysyImportBatch {
  id: string
  club_id: string
  imported_by: string
  row_count: number
  filename: string | null
  season: string | null
  imported_at: string
}

export interface PaysyMemberStatus {
  id: string
  club_id: string
  swimmer_id: string | null
  paysy_member_id: string
  full_name_csv: string
  status: string
  season: string | null
  valid_until: string | null
  override_status: string | null
  override_note: string | null
  override_by: string | null
  overridden_at: string | null
  import_batch_id: string
  imported_at: string
  updated_at: string
  swimmers?: Pick<Swimmer, "id" | "full_name">
}

export interface SwimdeskPushSubscription {
  id: string
  user_id: string
  club_id: string
  subscription: Record<string, unknown>
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      clubs: { Row: Club; Insert: Omit<Club, "id" | "created_at" | "updated_at">; Update: Partial<Club> }
      club_content: { Row: ClubContent; Insert: Omit<ClubContent, "id" | "updated_at">; Update: Partial<ClubContent> }
      coaches: { Row: Coach; Insert: Omit<Coach, "id" | "created_at" | "updated_at">; Update: Partial<Coach> }
      training_groups: { Row: TrainingGroup; Insert: Omit<TrainingGroup, "id" | "created_at">; Update: Partial<TrainingGroup> }
      training_schedule: { Row: TrainingScheduleEntry; Insert: Omit<TrainingScheduleEntry, "id">; Update: Partial<TrainingScheduleEntry> }
      news: { Row: NewsArticle; Insert: Omit<NewsArticle, "id">; Update: Partial<NewsArticle> }
      competition_results: { Row: CompetitionResult; Insert: Omit<CompetitionResult, "id">; Update: Partial<CompetitionResult> }
      parent_profiles: { Row: ParentProfile; Insert: Omit<ParentProfile, "id" | "created_at" | "updated_at">; Update: Partial<ParentProfile> }
      swimmers: { Row: Swimmer; Insert: Omit<Swimmer, "id" | "created_at" | "updated_at">; Update: Partial<Swimmer> }
      paysy_import_batches: { Row: PaysyImportBatch; Insert: Omit<PaysyImportBatch, "id" | "imported_at">; Update: Partial<PaysyImportBatch> }
      paysy_member_status: { Row: PaysyMemberStatus; Insert: Omit<PaysyMemberStatus, "id" | "imported_at" | "updated_at">; Update: Partial<PaysyMemberStatus> }
      swimdesk_push_subscriptions: { Row: SwimdeskPushSubscription; Insert: Omit<SwimdeskPushSubscription, "id" | "created_at">; Update: Partial<SwimdeskPushSubscription> }
    }
  }
}
