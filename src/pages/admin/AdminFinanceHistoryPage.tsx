import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { History, Loader2, ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { TRANSACTION_LABELS, ROUTES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const PAGE_SIZE = 25;

export default function AdminFinanceHistoryPage() {
  const [page, setPage] = useState(0);
  const [clientFilter, setClientFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: clients = [] } = useClients();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-finance-history', page, clientFilter, typeFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('transactions')
        .select('*, client:profiles!transactions_client_id_fkey(full_name)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      if (clientFilter !== 'all') {
        query = query.eq('client_id', clientFilter);
      }
      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter as any);
      }
      if (dateFrom) {
        query = query.gte('created_at', new Date(dateFrom).toISOString());
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query = query.lte('created_at', to.toISOString());
      }

      const { data: rows, error, count } = await query;
      if (error) throw error;
      return { rows: rows || [], count: count ?? 0 };
    },
    staleTime: 15 * 1000,
  });

  const totalPages = Math.ceil((data?.count ?? 0) / PAGE_SIZE);

  const resetFilters = () => {
    setClientFilter('all');
    setTypeFilter('all');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link to={ROUTES.ADMIN.FINANCES}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">História transakcií</h1>
            <p className="text-muted-foreground text-sm">Kompletný prehľad všetkých transakcií</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Od</Label>
                <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(0); }} className="h-9 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Do</Label>
                <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(0); }} className="h-9 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Klient</Label>
                <Select value={clientFilter} onValueChange={(v) => { setClientFilter(v); setPage(0); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetci</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.full_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Typ</Label>
                <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(0); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky</SelectItem>
                    <SelectItem value="deposit">Vklad</SelectItem>
                    <SelectItem value="training">Tréning</SelectItem>
                    <SelectItem value="cancellation">Storno</SelectItem>
                    <SelectItem value="referral_bonus">Odmena</SelectItem>
                    <SelectItem value="manual_adjustment">Manuálna</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {(clientFilter !== 'all' || typeFilter !== 'all' || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs">
                Zrušiť filtre
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Transactions list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Transakcie ({data?.count ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (data?.rows.length ?? 0) === 0 ? (
              <p className="text-center text-muted-foreground py-6">Žiadne transakcie pre zvolené filtre</p>
            ) : (
              <div className="space-y-2">
                {data!.rows.map((t: any) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Predošlá
                </Button>
                <span className="text-xs text-muted-foreground">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                >
                  Ďalšia <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
