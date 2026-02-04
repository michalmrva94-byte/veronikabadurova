import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Bell, Mail, Phone, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    notifications_enabled: profile?.notifications_enabled ?? true,
    email_notifications: profile?.email_notifications ?? true,
  });

  const handleSave = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          notifications_enabled: formData.notifications_enabled,
          email_notifications: formData.email_notifications,
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: 'Uložené',
        description: 'Vaše údaje boli aktualizované.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť zmeny.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Profil</h1>
          <p className="text-muted-foreground">
            Spravujte svoje osobné údaje
          </p>
        </div>

        {/* Personal info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Osobné údaje
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email nie je možné zmeniť</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="full_name">Meno a priezvisko</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefón</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+421 xxx xxx xxx"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5" />
              Notifikácie
            </CardTitle>
            <CardDescription>
              Nastavte si, aké upozornenia chcete dostávať
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>In-app notifikácie</Label>
                <p className="text-sm text-muted-foreground">
                  Upozornenia v aplikácii
                </p>
              </div>
              <Switch
                checked={formData.notifications_enabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, notifications_enabled: checked }))
                }
                disabled={isLoading}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Label>Email notifikácie</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Potvrdenia rezervácií, pripomienky, last-minute ponuky
                </p>
              </div>
              <Switch
                checked={formData.email_notifications}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, email_notifications: checked }))
                }
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Referral code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Váš odporúčací kód</CardTitle>
            <CardDescription>
              Zdieľajte kód s priateľmi a získajte tréning zdarma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input
                value={profile?.referral_code || ''}
                readOnly
                className="font-mono text-lg font-bold bg-muted"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(profile?.referral_code || '');
                  toast({
                    title: 'Skopírované!',
                    description: 'Odporúčací kód bol skopírovaný do schránky.',
                  });
                }}
              >
                Kopírovať
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <Button 
          onClick={handleSave} 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Ukladám...
            </>
          ) : (
            'Uložiť zmeny'
          )}
        </Button>
      </div>
    </ClientLayout>
  );
}
