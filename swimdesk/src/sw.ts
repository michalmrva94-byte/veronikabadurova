/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { clientsClaim } from 'workbox-core'

declare const self: ServiceWorkerGlobalScope & typeof globalThis

// Precache all assets injected by VitePWA
precacheAndRoute(self.__WB_MANIFEST)

// Activate new SW immediately
self.skipWaiting()
clientsClaim()

// Handle SKIP_WAITING message from the app
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

// Runtime caching for Supabase API calls
registerRoute(
  /^https:\/\/.*\.supabase\.co\/.*/i,
  new NetworkFirst({
    cacheName: 'supabase-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 }),
    ],
  })
)

// --- Push Notification Listeners ---

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {}
  const options: NotificationOptions & { actions?: Array<{ action: string; title: string }> } = {
    body: data.body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: data.url ?? '/' },
  }
  if (data.actions?.length) {
    options.actions = data.actions
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'SwimDesk', options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((windowClients) => {
      const client = windowClients.find((c) => c.url.includes(url))
      if (client) return client.focus()
      return self.clients.openWindow(url)
    })
  )
})
