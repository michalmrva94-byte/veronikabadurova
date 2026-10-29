import { useState } from 'react';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check } from 'lucide-react';

export default function SDSettingsPage() {
  const { club, profile } = useSDAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const inviteLink = club?.id
    ? `${window.location.origin}/registracia?club=${club.id}`
    : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Odkaz skopírovaný' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Chyba', description: 'Nepodarilo sa skopírovať odkaz.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Nastavenia</h1>
        <p className="text-muted-foreground mt-1">Nastavenia klubu a účtu</p>
      </div>

      {/* Club info */}
      <Card>
        <CardHeader>
          <CardTitle>Informácie o klube</CardTitle>
          <CardDescription>Základné údaje vášho plaveckého klubu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Názov klubu</Label>
            <Input value={club?.name || ''} disabled />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Vaše meno</Label>
              <Input value={`${profile?.first_name || ''} ${profile?.last_name || ''}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Rola</Label>
              <Input value={profile?.role === 'admin' ? 'Administrátor' : 'Tréner'} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invite coaches */}
      {profile?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Pozvať trénerov</CardTitle>
            <CardDescription>
              Zdieľajte tento odkaz s trénermi, aby sa mohli pripojiť ku klubu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={handleCopy} className="flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tréneri sa po registrácii automaticky pridajú do vášho klubu
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
