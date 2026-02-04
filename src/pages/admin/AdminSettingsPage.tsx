import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, CreditCard, Loader2, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [trainingPrice, setTrainingPrice] = useState('25.00');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'training_price')
        .single();

      if (error) throw error;
      if (data) {
        setTrainingPrice(data.value);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: trainingPrice })
        .eq('key', 'training_price');

      if (error) throw error;

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

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Nastavenia</h1>
          <p className="text-muted-foreground">
            Konfigurácia aplikácie
          </p>
        </div>

        {/* Training price */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Cena tréningu
            </CardTitle>
            <CardDescription>
              Základná cena jedného tréningu v eurách
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
            </div>
            
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">Storno poplatky pri cene {trainingPrice}€:</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>&gt;48h: <span className="text-success font-medium">0€</span></li>
                <li>24-48h: <span className="text-warning font-medium">{(parseFloat(trainingPrice) * 0.5).toFixed(2)}€</span> (50%)</li>
                <li>&lt;24h: <span className="text-destructive font-medium">{(parseFloat(trainingPrice) * 0.8).toFixed(2)}€</span> (80%)</li>
                <li>Neúčasť: <span className="text-destructive font-medium">{trainingPrice}€</span> (100%)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button onClick={handleSave} className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ukladám...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Uložiť nastavenia
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}
