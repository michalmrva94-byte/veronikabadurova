import { supabase } from '@/integrations/supabase/client';

interface SendPushParams {
  /** Auth user IDs to send to */
  user_ids?: string[];
  /** Send to all subscribed users */
  send_to_all?: boolean;
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification(params: SendPushParams) {
  try {
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: params,
    });
    if (error) {
      console.error('Failed to send push notification:', error);
    }
  } catch (e) {
    console.error('Push notification error:', e);
  }
}
