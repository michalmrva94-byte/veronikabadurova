import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Plus, Users, Loader2, User } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useAddCredit } from '@/hooks/useAddCredit';
import { useAdminFinancesStats, useClientsWithDebt } from '@/hooks/useAdminFinances';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminFinancesPage() {
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: stats, isLoading: statsLoading } = useAdminFinancesStats();
  const { data: clientsWithDebt = [], isLoading: debtLoading } = useClientsWithDebt();
  const addCredit = useAddCredit();

  const handleAddCredit = async () => {
    if (!selectedClient || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Zadajte platnú sumu');
      return;
    }

    try {
      await addCredit.mutateAsync({
        clientId: selectedClient,
        amount: numAmount,
        description: description || undefined,
      });
      
      const clientName = clients.find(c => c.id === selectedClient)?.full_name;
      toast.success(`Kredit ${numAmount.toFixed(2)}€ bol pridaný pre ${clientName}`);
      
      // Reset form
      setSelectedClient('');
      setAmount('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa pridať kredit');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Financie</h1>
          <p className="text-muted-foreground">
            Prehľad financií a správa kreditov
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">Kredity</span>
              </div>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <p className="text-xl font-bold text-success">{(stats?.totalCredits ?? 0).toFixed(0)}€</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Dlhy</span>
              </div>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <p className="text-xl font-bold text-destructive">{(stats?.totalDebts ?? 0).toFixed(0)}€</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Mesiac</span>
              </div>
              {statsLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <p className="text-xl font-bold">{(stats?.monthlyRevenue ?? 0).toFixed(0)}€</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add credit form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Pridať kredit
            </CardTitle>
            <CardDescription>
              Zaznamenajte vklad od klienta
            </CardDescription>
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
                    <SelectItem value="none" disabled>
                      Žiadni klienti
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex items-center gap-2">
                          <span>{client.full_name}</span>
                          <span className="text-muted-foreground text-xs">
                            ({(client.balance ?? 0).toFixed(2)}€)
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Suma (€)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>Poznámka (voliteľné)</Label>
              <Input
                placeholder="Napr. Hotovosť, Prevod..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              disabled={!selectedClient || !amount || addCredit.isPending}
              onClick={handleAddCredit}
            >
              {addCredit.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Pridávam...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Pridať kredit
                </>
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
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clientsWithDebt.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Žiadni klienti nemajú neuhradený zostatok
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clientsWithDebt.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                        <User className="h-5 w-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{client.full_name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-destructive">
                      {(client.balance ?? 0).toFixed(2)}€
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
