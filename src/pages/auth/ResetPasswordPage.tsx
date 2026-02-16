import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { Loader2, Waves } from 'lucide-react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    // Also check URL hash for recovery token
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Heslá sa nezhodujú.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: 'Heslo musí mať aspoň 6 znakov.',
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Heslo zmenené',
      description: 'Vaše heslo bolo úspešne zmenené.',
    });

    navigate(ROUTES.LOGIN);
  };

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Waves className="h-7 w-7" />
          </div>
          <span className="text-2xl font-bold text-foreground">Veronika Swim</span>
        </div>
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader>
            <CardTitle>Neplatný odkaz</CardTitle>
            <CardDescription>
              Tento odkaz na obnovenie hesla je neplatný alebo vypršal. Požiadajte o nový.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(ROUTES.LOGIN)} className="w-full">
              Späť na prihlásenie
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Waves className="h-7 w-7" />
        </div>
        <span className="text-2xl font-bold text-foreground">Veronika Swim</span>
      </div>

      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Nové heslo</CardTitle>
          <CardDescription>Zadajte svoje nové heslo.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nové heslo</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrďte heslo</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : (
                'Zmeniť heslo'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
