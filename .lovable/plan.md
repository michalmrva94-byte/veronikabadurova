

## Bug Analysis

The root cause is in `CreateTrainingDialog`. It initializes internal state with `useState<Date>(selectedDate)` (line 62 of the dialog). React's `useState` only uses the initial value on first mount — subsequent prop changes are ignored. So when you click a new date, `dialogDate` updates but the dialog's internal `trainingDate` stays stale.

**Secondary issue**: The `resetForm` function resets `trainingDate` back to `selectedDate`, but this runs on close — by then the prop may have already changed or not.

## Fix Plan

### 1. `CreateTrainingDialog` — sync internal state with prop

Add a `useEffect` that updates `trainingDate` whenever the `selectedDate` prop changes:

```ts
useEffect(() => {
  setTrainingDate(selectedDate);
}, [selectedDate]);
```

Also update `resetForm` to use the current prop value (it already does via closure, but the effect ensures open-time sync).

### 2. `AdminCalendarPage` — ensure `openCreateDialog` sets date before opening

The current flow (`setDialogDate` → `setIsCreateDialogOpen`) is correct, but we should also ensure the month view `onSelect` and `openCreateDialog` are tightly coupled. The existing code at line 80-83 already does this correctly, so no change needed there.

### 3. Date normalization (timezone safety)

The `Calendar` `onSelect` can return a date with local midnight. When the `CreateTrainingDialog` combines this date with a time string via `setHours`/`setMinutes`, it produces a local datetime which is then converted to ISO (UTC) via `.toISOString()`. This is correct behavior — local time in UI, UTC in DB. No change needed here.

### Summary of changes

- **One file modified**: `src/components/admin/CreateTrainingDialog.tsx`
  - Add `useEffect` import
  - Add effect to sync `trainingDate` with `selectedDate` prop

This is a minimal, targeted fix for the stale-state bug.

