

## Plan: Add Push Notifications to Admin for Client Actions

### Problem
When a client requests a training or confirms a proposed training, the admin gets in-app and email notifications but no push notification.

### Key Detail: user_id Mismatch
The existing `get_admin_profile_ids()` RPC returns **profile IDs** (`profiles.id`), but `sendPushNotification` needs **auth user IDs** (`profiles.user_id`) since `push_subscriptions.user_id` stores `auth.uid()`. We need to query admin auth user_ids separately.

### Changes

**1. `src/hooks/useBookings.ts`** — Add push after booking creation (in `onSuccess`, alongside existing admin notifications):
- Import `sendPushNotification`
- After fetching admin profile IDs and client name, also fetch admin auth `user_id` values from `profiles` table using those profile IDs
- Fire-and-forget call:
  ```
  title: "Nová požiadavka na tréning 📩"
  body: "<name> žiada o tréning"
  url: "/admin/kalendar"
  ```

**2. `src/hooks/useProposedTrainings.ts`** — Add push after client confirms (in `confirmProposedTraining.mutationFn`, inside the existing admin notification try/catch block):
- Import `sendPushNotification`
- After fetching admin profile IDs, also fetch their auth `user_id` values
- Fire-and-forget call:
  ```
  title: "Tréning potvrdený ✅"
  body: "<name> potvrdil tréning <date> o <time>"
  url: "/admin/kalendar"
  ```

### No other files modified
The edge function, push subscription infrastructure, and booking logic remain untouched.

