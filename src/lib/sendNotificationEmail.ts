import { supabase } from '@/integrations/supabase/client';

interface SendNotificationEmailParams {
  type: 'confirmation' | 'reminder' | 'last_minute' | 'proposal';
  to: string;
  clientName: string;
  trainingDate?: string;
  trainingTime?: string;
  title?: string;
  message?: string;
  slotId?: string;
  trainingCount?: number;
}

export async function sendNotificationEmail(params: SendNotificationEmailParams) {
  try {
    const { error } = await supabase.functions.invoke('send-notification-email', {
      body: params,
    });
    if (error) {
      console.error('Failed to send notification email:', error);
    }
  } catch (e) {
    console.error('Email sending error:', e);
  }
}
