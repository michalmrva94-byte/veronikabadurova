

## Problem

When a client cancels a training, the admin receives **neither an in-app notification, nor an email, nor a push notification**. Looking at `useClientBookings.ts`:

1. **No admin email** -- Line 116 comment explicitly says "handled via in-app notif" — admin email was never implemented for client-side cancellations.

2. **In-app notification likely fails silently** -- In `onSuccess` (line 141), the code re-fetches the cancelled booking with `profiles!bookings_client_id_fkey` foreign key hint. If this hint doesn't match the actual FK constraint name, PostgREST returns an error. The entire block is wrapped in try/catch that silently swallows the error (line 164-166), so no notification is created and no error is visible.

3. **No push notification** -- `sendPushNotification` is never called in the cancellation flow, so admin gets no push either.

## Fix

In `src/hooks/useClientBookings.ts`, update the `onSuccess` callback to:

1. **Fix the booking re-fetch** -- Use a simpler query without the problematic FK hint, or skip the re-fetch entirely since we already have the booking data from `mutationFn`. Pass the needed data (client name, slot time) from `mutationFn` return value to `onSuccess`.

2. **Add admin email notification** -- Send a cancellation email to admin (Veronika) using `sendNotificationEmail` with type `'cancellation'` and `cancelledBy: 'client'`.

3. **Add admin push notification** -- Call `sendPushNotification` targeting admin user IDs (via `get_admin_user_ids` RPC).

### Concrete changes

**Return more data from mutationFn** so `onSuccess` doesn't need to re-fetch:
```typescript
return { cancellationFee, clientName: profile.full_name, slotStart: slot.start_time };
```

**Rewrite onSuccess** to:
- Use returned data instead of re-querying
- Insert in-app notifications for admins (using `get_admin_profile_ids`)
- Send cancellation email to admin email
- Send push notification to admin user IDs (using `get_admin_user_ids`)

No database or backend changes needed.

