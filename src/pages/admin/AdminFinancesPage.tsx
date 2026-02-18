import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Euro, TrendingUp, TrendingDown, Plus, Users, Loader2, User, History, CreditCard, ArrowRight, Wallet } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAddCredit } from '@/hooks/useAddCredit';
import { useAdminFinancesStats, useClientsWithDebt, FinancePeriod, FinanceDateRange } from '@/hooks/useAdminFinances';
import { DashboardHistoryPicker } from '@/components/admin/DashboardHistoryPicker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { TRANSACTION_LABELS, ROUTES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/admin/KPICard';
import { Link } from 'react-router-dom';

export default function AdminFinancesPage() {
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentType, setPaymentType] = useState('prevod');
  const [period, setPeriod] = useState<FinancePeriod>('month');
  const [customRange, setCustomRange] = useState<FinanceDateRange | null>(null);

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: stats, isLoading: statsLoading } = useAdminFinancesStats(period, customRange);
  const { data: clientsWithDebt = [], isLoading: debtLoading } = useClientsWithDebt();
  const addCredit = useAddCredit();

  const periodLabel = customRange?.label
    ? customRange.label
    : period === 'week' ? 'tento týždeň' : 'tento mesiac';

  // Transaction history - FIXED: explicit foreign key hint
  const { data: recentTransactions = [], isLoading: transLoading } = useQuery({
    queryKey: ['admin-all-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*, client:profiles!transactions_client_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    staleTime: 30 * 1000,
  });

  const handleAddCredit = async () => {
    if (!selectedClient || !amount) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Zadajte platnú sumu');
      return;
    }
    try {
      const desc = description || `Vklad - ${paymentType}`;
      await addCredit.mutateAsync({ clientId: selectedClient, amount: numAmount, description: desc, paidMethod: paymentType });
      const clientName = clients.find(c => c.id === selectedClient)?.full_name;
      toast.success(`Kredit ${numAmount.toFixed(2)}€ bol pridaný pre ${clientName}`);
      setSelectedClient('');
      setAmount('');
      setDescription('');
      setPaymentType('prevod');
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa pridať kredit');
    }
  };

  const netChange = (stats?.deposits ?? 0) - (stats?.creditUsage ?? 0);

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Financie</h1>
          <p className="text-muted-foreground">Prehľad financií a správa kreditov</p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-muted/60 rounded-xl p-0.5 h-8">
            <button
              onClick={() => { setPeriod('week'); setCustomRange(null); }}
              className={`text-xs rounded-lg px-3 h-7 transition-all ${
                !customRange && period === 'week'
                  ? 'bg-background shadow-sm font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Týždeň
            </button>
            <button
              onClick={() => { setPeriod('month'); setCustomRange(null); }}
              className={`text-xs rounded-lg px-3 h-7 transition-all ${
                !customRange && period === 'month'
                  ? 'bg-background shadow-sm font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mesiac
            </button>
          </div>
          <DashboardHistoryPicker
            onSelectRange={(range) => setCustomRange({ start: range.start, end: range.end, label: range.label })}
            currentRange={customRange ? { start: customRange.start, end: customRange.end, label: customRange.label || '' } : null}
            onClear={() => setCustomRange(null)}
          />
        </div>

        {/* Period indicator when custom */}
        {customRange && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span>Zobrazené obdobie:</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {customRange.label}
            </Badge>
          </div>
        )}

        {/* 4 KPI Cards - 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            icon={<Euro className="h-4 w-4 text-success" />}
            title={`Čistý zárobok`}
            tooltip="Reálny výnos z tréningov a storno poplatkov v období. Nezahŕňa kreditné vklady."
            mainValue={`${(stats?.earned ?? 0).toFixed(0)}€`}
            mainColor="success"
            loading={statsLoading}
            trend={stats ? { current: stats.earned, previous: stats.prevEarned } : undefined}
          />
          <KPICard
            icon={<Wallet className="h-4 w-4 text-primary" />}
            title={`Vklady`}
            tooltip="Suma všetkých kreditných vkladov od klientov v období."
            mainValue={`${(stats?.deposits ?? 0).toFixed(0)}€`}
            mainColor="primary"
            loading={statsLoading}
            trend={stats ? { current: stats.deposits, previous: stats.prevDeposits } : undefined}
          />
          <KPICard
            icon={<TrendingDown className="h-4 w-4 text-destructive" />}
            title="Dlhy klientov"
            tooltip="Celkový dlh — súčet negatívnych zostatkov všetkých klientov."
            mainValue={`${(stats?.totalDebts ?? 0).toFixed(0)}€`}
            mainColor="destructive"
            loading={statsLoading}
          />
          <KPICard
            icon={<CreditCard className="h-4 w-4 text-primary" />}
            title="Zostatok kreditov"
            tooltip="Koľko € je ešte v systéme — súčet pozitívnych zostatkov klientov."
            mainValue={`${(stats?.totalCredits ?? 0).toFixed(0)}€`}
            mainColor="primary"
            loading={statsLoading}
          />
        </div>

        {/* Credit Flow Block */}
        <Card>
          <CardContent className="p-4">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-3">
              Kreditný tok / {periodLabel}
            </p>
            {statsLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Vklady</p>
                  <p className="text-lg font-bold text-success">{(stats?.deposits ?? 0).toFixed(0)}€</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vyčerpané</p>
                  <p className="text-lg font-bold text-foreground">{(stats?.creditUsage ?? 0).toFixed(0)}€</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Čistá zmena</p>
                  <p className={cn('text-lg font-bold', netChange >= 0 ? 'text-success' : 'text-destructive')}>
                    {netChange >= 0 ? '+' : ''}{netChange.toFixed(0)}€
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add credit form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Pridať kredit
            </CardTitle>
            <CardDescription>Zaznamenajte vklad od klienta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Klient</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Vyberte klienta" />
                </SelectTrigger>
                <SelectContent>
                  {clientsLoading ? (
                    <SelectItem value="loading" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Načítavam...
                      </div>
                    </SelectItem>
                  ) : clients.length === 0 ? (
                    <SelectItem value="none" disabled>Žiadni klienti</SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <span>{client.full_name}</span>
                          <span className="text-muted-foreground text-xs">({(client.balance ?? 0).toFixed(2)}€)</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Suma (€)</Label>
                <Input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Typ platby</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prevod">Prevod</SelectItem>
                    <SelectItem value="hotovost">Hotovosť</SelectItem>
                    <SelectItem value="iny">Iný</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámka (voliteľné)</Label>
              <Input placeholder="Napr. poznámka k platbe..." value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button className="w-full" disabled={!selectedClient || !amount || addCredit.isPending} onClick={handleAddCredit}>
              {addCredit.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Pridávam...</>
              ) : (
                <><Plus className="mr-2 h-4 w-4" />Pridať kredit</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Clients with debt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Klienti s dlhom</CardTitle>
          </CardHeader>
          <CardContent>
            {debtLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : clientsWithDebt.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Žiadni klienti nemajú neuhradený zostatok</p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsWithDebt.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <User className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-destructive">{((client as any).debt_balance ?? 0).toFixed(2)}€</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5" />
                História platieb
              </CardTitle>
              <Link
                to={ROUTES.ADMIN.FINANCE_HISTORY}
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Kompletná história <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {transLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : recentTransactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Žiadne transakcie</p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{t.client?.full_name || '—'}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {TRANSACTION_LABELS[t.type as keyof typeof TRANSACTION_LABELS] || t.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), 'd. MMM yyyy, HH:mm', { locale: sk })}</p>
                    </div>
                    <span className={cn('text-sm font-bold', t.amount >= 0 ? 'text-success' : 'text-destructive')}>
                      {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
