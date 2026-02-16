import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock, XCircle, Loader2, Landmark, Copy, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSACTION_LABELS } from '@/lib/constants';
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
  const { transactions, totalDeposits, totalExpenses, totalCancellationFees, isLoading } = useTransactions();
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
  const isPositive = balance >= 0;
  const shouldHighlightIban = balance < 0 || (balance === 0 && upcomingBookings.length > 0);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({ title: `${label} skopírovaný` });
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
      case 'referral_bonus':
        return <ArrowUpRight className="h-4 w-4 text-success" />;
      case 'cancellation':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <ArrowDownRight className="h-4 w-4 text-destructive" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    return TRANSACTION_LABELS[type as keyof typeof TRANSACTION_LABELS] || type;
  };

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Financie</h1>
          <p className="text-muted-foreground">
            Prehľad vášho kreditu a transakcií
          </p>
        </div>

        {/* Balance card */}
        <Card className={cn(
          'relative overflow-hidden',
          isPositive ? 'border-success/30' : 'border-destructive/30'
        )}>
          <div className={cn(
            'absolute inset-0 opacity-5',
            isPositive ? 'bg-success' : 'bg-destructive'
          )} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Aktuálny zostatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-8 w-8 text-success" />
              ) : (
                <TrendingDown className="h-8 w-8 text-destructive" />
              )}
              <span className={cn(
                'text-4xl font-bold',
                isPositive ? 'text-success' : 'text-destructive'
              )}>
                {isPositive ? '+' : ''}{balance.toFixed(2)} €
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {isPositive 
                ? 'Máte dostupný kredit na tréningy' 
                : 'Máte neuhradený zostatok'
              }
            </p>
          </CardContent>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpRight className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-muted-foreground">Vklady</span>
              </div>
              <p className="text-xl font-bold text-success">{totalDeposits.toFixed(2)} €</p>
            </CardContent>
          </Card>
          
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">Výdavky</span>
              </div>
              <p className="text-xl font-bold text-destructive">{totalExpenses.toFixed(2)} €</p>
            </CardContent>
          </Card>
        </div>

        {/* Cancellation fees summary - only show if there are fees */}
        {totalCancellationFees > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-foreground">Storno poplatky celkom</span>
                </div>
                <span className="text-xl font-bold text-destructive">
                  -{totalCancellationFees.toFixed(2)} €
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platba prevodom */}
        {ibanValue && (
          <Card className={cn(
            shouldHighlightIban && 'border-warning/50 bg-warning/5'
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Landmark className="h-5 w-5" />
                Platba prevodom
              </CardTitle>
              <CardDescription>
                Ak si chceš doplniť kredit, môžeš poslať platbu prevodom.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">IBAN</p>
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
                    Skopírovať IBAN
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Poznámka k platbe</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">
                    {profile?.full_name || ''}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(profile?.full_name || '', 'Poznámka')}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Skopírovať
                  </Button>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>Platby sú spracovávané manuálne po ich prijatí na účet. Kredit bude pripísaný po zaevidovaní platby.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low credit info banner */}
        {shouldHighlightIban && (
          <div className="rounded-lg border border-warning/40 bg-warning/5 p-4 flex items-start gap-3 text-sm">
            <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-foreground">
              {balance < 0
                ? 'Máte záporný zostatok. Prosím, doplňte kredit prevodom na účet.'
                : 'Váš kredit nemusí pokryť nadchádzajúce tréningy. Zvážte doplnenie kreditu.'}
            </p>
          </div>
        )}

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">História transakcií</CardTitle>
            <CardDescription>
              Prehľad všetkých finančných pohybov
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Zatiaľ nemáte žiadne transakcie</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isPositiveAmount = transaction.amount > 0;
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full",
                          isPositiveAmount ? "bg-success/10" : "bg-destructive/10"
                        )}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'd. MMM yyyy, HH:mm', { locale: sk })}
                          </p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          isPositiveAmount ? "text-success" : "text-destructive"
                        )}>
                          {isPositiveAmount ? '+' : ''}{transaction.amount.toFixed(2)} €
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Zostatok: {transaction.balance_after.toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
