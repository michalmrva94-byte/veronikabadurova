ALTER TABLE public.notifications
  DROP CONSTRAINT notifications_related_slot_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_related_slot_id_fkey
  FOREIGN KEY (related_slot_id)
  REFERENCES public.training_slots(id)
  ON DELETE SET NULL;