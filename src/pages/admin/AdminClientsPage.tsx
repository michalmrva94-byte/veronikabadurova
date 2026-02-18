import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES, CLIENT_TYPE_LABELS } from '@/lib/constants';
import { Users, Search, User, CreditCard, Calendar, ChevronRight, Loader2, Clock, Check, X, Target, CalendarDays } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClientType } from '@/types/database';
import { Badge } from '@/components/ui/badge';

type FilterType = 'all' | 'active' | 'pending' | 'debt' | 'fixed' | 'flexible';

export default function AdminClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const { data: clients = [], isLoading, error } = useClients();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const pendingClients = clients.filter(c => c.approval_status === 'pending');
  const approvedClients = clients.filter(c => c.approval_status === 'approved');
  const rejectedClients = clients.filter(c => c.approval_status === 'rejected');

  // Apply filter
  const getFilteredClients = () => {
    let filtered = approvedClients;
    switch (filter) {
      case 'debt':
        filtered = approvedClients.filter(c => (c.balance ?? 0) < 0);
        break;
      case 'fixed':
        filtered = approvedClients.filter(c => c.client_type === 'fixed');
        break;
      case 'flexible':
        filtered = approvedClients.filter(c => c.client_type === 'flexible');
        break;
      case 'pending':
        return pendingClients.filter(c =>
          c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      default:
        break;
    }
    return filtered.filter(client =>
      client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredClients = getFilteredClients();

  const handleApprove = async (clientId: string, clientType: ClientType) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        approval_status: 'approved' as any, 
        client_type: clientType as any,
        approved_at: new Date().toISOString() 
      })
      .eq('id', clientId);

    if (error) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Nepodarilo sa schváliť klienta' });
    } else {
      toast({ title: 'Klient schválený', description: `Typ: ${CLIENT_TYPE_LABELS[clientType]}` });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  };

  const handleReject = async (clientId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approval_status: 'rejected' as any })
      .eq('id', clientId);

    if (error) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Nepodarilo sa zamietnuť klienta' });
    } else {
      toast({ title: 'Klient zamietnutý' });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Všetci' },
    { key: 'active', label: 'Aktívni' },
    { key: 'pending', label: 'Čakajúci' },
    { key: 'debt', label: 'Dlžníci' },
    { key: 'fixed', label: 'Fixní' },
    { key: 'flexible', label: 'Flexibilní' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Klienti</h1>
          <p className="text-muted-foreground">Správa vašich klientov</p>
        </div>

        {/* Pending approvals (show when not filtered to pending) */}
        {filter !== 'pending' && pendingClients.length > 0 && (
          <Card className="border-warning/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-warning">
                <Clock className="h-5 w-5" />
                Nové žiadosti ({pendingClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingClients.map((client) => (
                <PendingClientCard key={client.id} client={client} onApprove={handleApprove} onReject={handleReject} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Filter chips - horizontal scroll slider */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 inline-flex items-center gap-1 text-xs font-medium px-3 h-7 rounded-full transition-all whitespace-nowrap ${
                filter === f.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted'
              }`}
            >
              {f.label}
              {f.key === 'pending' && pendingClients.length > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold px-1 ${
                  filter === f.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-warning text-warning-foreground'
                }`}>{pendingClients.length}</span>
              )}
              {f.key === 'debt' && approvedClients.filter(c => (c.balance ?? 0) < 0).length > 0 && (
                <span className={`inline-flex items-center justify-center min-w-[16px] h-4 rounded-full text-[10px] font-bold px-1 ${
                  filter === f.key ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-destructive text-destructive-foreground'
                }`}>{approvedClients.filter(c => (c.balance ?? 0) < 0).length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Hľadať podľa mena alebo emailu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              {filter === 'pending' ? 'Čakajúci' : 'Klienti'} ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Načítavam klientov...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-12 w-12 text-destructive/50" />
                <p className="text-destructive">Chyba pri načítaní klientov</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Žiadni klienti</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map((client) => (
                  <Link
                    key={client.id}
                    to={ROUTES.ADMIN.CLIENT_DETAIL.replace(':id', client.id)}
                    className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{client.full_name}</p>
                          {client.client_type && (
                            <Badge variant="secondary" className="text-[10px]">
                              {CLIENT_TYPE_LABELS[client.client_type]}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span className={`${(client.balance ?? 0) < 0 ? 'text-destructive font-medium' : ''}`}>
                            {client.balance?.toFixed(2) ?? '0.00'}€
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rejected clients */}
        {rejectedClients.length > 0 && filter === 'all' && (
          <Card className="border-destructive/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-muted-foreground">
                <X className="h-5 w-5" />
                Zamietnuté žiadosti ({rejectedClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rejectedClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-foreground">{client.full_name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleApprove(client.id, 'flexible')}>
                      Schváliť dodatočne
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}

function PendingClientCard({ client, onApprove, onReject }: {
  client: any;
  onApprove: (id: string, type: ClientType) => void;
  onReject: (id: string) => void;
}) {
  const [selectedType, setSelectedType] = useState<ClientType>('flexible');

  return (
    <div className="p-4 rounded-xl border border-warning/20 bg-warning/5 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{client.full_name}</p>
          <p className="text-sm text-muted-foreground">{client.email}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(client.created_at), 'd. MMM yyyy, HH:mm', { locale: sk })}
          </p>
        </div>
      </div>

      {client.training_goal && (
        <div className="flex items-start gap-2 text-sm">
          <Target className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{client.training_goal}</span>
        </div>
      )}

      {client.preferred_days && (
        <div className="flex items-start gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <span className="text-muted-foreground">{client.preferred_days}</span>
        </div>
      )}

      {client.flexibility_note && (
        <p className="text-sm text-muted-foreground italic">„{client.flexibility_note}"</p>
      )}

      <div className="flex items-center gap-3 pt-2">
        <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ClientType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixný klient</SelectItem>
            <SelectItem value="flexible">Flexibilný klient</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={() => onApprove(client.id, selectedType)} className="gap-1">
          <Check className="h-4 w-4" />
          Schváliť
        </Button>
        <Button size="sm" variant="destructive" onClick={() => onReject(client.id)} className="gap-1">
          <X className="h-4 w-4" />
          Zamietnuť
        </Button>
      </div>
    </div>
  );
}
