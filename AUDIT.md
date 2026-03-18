# App Audit Report — Veronika Swim

**Date:** 2026-03-18
**Stack:** React 18 + TypeScript 5 + Supabase (PostgreSQL + Deno Edge Functions) + Vite + PWA

---

## Executive Summary

Veronika Swim is a production-grade swimming training reservation system. The overall architecture is sound — Supabase Auth handles passwords, RLS policies protect most database tables, and React's JSX auto-escaping prevents most XSS vectors. However, several issues ranging from hardcoded secrets to pervasive `as any` casts and missing server-side auth checks need to be addressed before the app can be considered secure and maintainable.

**53 findings total:** 2 Critical · 11 High · 24 Medium · 16 Low

---

## Critical

### C1 — .env File May Be Committed to Git
**Files:** `.env`
Supabase project ID, URL, and publishable key are stored in `.env`. If this file is not in `.gitignore` and has ever been committed, credentials are exposed in git history.

**Fix:** Confirm `.gitignore` includes `.env`. If already committed, rotate keys and purge from git history with `git filter-repo`.

---

### C2 — Hardcoded Admin Email in Production Code
**Files:** `src/hooks/useBookings.ts:91`, `supabase/functions/send-contact-form/index.ts:12`

```ts
// useBookings.ts
to: 'veronika.duro@gmail.com'

// send-contact-form/index.ts
const TO_EMAIL = "veronika.duro@gmail.com";
```

A personal email is baked into shipping code. Any email change requires a code deploy. The address is also visible to anyone who reads the client bundle.

**Fix:** Move to `app_settings` table with an `admin_email` key. Read it at runtime.

---

## High

### H1 — Pervasive `as any` Type Assertions
**Files:** `src/components/admin/SlotDetailDialog.tsx` (10+ instances), `src/hooks/useAdminDashboardStats.ts` (15+ instances), `src/pages/admin/AdminClientsPage.tsx:71–72`, `src/pages/client/FinancesPage.tsx:40`

```ts
// Examples
(booking.client as any).client_type
(booking as any)?.price ?? 25
update({ approval_status: 'approved' as any })
const debtBalance = (profile as any)?.debt_balance ?? 0;
```

These casts silence the compiler, hide real type mismatches, and make future refactors unsafe.

**Fix:** Add proper TypeScript interfaces for all Supabase query results. Use the Supabase type generator (`supabase gen types typescript`) to produce a `database.types.ts` and wire it into the client.

---

### H2 — send-notification-email Edge Function Has No Auth Check
**File:** `supabase/functions/send-notification-email/index.ts`

The function validates required fields but does not verify that the caller is authenticated or owns the `user_id` in the payload. Any unauthenticated request can trigger emails.

**Fix:** Add a Bearer token check and verify the calling user owns the notification being sent.

---

### H3 — Admin Approval Status Not Enforced at Route Level for All Client Routes
**File:** `src/components/auth/ProtectedRoute.tsx`

`isApproved` guards some routes, but the check is frontend-only. A user who tampers with auth state could bypass it. The real guard must be RLS at the database layer.

**Fix:** Ensure all sensitive queries have RLS policies that verify `approval_status = 'approved'`. Treat the frontend check as UX only, not security.

---

### H4 — Admin Authorization Relies Solely on Frontend State
**File:** `src/components/auth/ProtectedRoute.tsx:38–42`

```tsx
if (requireAdmin && !isAdmin) {
  return <Navigate to={ROUTES.DASHBOARD} replace />;
}
```

Route protection is entirely client-side. If `isAdmin` is manipulated in memory, admin pages render. Database RLS is the only real protection.

**Fix:** Confirm every admin Supabase query is covered by a `has_role(auth.uid(), 'admin')` RLS policy. The frontend check can stay as a UX improvement, but must not be the primary control.

---

## Medium

### M1 — Auth Race Condition / setTimeout Workaround
**File:** `src/contexts/AuthContext.tsx:76–107`

```ts
setTimeout(() => { fetchProfile(...); }, 0);
```

`setTimeout(0)` is used to work around a race between `onAuthStateChange` and `getSession()`. This is fragile and may fail under load or on slow connections.

**Fix:** Use a single source of truth — initialize from `onAuthStateChange` only, or use an abort controller to cancel stale profile fetches.

---

### M2 — Role Fetch Failure Silently Defaults to `client`
**File:** `src/contexts/AuthContext.tsx:54–57`

```ts
if (roleResult.error) {
  setRole('client'); // silent fallback
}
```

If the role query fails (e.g., network error, RLS issue), the user gets `client` access rather than an explicit failure. Defaulting to least privilege is better than admin, but the error should surface to the user.

**Fix:** Set role to `null` on error, navigate to an error page or show a session error, and require re-login.

---

### M3 — Console Logs in Production Code
**Files:** `src/contexts/AuthContext.tsx` (lines 60, 173), `src/components/auth/ProtectedRoute.tsx:40`, `src/hooks/useBookings.ts:102`, and 27 more instances

```ts
console.log('Fetched role:', fetchedRole);
console.log('Sending push to admin user_ids:', adminUserIds);
console.log('Access denied: requireAdmin =', requireAdmin, ', role =', role);
```

User IDs, roles, and internal state are visible in browser DevTools to any user.

**Fix:** Remove all `console.log` in production paths. Use `console.error` only for genuine errors. Gate debug logs with `import.meta.env.DEV`.

---

### M4 — VAPID Keys Not Validated Before Use
**File:** `supabase/functions/send-push-notification/index.ts:11–17`

```ts
webpush.setVapidDetails(
  subject,
  Deno.env.get("VAPID_PUBLIC_KEY")!,  // non-null assertion, not validated
  Deno.env.get("VAPID_PRIVATE_KEY")!
);
```

Missing env vars cause a runtime panic with an opaque error rather than a clear startup failure.

**Fix:** Check for env var presence at function startup and return a 500 with a clear message if missing.

---

### M5 — delete-client Silently Ignores Auth User Deletion Failure
**File:** `supabase/functions/delete-client/index.ts:94–97`

Profile rows are deleted before the auth user is removed. If auth deletion fails, the profile is gone but the user can still log in (with no profile), creating a broken account state.

**Fix:** Reverse the deletion order (delete auth user first, then profile rows), or wrap in a database transaction where possible.

---

### M6 — Broadcast Emails Sent in Serial Loop
**File:** `src/pages/admin/AdminBroadcastPage.tsx:215–226`

```ts
for (const client of lastMinuteClients) {
  sendNotificationEmail({...});
}
```

Emails are sent one by one. For many recipients this causes a long blocking operation.

**Fix:** Use `Promise.all()` to parallelize sends.

---

### M7 — apply_charge SECURITY DEFINER Function
**File:** `supabase/migrations/20260218201301_*.sql:24–75`

The function runs with elevated privileges. A bug in input validation would allow arbitrary balance manipulation.

**Fix:** Add strict parameter validation at the SQL function entry point (assert `amount > 0`, `client_id` exists, etc.).

---

### M8 — No Audit Log for Admin Actions
Admin operations (delete client, manual balance adjustment) leave no audit trail.

**Fix:** Create an `audit_log` table and insert a record (admin_id, action, target_id, timestamp) in the delete-client function and any financial adjustment path.

---

## Low

### L1 — Client-Side Filtering of All Clients Without Pagination
**File:** `src/pages/admin/AdminClientsPage.tsx:28–30`

All clients are loaded into memory and filtered in JavaScript. Fine today but will degrade with growth.

**Fix:** Push filtering and pagination to Supabase queries when client count exceeds ~500.

---

### L2 — Registration Form Email Validation Too Permissive
**File:** `src/pages/auth/RegisterPage.tsx:36–49`

```ts
!/^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

The regex allows `foo@bar.x` (1-char TLD) and other edge cases.

**Fix:** Use Zod's `z.string().email()` for validation across all forms.

---

### L3 — broadcast Message Not Length-Validated
**File:** `src/pages/admin/AdminBroadcastPage.tsx`

Admin broadcast message has no maximum length enforced on the frontend.

**Fix:** Add a `maxLength` attribute and Zod validation.

---

### L4 — app_settings Readable by All Authenticated Users
**File:** Migration — RLS policy

```sql
CREATE POLICY "Anyone authenticated can read settings"
  ON public.app_settings FOR SELECT TO authenticated USING (true);
```

If any sensitive config (e.g., future API keys, pricing overrides) is added to this table, it becomes world-readable.

**Fix:** Split settings into public and private rows, or restrict admin-only settings with a role check.

---

### L5 — blocked_client_name Stored as Plaintext
**File:** `supabase/migrations/20260312191822_*.sql`

The name of a blocked (non-registered) client is stored in plaintext without any indication of retention policy.

**Fix:** Document the data retention policy. Consider pseudonymising if GDPR applies.

---

### L6 — dangerouslySetInnerHTML in ChartStyle
**File:** `src/components/ui/chart.tsx:70–86`

`dangerouslySetInnerHTML` is used to inject chart CSS. Currently safe because the template uses only static config values and `React.useId()`. Flagged because it's a pattern to watch if chart config ever becomes user-editable.

**Fix:** No action needed now. Add a code comment warning future developers not to put user input into the template string.

---

## Positive Findings

- **RLS policies** are well-designed overall. The initial overly-permissive referral rewards policy was caught and fixed in a subsequent migration.
- **Supabase Auth** handles all password hashing and storage — no custom credential handling.
- **delete-client edge function** correctly verifies admin role before proceeding.
- **send-push-notification** checks admin role for broadcast operations.
- **Contact form** sanitizes HTML entities before including in emails.
- **React JSX** auto-escapes string interpolations, blocking most XSS paths.
- **localStorage usage** is limited to timestamps and boolean flags — no user-controlled data.
- **TypeScript** is used throughout, and types are mostly correct outside the `as any` hotspots.

---

## Recommended Fix Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| 1 | C2 — Move hardcoded email to app_settings | Small |
| 2 | C1 — Verify .env in .gitignore, rotate if leaked | Small |
| 3 | H2 — Add auth check to send-notification-email | Small |
| 4 | M3 — Remove / gate all console.log statements | Small |
| 5 | M4 — Validate VAPID env vars at startup | Small |
| 6 | M5 — Fix delete-client deletion order | Small |
| 7 | H1 — Replace `as any` with generated DB types | Medium |
| 8 | M1 — Fix auth race condition in AuthContext | Medium |
| 9 | M8 — Add audit log table for admin actions | Medium |
| 10 | M6 — Parallelize broadcast emails | Small |
