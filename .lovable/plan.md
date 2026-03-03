

## Findings

**Admin has NO push subscription.** The `push_subscriptions` table only contains one record — for client `Veron Badovič`. Neither admin (`Veronika Baďurová` / `Michal Mrva`) has a subscription.

**Root cause:** The push notification banner and profile toggle only exist in client pages (`DashboardPage` and `ProfilePage`), which use `ClientLayout`. The admin panel has no equivalent UI to enable push notifications.

## Plan

### 1. Add push notification toggle to Admin Settings page

In `src/pages/admin/AdminSettingsPage.tsx`:
- Import `usePushNotifications` and `isSupported`
- Add a new Card section (with `Smartphone` icon) titled "Push notifikácie" containing a `Switch` toggle
- The toggle calls `subscribeToPush()` / `unsubscribeFromPush()` — same pattern as the client `PushToggleRow` in `ProfilePage.tsx`
- Place it after the Email toggles card

### 2. Add push notification banner to Admin Dashboard

In `src/pages/admin/AdminDashboardPage.tsx`:
- Import `usePushNotifications`
- Add a dismissible banner (same pattern as client `DashboardPage`) that appears if:
  - Push is supported
  - Permission is not `granted`
  - Not dismissed within last 7 days
- "Povoliť" button calls `subscribeToPush()`
- "Neskôr" dismisses for 7 days (using `localStorage` key `admin_push_dismissed_at`)

No database or edge function changes needed — the existing infrastructure handles everything once the admin has a subscription record.

