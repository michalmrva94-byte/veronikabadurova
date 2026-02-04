import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CreditCard, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TRANSACTION_LABELS } from '@/lib/constants';

export default function FinancesPage() {
  const { profile } = useAuth();
  const balance = profile?.balance ?? 0;
  const isPositive = balance >= 0;

  // Placeholder transactions - will be replaced with real data
  const transactions: any[] = [];

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
              <p className="text-xl font-bold text-success">0.00 €</p>
            </CardContent>
          </Card>
          
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownRight className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium text-muted-foreground">Výdavky</span>
              </div>
              <p className="text-xl font-bold text-destructive">0.00 €</p>
            </CardContent>
          </Card>
        </div>

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">História transakcií</CardTitle>
            <CardDescription>
              Prehľad všetkých finančných pohybov
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Zatiaľ nemáte žiadne transakcie</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Transactions will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
