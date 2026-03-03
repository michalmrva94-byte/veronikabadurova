

## Plan: Push Notification Infrastructure

### Step 1: Generate VAPID Keys

Create `supabase/functions/generate-vapid-keys/index.ts` — a one-time-use edge function that generates a VAPID key pair using the `web-push` npm package and returns `{ publicKey, privateKey }`.

Add to `supabase/config.toml` with `verify_jwt = false`.

After deployment, call the function once, then store 3 secrets:
- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` = `mailto:noreply@veronikaswim.sk`

### Step 2: Database Migration

Single migration with:

1. **Create `push_subscriptions` table** with `id`, `user_id` (NOT NULL, references auth.users), `subscription` (jsonb), `created_at`, `UNIQUE(user_id)`. Enable RLS.

2. **RLS policies:**
   - Users can INSERT own (`WITH CHECK (auth.uid() = user_id)`)
   - Users can DELETE own (`USING (auth.uid() = user_id)`)
   - Users can SELECT own (`USING (auth.uid() = user_id)`)
   - Admins can SELECT all (`USING (has_role(auth.uid(), 'admin'))`)

3. **Fix `reminder_sent`** on bookings — currently nullable, update nulls to false and set NOT NULL.

### Step 3: No additional bookings column needed

The `reminder_sent` column already exists. Only the nullable → NOT NULL fix is needed (included in migration above).

### Files
- **Create**: `supabase/functions/generate-vapid-keys/index.ts`
- **Edit**: `supabase/config.toml` — add function entry
- **Migration**: new SQL for `push_subscriptions` table + `reminder_sent` NOT NULL fix

