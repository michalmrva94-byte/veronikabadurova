import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle, Loader2, Landmark, Copy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSACTION_LABELS } from '@/lib/constants';
import { useTransactions } from '@/hooks/useTransactions';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const formatIBAN = (iban: string) => iban.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();

export default function FinancesPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { transactions, isLoading, filter, setFilter, hasMore, loadMore } = useTransactions();

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
  const debtBalance = (profile as any)?.debt_balance ?? 0;
  const netBalance = balance - debtBalance;

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

        {/* 1. Môj zostatok */}
        <Card className={cn(
          "relative overflow-hidden",
          netBalance > 0 && "border-success/30",
          netBalance === 0 && "border-muted",
          netBalance < 0 && "border-destructive/30"
        )}>
          <div className={cn(
            "absolute inset-0 opacity-5",
            netBalance > 0 && "bg-success",
            netBalance < 0 && "bg-destructive"
          )} />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Môj zostatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={cn(
              "text-4xl font-bold",
              netBalance > 0 && "text-success",
              netBalance === 0 && "text-muted-foreground",
              netBalance < 0 && "text-destructive"
            )}>
              {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)} €
            </p>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {netBalance > 0 && "Máte k dispozícii kredit na ďalšie tréningy. Teším sa na ďalšiu spoločnú hodinu."}
              {netBalance === 0 && "Momentálne nemáte kredit ani dlh. Tréning si môžete pokojne rezervovať, platbu vyriešime neskôr."}
              {netBalance < 0 && "Momentálne evidujeme neuhradený zostatok. Keď vám to bude vyhovovať, môžete ho uhradiť prevodom alebo v hotovosti."}
            </p>
          </CardContent>
        </Card>

        {/* 2. Ako uhradiť platbu */}
        {ibanValue && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" />
                Ako uhradiť platbu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
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
                  Skopírovať
                </Button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Platbu môžete uhradiť prevodom alebo osobne v hotovosti.
                <br />
                Kredit pripíšem hneď, ako platbu zaevidujem.
              </p>
            </CardContent>
          </Card>
        )}

        {/* 3. História platieb a tréningov */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">História platieb a tréningov</CardTitle>
            <CardDescription>
              Prehľad všetkých pohybov na vašom účte.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filter chips */}
            <div className="flex gap-2 flex-wrap mb-4">
              {([
                { value: 'all', label: 'Všetko' },
                { value: 'deposits', label: 'Vklady' },
                { value: 'trainings', label: 'Tréningy' },
                { value: 'fees', label: 'Storno' },
                { value: 'debt', label: 'Dlh' },
              ] as const).map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setFilter(chip.value)}
                  className={cn(
                    'text-xs rounded-full px-3 py-1.5 transition-all border',
                    filter === chip.value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-10 w-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Zatiaľ tu nie je žiadna história. Keď prebehne prvá platba alebo tréning, zobrazí sa tu.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((transaction) => {
                  const isDebtIncrease = transaction.direction === 'debt_increase';
                  const isPositiveAmount = transaction.amount > 0;
                  return (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full",
                          isPositiveAmount ? "bg-success/10" : "bg-destructive/10"
                        )}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(transaction.created_at), 'd. MMM yyyy', { locale: sk })}
                          </p>
                        </div>
                      </div>
                      <p className={cn(
                        "text-sm font-semibold",
                        isDebtIncrease ? "text-destructive" : isPositiveAmount ? "text-success" : "text-destructive"
                      )}>
                        {isDebtIncrease ? `+${Math.abs(transaction.amount).toFixed(2)}` : (isPositiveAmount ? '+' : '') + transaction.amount.toFixed(2)} €
                      </p>
                    </div>
                  );
                })}
                {hasMore && (
                  <Button variant="ghost" className="w-full" onClick={loadMore}>
                    Načítať viac
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
