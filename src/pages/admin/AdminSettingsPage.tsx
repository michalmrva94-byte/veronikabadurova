import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Loader2, Save, Landmark, ShieldAlert } from 'lucide-react';

interface CancellationFees {
  more_than_48h: number;
  between_24_48h: number;
  less_than_24h: number;
  no_show: number;
}

const DEFAULT_FEES: CancellationFees = {
  more_than_48h: 0,
  between_24_48h: 50,
  less_than_24h: 80,
  no_show: 100,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trainingPrice, setTrainingPrice] = useState('25.00');
  const [iban, setIban] = useState('');
  const [fees, setFees] = useState<CancellationFees>(DEFAULT_FEES);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .in('key', ['training_price', 'iban', 'cancellation_fees']);

      if (error) throw error;
      if (data) {
        const priceRow = data.find(r => r.key === 'training_price');
        const ibanRow = data.find(r => r.key === 'iban');
        const feesRow = data.find(r => r.key === 'cancellation_fees');
        if (priceRow) setTrainingPrice(priceRow.value);
        if (ibanRow) setIban(ibanRow.value);
        if (feesRow) {
          try {
            setFees({ ...DEFAULT_FEES, ...JSON.parse(feesRow.value) });
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error: priceError } = await supabase
        .from('app_settings')
        .update({ value: trainingPrice })
        .eq('key', 'training_price');
      if (priceError) throw priceError;

      const { error: ibanError } = await supabase
        .from('app_settings')
        .upsert({ key: 'iban', value: iban, description: 'IBAN pre platbu prevodom' }, { onConflict: 'key' });
      if (ibanError) throw ibanError;

      const { error: feesError } = await supabase
        .from('app_settings')
        .upsert({ key: 'cancellation_fees', value: JSON.stringify(fees), description: 'Storno poplatky v %' }, { onConflict: 'key' });
      if (feesError) throw feesError;

      toast({
        title: 'Uložené',
        description: 'Nastavenia boli aktualizované.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť nastavenia.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const price = parseFloat(trainingPrice) || 0;

  const updateFee = (key: keyof CancellationFees, value: string) => {
    const num = Math.min(100, Math.max(0, parseInt(value) || 0));
    setFees(prev => ({ ...prev, [key]: num }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Nastavenia</h1>
          <p className="text-muted-foreground">Konfigurácia aplikácie</p>
        </div>

        {/* Training price */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Cena tréningu
            </CardTitle>
            <CardDescription>Základná cena jedného tréningu v eurách</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="price">Cena (€)</Label>
            <Input
              id="price"
              type="number"
              value={trainingPrice}
              onChange={(e) => setTrainingPrice(e.target.value)}
              min="0"
              step="0.01"
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        {/* Cancellation fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5" />
              Storno poplatky
            </CardTitle>
            <CardDescription>Percentuálne poplatky podľa času do tréningu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {([
                { key: 'more_than_48h' as const, label: 'Viac ako 48 hodín', sublabel: '> 48h pred tréningom' },
                { key: 'between_24_48h' as const, label: '24 – 48 hodín', sublabel: '24-48h pred tréningom' },
                { key: 'less_than_24h' as const, label: 'Menej ako 24 hodín', sublabel: '< 24h pred tréningom' },
                { key: 'no_show' as const, label: 'Neúčasť', sublabel: 'Klient sa nedostavil' },
              ]).map(({ key, label, sublabel }) => (
                <div key={key} className="flex items-center justify-between gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{sublabel}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Input
                      type="number"
                      value={fees[key]}
                      onChange={(e) => updateFee(key, e.target.value)}
                      min="0"
                      max="100"
                      step="5"
                      className="w-16 h-8 text-sm text-center"
                      disabled={isLoading}
                    />
                    <span className="text-sm text-muted-foreground w-4">%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Náhľad poplatkov pri cene {price.toFixed(2)}€:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>&gt;48h: <span className="text-success font-medium">{(price * fees.more_than_48h / 100).toFixed(2)}€</span> ({fees.more_than_48h}%)</li>
                <li>24-48h: <span className="text-warning font-medium">{(price * fees.between_24_48h / 100).toFixed(2)}€</span> ({fees.between_24_48h}%)</li>
                <li>&lt;24h: <span className="text-destructive font-medium">{(price * fees.less_than_24h / 100).toFixed(2)}€</span> ({fees.less_than_24h}%)</li>
                <li>Neúčasť: <span className="text-destructive font-medium">{(price * fees.no_show / 100).toFixed(2)}€</span> ({fees.no_show}%)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* IBAN */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Landmark className="h-5 w-5" />
              IBAN pre platby
            </CardTitle>
            <CardDescription>IBAN účet, na ktorý budú klienti posielať platby prevodom</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="iban">IBAN</Label>
            <Input
              id="iban"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="SK31 1200 0000 1987 4263 7541"
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        {/* Save button */}
        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Ukladám...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />Uložiť nastavenia</>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
