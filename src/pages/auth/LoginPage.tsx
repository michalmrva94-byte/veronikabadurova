import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { Loader2, Waves } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, waitForRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba prihlásenia',
        description: error.message === 'Invalid login credentials' 
          ? 'Nesprávny email alebo heslo'
          : error.message,
      });
      setIsLoading(false);
      return;
    }

    // Wait for role and redirect accordingly
    const userRole = await waitForRole();

    if (userRole === 'admin') {
      toast({
        title: 'Vitaj späť! 👋',
        description: 'Úspešne si sa prihlásila do admin panelu.',
      });
      navigate(ROUTES.ADMIN.DASHBOARD);
    } else {
      toast({
        title: 'Vitajte späť!',
        description: 'Úspešne ste sa prihlásili.',
      });
      navigate(ROUTES.DASHBOARD);
    }
  };

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
          <CardTitle className="text-2xl font-bold">Prihlásenie</CardTitle>
          <CardDescription>
            Zadajte svoje prihlasovacie údaje
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.sk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Heslo</Label>
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
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Prihlasujem...
                </>
              ) : (
                'Prihlásiť sa'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Nemáte účet?{' '}
              <Link 
                to={ROUTES.REGISTER} 
                className="font-medium text-primary hover:underline"
              >
                Zaregistrujte sa
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
