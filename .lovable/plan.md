

## Plan: Push Notification Permission Request

### Prerequisites
The VAPID keys have not been stored as secrets yet. Before the client-side code works, we need to:
1. Call the `generate-vapid-keys` edge function to get keys
2. Store `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` as secrets
3. Add `VITE_VAPID_PUBLIC_KEY` to `.env` with the public key value

### Implementation

**1. Create `src/hooks/usePushNotifications.ts`**

Custom hook with:
- `isSupported` — checks `serviceWorker`, `PushManager`, `Notification` availability
- `permission` — reactive state tracking `Notification.permission`
- `isSubscribed` — checks `push_subscriptions` table for current user
- `subscribeToPush()` — requests permission, subscribes via `pushManager.subscribe()` with VAPID key, upserts to `push_subscriptions` (using `user_id = auth.uid()` since the table references `auth.users` directly, not profiles)
- `unsubscribeFromPush()` — calls `sub.unsubscribe()`, deletes from table
- `urlBase64ToUint8Array()` helper inline

Note: `push_subscriptions.user_id` references `auth.users(id)` directly, so we use `user.id` from auth, not `profile.id`.

**2. Add `VITE_VAPID_PUBLIC_KEY` to `.env`**

First deploy and call `generate-vapid-keys` to obtain the public key, then add it to `.env`.

**3. Push banner in `DashboardPage.tsx`**

Add a dismissible banner inside `ApprovedDashboard`, rendered between the greeting and the hero block. Conditions:
- `isSupported === true`
- `Notification.permission === 'default'`
- `localStorage.getItem('push_dismissed_at')` is null or older than 7 days

Banner: subtle bar with bell icon, "Povoliť notifikácie o tréningoch" text, "Povoliť" button (calls `subscribeToPush`), "Teraz nie" button (stores timestamp, hides). On success: hide + toast "Notifikácie sú zapnuté ✅".

Not shown to admins — only within `ApprovedDashboard` which is client-only.

**4. Toggle in `ProfilePage.tsx`**

Add a new row in the Notifications card (after the last-minute toggle):
- Label: "Push notifikácie", sublabel: "Upozornenia o navrhnutých tréningoch"
- On mount: check `isSubscribed` from hook
- Toggle ON → `subscribeToPush()`, Toggle OFF → `unsubscribeFromPush()`
- If `!isSupported` → disabled toggle with note "Váš prehliadač nepodporuje notifikácie"

### Files
- **Create**: `src/hooks/usePushNotifications.ts`
- **Edit**: `src/pages/client/DashboardPage.tsx` — add banner
- **Edit**: `src/pages/client/ProfilePage.tsx` — add push toggle
- **Edit**: `.env` — add `VITE_VAPID_PUBLIC_KEY` (after obtaining key)

