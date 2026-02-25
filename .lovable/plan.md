

## Analýza problému

Mazanie slotu zlyhá s DB chybou:

```text
update or delete on table "training_slots" violates foreign key constraint
"notifications_related_slot_id_fkey" on table "notifications"
```

Tabuľka `notifications` má FK `related_slot_id -> training_slots(id)` **bez** `ON DELETE CASCADE`. Keď existujú notifikácie viazané na daný slot, databáza odmietne jeho zmazanie.

## Riešenie

Zmeniť FK constraint `notifications_related_slot_id_fkey` na `ON DELETE SET NULL`. Pri zmazaní slotu sa `related_slot_id` v notifikáciách nastaví na `NULL` namiesto blokovania operácie. Notifikácie zostanú zachované (historické záznamy), len stratia väzbu na zmazaný slot.

### Databázová migrácia

```sql
ALTER TABLE public.notifications
  DROP CONSTRAINT notifications_related_slot_id_fkey;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_related_slot_id_fkey
  FOREIGN KEY (related_slot_id)
  REFERENCES public.training_slots(id)
  ON DELETE SET NULL;
```

Žiadne zmeny v kóde nie sú potrebné - `handleDeleteSlot` v `AdminCalendarPage.tsx` a `deleteSlot` v `useTrainingSlots.ts` sú implementované správne.

