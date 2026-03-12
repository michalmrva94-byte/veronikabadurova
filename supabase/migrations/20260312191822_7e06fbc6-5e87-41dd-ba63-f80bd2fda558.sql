ALTER TABLE training_slots 
  ADD COLUMN is_blocked boolean NOT NULL DEFAULT false,
  ADD COLUMN blocked_client_name text,
  ADD COLUMN blocked_price numeric DEFAULT 0,
  ADD COLUMN blocked_completed boolean NOT NULL DEFAULT false;