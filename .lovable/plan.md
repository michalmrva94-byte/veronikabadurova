

## Root Cause Analysis

The code correctly resolves admin auth `user_id` values. The **real bug** is in the edge function's authorization:

The `send-push-notification` edge function **requires the caller to be an admin** (lines 69-82 of the edge function). But when a **client** creates a booking or confirms a proposed training, the client's JWT is used to invoke the function. The edge function checks `user_roles` for admin role → **returns 403 Forbidden**.

Evidence: No edge function logs exist for recent push attempts, meaning the function either wasn't called or returned an auth error silently.

### Data confirmed correct
- `get_admin_profile_ids()` returns profile IDs
- Code then queries `profiles.select('user_id').in('id', adminIds)` → correctly resolves auth UIDs
- Michal Mrva (`1caa5cf6...`) has a push subscription ✓
- Veronika Baďurová (`510001b2...`) does NOT have a push subscription yet

### Fix

**`supabase/functions/send-push-notification/index.ts`** — Relax the admin-only check:
- Any **authenticated** user can call the function with specific `user_ids`
- Only **admins** can use `send_to_all` (broadcast)
- This allows client-triggered flows (booking request, proposal confirmation) to send push to admins

Specifically, move the admin check to only guard the `send_to_all` path (around line 77):
```typescript
// Any authenticated user can send to specific user_ids
// Only admins can broadcast to all
if (send_to_all && !roleData) {
  return 403 Forbidden
}
```

**Also add `console.log`** before `sendPushNotification` calls in both hooks for debugging, as requested.

### Files to change
1. `supabase/functions/send-push-notification/index.ts` — relax auth to allow authenticated users for targeted push
2. `src/hooks/useBookings.ts` — add debug console.log
3. `src/hooks/useProposedTrainings.ts` — add debug console.log

