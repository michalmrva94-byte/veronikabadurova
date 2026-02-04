import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { CreditCard, TrendingUp, TrendingDown, Plus, Users } from 'lucide-react';

export default function AdminFinancesPage() {
  const [selectedClient, setSelectedClient] = useState('');
  const [amount, setAmount] = useState('');

  // Placeholder stats
  const stats = {
    totalCredits: 0,
    totalDebts: 0,
    monthlyRevenue: 0,
  };

  // Placeholder - no clients yet
  const clients: any[] = [];

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
              <p className="text-xl font-bold text-success">{stats.totalCredits.toFixed(0)}€</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-xs text-muted-foreground">Dlhy</span>
              </div>
              <p className="text-xl font-bold text-destructive">{stats.totalDebts.toFixed(0)}€</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Mesiac</span>
              </div>
              <p className="text-xl font-bold">{stats.monthlyRevenue.toFixed(0)}€</p>
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
                  {clients.length === 0 ? (
                    <SelectItem value="none" disabled>
                      Žiadni klienti
                    </SelectItem>
                  ) : (
                    clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.full_name}
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

            <Button className="w-full" disabled={!selectedClient || !amount}>
              <Plus className="mr-2 h-4 w-4" />
              Pridať kredit
            </Button>
          </CardContent>
        </Card>

        {/* Clients with debt */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Klienti s dlhom</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Žiadni klienti nemajú neuhradený zostatok
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
