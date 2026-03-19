import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { useClubContext } from "@/contexts/ClubContext"

const VAPID_PUBLIC_KEY = import.meta.env.VITE_SWIMDESK_VAPID_PUBLIC_KEY as string | undefined

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export function useParentPushNotifications() {
  const { user } = useAuth()
  const { club } = useClubContext()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSupported("Notification" in window && "serviceWorker" in navigator && "PushManager" in window)
  }, [])

  useEffect(() => {
    if (!user || !club || !isSupported) return
    supabase
      .from("swimdesk_push_subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("club_id", club.id)
      .limit(1)
      .then(({ data }) => setIsSubscribed((data?.length ?? 0) > 0))
  }, [user, club, isSupported])

  const subscribe = async () => {
    if (!user || !club || !VAPID_PUBLIC_KEY) return
    setIsLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") return

      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      await supabase.from("swimdesk_push_subscriptions").insert({
        user_id: user.id,
        club_id: club.id,
        subscription: sub.toJSON() as Record<string, unknown>,
      })
      setIsSubscribed(true)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    if (!user || !club) return
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      if (sub) await sub.unsubscribe()

      await supabase
        .from("swimdesk_push_subscriptions")
        .delete()
        .eq("user_id", user.id)
        .eq("club_id", club.id)

      setIsSubscribed(false)
    } finally {
      setIsLoading(false)
    }
  }

  return { isSupported, isSubscribed, isLoading, subscribe, unsubscribe }
}
