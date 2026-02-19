import { useState } from 'react';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Clock, Percent, MousePointerClick, X, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBookings } from '@/hooks/useBookings';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { toast } from 'sonner';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface LastMinuteOffer {
  id: string;
  title: string;
  message: string;
  created_at: string;
  related_slot_id: string | null;
  is_read: boolean | null;
}

export default function LastMinutePage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { createBooking } = useBookings();
  const [confirmOffer, setConfirmOffer] = useState<LastMinuteOffer | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ['last-minute-offers', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at, related_slot_id, is_read')
        .eq('user_id', profile.id)
        .eq('is_last_minute', true)
        .eq('is_read', false)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LastMinuteOffer[];
    },
    enabled: !!profile?.id,
  });

  const handleDismiss = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['last-minute-offers'] });
    queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
  };

  const handleBookLastMinute = async () => {
    if (!confirmOffer?.related_slot_id || !profile?.id) {
      toast.error('Tento termín sa nedá rezervovať priamo. Skúste cez kalendár.');
      setConfirmOffer(null);
      return;
    }

    setIsBooking(true);
    try {
      await createBooking.mutateAsync({
        slot_id: confirmOffer.related_slot_id,
        client_id: profile.id,
        price: DEFAULT_TRAINING_PRICE,
      });

      // Označiť notifikáciu ako prečítanú
      await supabase.from('notifications').update({ is_read: true }).eq('id', confirmOffer.id);

      toast.success('Rezervácia odoslaná! Čaká na potvrdenie od Veroniky. 🏊‍♀️');
      queryClient.invalidateQueries({ queryKey: ['last-minute-offers'] });
      queryClient.invalidateQueries({ queryKey: ['client-notifications'] });
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa rezervovať termín');
    } finally {
      setIsBooking(false);
      setConfirmOffer(null);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Last-minute tréningy</h1>
          <p className="text-muted-foreground text-sm">
            Uvoľnené termíny špeciálne pre vás 🏊‍♀️
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : offers.length > 0 ? (
          <div className="space-y-3">
            {offers.map((offer) => (
              <Card
                key={offer.id}
                className={offer.is_read
                  ? 'border-border bg-muted/30 opacity-70'
                  : 'border-primary/30 bg-primary/5'
                }
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="font-semibold text-sm">{offer.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{offer.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(offer.created_at), { locale: sk, addSuffix: true })}
                      </p>
                    </div>
                    {!offer.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={() => handleDismiss(offer.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {offer.is_read ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Zobrazené</span>
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => setConfirmOffer(offer)}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Chcem tento termín!
                    </Button>
                  )}
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
              <h2 className="text-lg font-semibold text-foreground mb-2">Momentálne nič nové</h2>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Ak sa uvoľní miesto na poslednú chvíľu, dám vám vedieť ako prvým. Stačí tu kliknúť a termín je váš! 💪
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
                        Niekedy sa plány zmenia a termín sa uvoľní na poslednú chvíľu. Vďaka tomuto odberu to viete ako prví.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <MousePointerClick className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Jedným klikom</p>
                      <p className="text-xs text-muted-foreground">
                        Kliknete, potvrdíte a je to vaše. Kto prvý, ten pláva! 🏊‍♀️
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Percent className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Často so zvýhodnenou cenou</p>
                      <p className="text-xs text-muted-foreground">
                        Last-minute termíny môžu byť zvýhodnené zľavou — oplatí sa sledovať.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Confirmation dialog */}
      <AlertDialog open={!!confirmOffer} onOpenChange={(open) => !open && setConfirmOffer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potvrdiť last-minute rezerváciu</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                {confirmOffer?.message}
              </span>
              <span className="block text-xs">
                Po potvrdení vás budem kontaktovať a rezerváciu dokončíme. 🙂
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBooking}>Nie teraz</AlertDialogCancel>
            <AlertDialogAction onClick={handleBookLastMinute} disabled={isBooking}>
              {isBooking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rezervujem...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Áno, chcem!
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ClientLayout>
  );
}