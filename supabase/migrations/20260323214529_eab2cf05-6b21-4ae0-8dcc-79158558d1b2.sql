ALTER TABLE training_slots
  ADD COLUMN is_note boolean NOT NULL DEFAULT false,
  ADD COLUMN note_title text;