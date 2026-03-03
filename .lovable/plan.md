

## Fix: Update VAPID_SUBJECT format

### Problem
The `VAPID_SUBJECT` secret is stored as `noreply@veronikaswim.sk` but the web-push library requires it as `mailto:noreply@veronikaswim.sk`. This crashes the edge function at startup before any request is processed.

### Solution
Update the `VAPID_SUBJECT` secret value to `mailto:noreply@veronikaswim.sk` using the `update_secret` tool. No code changes needed.

### Verification
After updating the secret, redeploy the edge function and test by invoking it directly to confirm it returns `{ success: true, sent: 1 }`.

