

## Plan: Add Push Notification Listeners to Service Worker

### Current state
The app uses `vite-plugin-pwa` in default `generateSW` mode (Workbox auto-generates the SW). There is no custom `sw.ts` file.

### Changes needed

**1. Create `src/sw.ts`** — custom service worker source file:
- Import Workbox precaching via `workbox-precaching` (to keep existing caching behavior)
- Call `precacheAndRoute(self.__WB_MANIFEST)` to preserve all current caching/routing
- Add `skipWaiting()` and `clientsClaim()` calls (moved from config)
- Append the two push notification listeners (push event + notificationclick) exactly as specified

**2. Edit `vite.config.ts`** — switch VitePWA from `generateSW` to `injectManifest` mode:
- Set `strategies: 'injectManifest'`
- Set `srcDir: 'src'`, `filename: 'sw.ts'`
- Keep existing manifest, includeAssets, and registerType config unchanged
- Remove the `workbox` config block (caching config moves into `sw.ts` via Workbox APIs)
- Add `injectManifest.globPatterns` and `injectManifest.maximumFileSizeToCacheInBytes` to match current workbox settings

### What stays the same
- All PWA metadata (manifest, icons, theme colors)
- `registerType: 'autoUpdate'`
- Runtime caching for Supabase API calls
- `navigateFallbackDenylist` for OAuth

### Technical detail

The `sw.ts` file will use Workbox modules directly:
```ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Existing caching behavior
precacheAndRoute(self.__WB_MANIFEST);
self.skipWaiting();
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

// Runtime caching for Supabase
registerRoute(
  /^https:\/\/.*\.supabase\.co\/.*/i,
  new NetworkFirst({ cacheName: 'supabase-cache', plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })] })
);

// Push notification listeners (appended)
self.addEventListener('push', ...);
self.addEventListener('notificationclick', ...);
```

### Files
- **Create**: `src/sw.ts`
- **Edit**: `vite.config.ts` — switch to injectManifest strategy

