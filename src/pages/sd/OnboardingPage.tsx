import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function SDOnboardingPage() {
  const [clubName, setClubName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, createClubAndProfile } = useSDAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await createClubAndProfile(clubName, firstName, lastName);

    if (error) {
      toast({
        title: 'Chyba',
        description: error.message || 'Nepodarilo sa vytvoriť klub.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    toast({ title: 'Klub vytvorený!', description: `Vitajte v ${clubName}` });
    navigate(SD_ROUTES.DASHBOARD);
  };

  if (!user) {
    navigate(SD_ROUTES.LOGIN);
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A1628] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Nastavte svoj klub</CardTitle>
          <CardDescription>Zadajte názov plaveckého klubu a vaše údaje</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clubName">Názov klubu</Label>
              <Input
                id="clubName"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                placeholder="PK Bratislava"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vaše meno</Label>
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
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Vytváranie...' : 'Vytvoriť klub'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
