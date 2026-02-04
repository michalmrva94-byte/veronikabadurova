import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { Loader2, Shield, Waves } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import veronikaPhoto from '@/assets/veronika-photo.png';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signOut, waitForRole } = useAuth();
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

    // Počkať na načítanie role pred navigáciou
    const userRole = await waitForRole();
    
    if (userRole !== 'admin') {
      await signOut();
      toast({
        variant: 'destructive',
        title: 'Prístup zamietnutý',
        description: 'Tento účet nemá admin oprávnenia.',
      });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Vitaj späť, Veronika! 👋',
      description: 'Úspešne si sa prihlásila do admin panelu.',
    });

    navigate(ROUTES.ADMIN.DASHBOARD);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-4">
        <Avatar className="h-20 w-20 ring-4 ring-primary/20">
          <AvatarImage src={veronikaPhoto} alt="Veronika" />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">V</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">Veronika Swim</h1>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Admin Panel</span>
          </div>
        </div>
      </div>

      {/* iOS-style Login Form */}
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-semibold">Prihlásenie</h2>
          <p className="text-sm text-muted-foreground">
            Zadaj svoje prihlasovacie údaje
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* iOS-style Inset Grouped Inputs */}
          <div className="ios-card overflow-hidden">
            <div className="divide-y divide-border/50">
              <div className="p-4">
                <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="veronika@email.sk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-0 bg-transparent p-0 h-8 text-base focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="p-4">
                <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wide">
                  Heslo
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-0 bg-transparent p-0 h-8 text-base focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-base font-semibold ios-press" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Prihlasujem...
              </>
            ) : (
              'Prihlásiť sa'
            )}
          </Button>
        </form>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground">
          Prístup len pre administrátorov
        </p>
      </div>
    </div>
  );
}
