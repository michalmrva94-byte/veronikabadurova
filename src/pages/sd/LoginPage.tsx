import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SDLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, profile } = useSDAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Chyba prihlásenia',
        description: 'Nesprávny email alebo heslo.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Wait a moment for profile to load
    setTimeout(() => {
      navigate(SD_ROUTES.DASHBOARD);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">SwimDesk Coach</CardTitle>
          <CardDescription>Prihláste sa do svojho účtu</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vas@email.sk"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Prihlasovanie...' : 'Prihlásiť sa'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Nemáte účet?{' '}
            <Link to={SD_ROUTES.REGISTER} className="text-primary font-medium hover:underline">
              Zaregistrujte sa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
