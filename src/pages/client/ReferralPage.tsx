import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Gift, Copy, Share2, Users, CheckCircle } from 'lucide-react';

export default function ReferralPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const referralCode = profile?.referral_code || '';
  const referralLink = `${window.location.origin}/referral?code=${referralCode}`;

  // Placeholder stats - will be replaced with real data
  const stats = {
    totalReferred: 0,
    pendingRewards: 0,
    earnedCredits: 0,
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Skopírované!',
      description: `${label} bol skopírovaný do schránky.`,
    });
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Veronika Swim',
          text: 'Pripoj sa k tréningom plávania s Veronikou! Použi môj odporúčací kód:',
          url: referralLink,
        });
      } catch (error) {
        // User cancelled or share failed
      }
    } else {
      copyToClipboard(referralLink, 'Link');
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Odporúčanie</h1>
          <p className="text-muted-foreground">
            Pozvite priateľov a získajte tréning zdarma
          </p>
        </div>

        {/* How it works */}
        <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Ako to funguje?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </div>
                <p className="text-sm text-muted-foreground">
                  Zdieľajte svoj odporúčací kód alebo link s priateľmi
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </div>
                <p className="text-sm text-muted-foreground">
                  Priateľ sa zaregistruje pomocou vášho kódu
                </p>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  3
                </div>
                <p className="text-sm text-muted-foreground">
                  Po jeho prvom odplávanom tréningu získate <strong className="text-primary">25€ kredit</strong>
                </p>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Referral code */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Váš odporúčací kód</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={referralCode}
                readOnly
                className="font-mono text-xl font-bold text-center bg-muted tracking-widest"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralCode, 'Kód')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Referral link */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Odporúčací link</CardTitle>
            <CardDescription>
              Priateľ sa môže zaregistrovať priamo cez tento link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralLink, 'Link')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={shareLink} className="w-full">
              <Share2 className="mr-2 h-4 w-4" />
              Zdieľať link
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold">{stats.totalReferred}</p>
              <p className="text-xs text-muted-foreground">Pozvaných</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-5 w-5 mx-auto mb-2 text-warning" />
              <p className="text-2xl font-bold">{stats.pendingRewards}</p>
              <p className="text-xs text-muted-foreground">Čakajúce</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Gift className="h-5 w-5 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold">{stats.earnedCredits}€</p>
              <p className="text-xs text-muted-foreground">Získané</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ClientLayout>
  );
}
