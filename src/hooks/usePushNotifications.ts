import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const VAPID_PUBLIC_KEY = 'BPTTs0Km_kmyCLMZdYYlKRZmV2Qt6R4FwVS2RHlIAWyZg7migX3FY9oupNf49QiebdTeuKkEL0k8Ce8SPDv9P5Q';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const isSupported =
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    isSupported ? Notification.permission : 'denied'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check DB for existing subscription
  useEffect(() => {
    if (!user || !isSupported) return;
    supabase
      .from('push_subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setIsSubscribed(!!data);
      });
  }, [user]);

  const subscribeToPush = useCallback(async () => {
    if (!user || !isSupported) return false;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      // Delete existing then insert (no UPDATE RLS policy)
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('push_subscriptions')
        .insert({
          user_id: user.id,
          subscription: sub.toJSON() as any,
        });

      if (error) throw error;
      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unsubscribeFromPush = useCallback(async () => {
    if (!user || !isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      setIsSubscribed(false);
    } catch (err) {
      console.error('Push unsubscribe failed:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    isSupported,
    permission,
    isSubscribed,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
