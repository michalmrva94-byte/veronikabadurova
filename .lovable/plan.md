

## Analysis

The issue: When the admin navigates months using the calendar arrows, nothing updates until they click a specific day. The `useSlotsForMonth` hook is keyed on `selectedDate`, and the `Calendar` component's `onSelect` only fires on day click — not on month navigation.

The `Calendar` component (react-day-picker v8) supports an `onMonthChange` callback that fires when the user navigates between months.

Currently in `AdminCalendarPage`:
- `selectedDate` drives both the day detail list (`useTrainingSlots(selectedDate)`) and the month slot highlights (`useSlotsForMonth(selectedDate || new Date())`)
- When the user clicks month arrows, react-day-picker changes its internal displayed month, but `selectedDate` stays the same → month highlights and day detail don't update

## Plan

### Single file change: `src/pages/admin/AdminCalendarPage.tsx`

**Add `onMonthChange` handler to the `Calendar` component** (around line 175):

```tsx
onMonthChange={(month: Date) => {
  const today = new Date();
  // If today is in the navigated month, select today; otherwise select 1st of that month
  if (today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth()) {
    setSelectedDate(today);
  } else {
    setSelectedDate(new Date(month.getFullYear(), month.getMonth(), 1));
  }
}}
```

This single addition ensures:
1. `selectedDate` updates on month navigation → `useTrainingSlots(selectedDate)` refetches day detail
2. `useSlotsForMonth(selectedDate || new Date())` refetches month highlights (new month key)
3. Day click (`onSelect`) still works as before, overriding `selectedDate`
4. No other files need changes

