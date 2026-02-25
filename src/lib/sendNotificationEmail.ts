import { supabase } from '@/integrations/supabase/client';

interface SendNotificationEmailParams {
  type: 'confirmation' | 'reminder' | 'last_minute' | 'proposal' | 'cancellation';
  to: string;
  clientName: string;
  trainingDate?: string;
  trainingTime?: string;
  title?: string;
  message?: string;
  slotId?: string;
  trainingCount?: number;
  reason?: string;
  cancelledBy?: 'admin' | 'client';
  cancellationFee?: string;
}

export async function sendNotificationEmail(params: SendNotificationEmailParams) {
  try {
    // Check if this email type is enabled
    const { data: toggleRow } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'email_toggles')
      .maybeSingle();

    if (toggleRow) {
      try {
        const toggles = JSON.parse(toggleRow.value);
        if (toggles[params.type] === false) {
          console.log(`Email type "${params.type}" is disabled, skipping.`);
          return;
        }
      } catch {}
    }

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
