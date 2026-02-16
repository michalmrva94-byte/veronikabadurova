import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Landmark, Copy, Info, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSACTION_LABELS, DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { useTransactions } from '@/hooks/useTransactions';
import { useClientBookings } from '@/hooks/useClientBookings';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const formatIBAN = (iban: string) => iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

export default function FinancesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { transactions, isLoading } = useTransactions();
  const { upcomingBookings } = useClientBookings();

  const { data: ibanValue } = useQuery({
    queryKey: ['app-settings', 'iban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'iban')
        .single();
      if (error) return '';
      return data?.value || '';
    },
  });

  const balance = profile?.balance ?? 0;
  const trainingsCount = Math.floor(Math.max(0, balance) / DEFAULT_TRAINING_PRICE);
  const upcomingCost = upcomingBookings.length * DEFAULT_TRAINING_PRICE;
  const isLowCredit = balance < upcomingCost && upcomingBookings.length > 0;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} skopírovaný` });
    });
  };

  const getTransactionLabel = (type: string) => {
    return TRANSACTION_LABELS[type as keyof typeof TRANSACTION_LABELS] || type;
  };

  return (
    <ClientLayout>
      <div className="space-y-5 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Kredit & platby</h1>
          <p className="text-sm text-muted-foreground">Prehľad kreditu a doplnenie</p>
        </div>

        {/* A) Top summary - big credit number */}
        <Card>
          <CardContent className="pt-6 pb-5 text-center">
            <p className="text-sm text-muted-foreground mb-1">Aktuálny kredit</p>
            <p className={cn(
              'text-4xl font-bold tracking-tight',
              balance >= 0 ? 'text-success' : 'text-destructive'
            )}>
              {balance >= 0 ? '+' : ''}{balance.toFixed(2)} €
            </p>
            {balance > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                ≈ {trainingsCount} {trainingsCount === 1 ? 'tréning' : trainingsCount >= 2 && trainingsCount <= 4 ? 'tréningy' : 'tréningov'}
              </p>
            )}
            {balance < 0 && (
              <p className="text-sm text-destructive/80 mt-1">Neuhradený zostatok</p>
            )}
          </CardContent>
        </Card>

        {/* B) IBAN card */}
        {ibanValue && (
          <div className={cn(
            'rounded-lg border p-4 space-y-3',
            isLowCredit || balance < 0 ? 'border-warning/50 bg-warning/5' : 'border-border bg-muted/30'
          )}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Landmark className="h-4 w-4" />
              <span>Platba prevodom</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm font-mono tracking-wide">
                {formatIBAN(ibanValue)}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(ibanValue.replace(/\s/g, ''), 'IBAN')}
              >
                <Copy className="h-4 w-4 mr-1" />
                Kopírovať
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Platby sa spracúvajú manuálne. Kredit bude pripísaný po zaevidovaní platby Veronikou.
            </p>
          </div>
        )}

        {/* C) Warning banner - only when needed */}
        {isLowCredit && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-3 flex items-start gap-3 text-sm">
            <Info className="h-4 w-4 text-warning shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              {balance < 0
                ? 'Máš záporný zostatok. Prosím, doplň kredit prevodom na účet.'
                : 'Kredit nepokrýva nadchádzajúce tréningy. Zváž doplnenie.'}
            </p>
          </div>
        )}

        {/* D) Transaction history */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-1">História transakcií</h2>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Zatiaľ nemáš žiadne transakcie.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {transactions.map((t) => {
                const isPositive = t.amount > 0;
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-2 text-sm">
                      <span className={cn(
                        'font-semibold tabular-nums',
                        isPositive ? 'text-success' : 'text-destructive'
                      )}>
                        {isPositive ? '+' : ''}{t.amount.toFixed(2)} €
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-foreground">{getTransactionLabel(t.type)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {format(new Date(t.created_at), 'd.M.', { locale: sk })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
