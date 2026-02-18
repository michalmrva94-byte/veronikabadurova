import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Percent, MousePointerClick, X, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface LastMinuteNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  related_slot_id: string | null;
}

export default function LastMinutePage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['last-minute-offers', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, related_slot_id')
        .eq('user_id', profile.id)
        .eq('is_last_minute', true)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LastMinuteNotification[];
    },
    enabled: !!profile?.id,
  });

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['last-minute-offers'] }),
  });

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Last-minute tréningy</h1>
          <p className="text-muted-foreground text-sm">
            Špeciálne ponuky uvoľnených termínov
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : offers.length > 0 ? (
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card key={offer.id} className="border-primary/30 bg-primary/5">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-sm">{offer.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{offer.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(offer.created_at), { locale: sk, addSuffix: true })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => dismiss.mutate(offer.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => navigate(ROUTES.CALENDAR)}
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    Rezervovať
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground mb-2">Zatiaľ žiadne ponuky</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ak sa uvoľní termín na poslednú chvíľu, ponuka sa zobrazí priamo tu. Stačí ju jedným klikom prijať.
              </p>
            </div>

            <Card>
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold text-foreground">Ako to funguje?</h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Kedy sa to stáva?</p>
                      <p className="text-xs text-muted-foreground">
                        Keď niekto zruší tréning menej ako 24 hodín vopred, termín sa uvoľní.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MousePointerClick className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Ako rýchlo reagovať?</p>
                      <p className="text-xs text-muted-foreground">
                        Kto prvý rezervuje, ten pláva! Ponuky sú dostupné pre všetkých s aktívnym odberom.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Percent className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Cenová výhoda</p>
                      <p className="text-xs text-muted-foreground">
                        Last-minute termíny môžu byť zvýhodnené zľavou oproti štandardnej cene.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
