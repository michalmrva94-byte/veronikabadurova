import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Zap, Calendar, CreditCard, Megaphone, CheckCircle, XCircle, Loader2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

const typeIconMap: Record<string, React.ReactNode> = {
  last_minute: <Zap className="h-5 w-5 text-amber-500" />,
  booking_confirmed: <CheckCircle className="h-5 w-5 text-green-500" />,
  booking_rejected: <XCircle className="h-5 w-5 text-destructive" />,
  booking_cancelled: <XCircle className="h-5 w-5 text-destructive" />,
  booking_pending: <Calendar className="h-5 w-5 text-primary" />,
  proposed_training: <Calendar className="h-5 w-5 text-primary" />,
  info: <Bell className="h-5 w-5 text-muted-foreground" />,
};

function getIcon(type: string | null, isLastMinute: boolean | null) {
  if (isLastMinute) return typeIconMap.last_minute;
  return typeIconMap[type || ''] || typeIconMap.info;
}

export default function NotificationsPage() {
  const { profile } = useAuth();
  const profileId = profile?.id;
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['client-notifications', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profileId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!profileId) return;
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', profileId)
        .eq('is_read', false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-notifications'] }),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-notifications'] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client-notifications'] }),
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Notifikácie</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} neprečítaných` : 'Vaše upozornenia a správy'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Check className="mr-2 h-4 w-4" />
              Označiť všetky
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nemáte žiadne nové notifikácie
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <Card
                key={n.id}
                className={cn(
                  'transition-colors',
                  !n.is_read && 'border-primary/30 bg-primary/5'
                )}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(n.type, n.is_last_minute)}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm font-semibold', !n.is_read && 'text-foreground')}>
                          {n.title}
                        </p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(n.created_at), { locale: sk, addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <div className="flex items-center gap-2 pt-1">
                        {!n.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => markRead.mutate(n.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Prečítané
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => deleteNotification.mutate(n.id)}
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Zmazať
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
