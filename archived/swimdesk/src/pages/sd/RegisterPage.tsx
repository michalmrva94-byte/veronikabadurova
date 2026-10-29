import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SDRegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useSDAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signUp(email, password, firstName, lastName);

    if (error) {
      toast({
        title: 'Chyba registrácie',
        description: error.message || 'Nepodarilo sa vytvoriť účet.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Účet vytvorený',
      description: 'Teraz nastavte svoj klub.',
    });

    navigate(SD_ROUTES.ONBOARDING);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Registrácia</CardTitle>
          <CardDescription>Vytvorte si účet pre SwimDesk Coach</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Meno</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ján"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Priezvisko</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Novák"
                  required
                />
              </div>
            </div>
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
                placeholder="Minimálne 6 znakov"
                minLength={6}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Vytváranie účtu...' : 'Vytvoriť účet'}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Už máte účet?{' '}
            <Link to={SD_ROUTES.LOGIN} className="text-primary font-medium hover:underline">
              Prihláste sa
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
