import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ROUTES, DAY_NAMES } from '@/lib/constants';
import { Loader2, Waves } from 'lucide-react';

const DAYS_OPTIONS = DAY_NAMES.slice(1).concat(DAY_NAMES.slice(0, 1)); // Po-Ne order

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    trainingGoal: '',
    preferredDays: [] as string[],
    flexibilityNote: '',
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Heslá sa nezhodujú' });
      return;
    }

    if (formData.password.length < 6) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Heslo musí mať aspoň 6 znakov' });
      return;
    }

    if (!formData.agreeToTerms) {
      toast({ variant: 'destructive', title: 'Chyba', description: 'Musíte súhlasiť s obchodnými podmienkami' });
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      undefined,
      formData.trainingGoal,
      formData.preferredDays.join(', '),
      formData.flexibilityNote
    );

    if (error) {
      const description = error.message?.includes('rate limit')
        ? 'Príliš veľa pokusov o registráciu. Skúste to znova o hodinu.'
        : error.message;
      toast({ variant: 'destructive', title: 'Chyba registrácie', description });
      setIsLoading(false);
      return;
    }

    toast({
      title: 'Žiadosť odoslaná!',
      description: 'Vaša žiadosť o spoluprácu bola odoslaná. Čakajte na schválenie trénerom.',
    });

    navigate(ROUTES.LOGIN);
  };

  const updateField = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDays: prev.preferredDays.includes(day)
        ? prev.preferredDays.filter(d => d !== day)
        : [...prev.preferredDays, day],
    }));
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
          <CardTitle className="text-2xl font-bold">Žiadosť o spoluprácu</CardTitle>
          <CardDescription>
            Vyplňte formulár a počkajte na schválenie trénerom
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Meno a priezvisko</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ján Novák"
                value={formData.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vas@email.sk"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
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
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
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
                value={formData.confirmPassword}
                onChange={(e) => updateField('confirmPassword', e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {/* Onboarding fields */}
            <div className="space-y-2">
              <Label htmlFor="trainingGoal">Aký je váš cieľ? *</Label>
              <Textarea
                id="trainingGoal"
                placeholder="Napr. naučiť sa plávať, zlepšiť techniku, kondičné plávanie..."
                value={formData.trainingGoal}
                onChange={(e) => updateField('trainingGoal', e.target.value)}
                required
                disabled={isLoading}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Preferované dni tréningov</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OPTIONS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      formData.preferredDays.includes(day)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="flexibilityNote">Poznámka o flexibilite (voliteľné)</Label>
              <Textarea
                id="flexibilityNote"
                placeholder="Napr. môžem len popoludní, víkendy preferujem ráno..."
                value={formData.flexibilityNote}
                onChange={(e) => updateField('flexibilityNote', e.target.value)}
                disabled={isLoading}
                className="min-h-[60px]"
              />
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => updateField('agreeToTerms', !!checked)}
                disabled={isLoading}
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm leading-relaxed text-muted-foreground cursor-pointer"
              >
                Súhlasím s{' '}
                <span className="font-medium text-primary hover:underline">obchodnými podmienkami</span>
                {' '}a{' '}
                <span className="font-medium text-primary hover:underline">storno pravidlami</span>
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Odosielam žiadosť...
                </>
              ) : (
                'Odoslať žiadosť'
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Už máte účet?{' '}
              <Link to={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
                Prihláste sa
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Cancellation policy info */}
      <div className="mt-6 max-w-md rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-2">Storno pravidlá:</p>
        <ul className="space-y-1">
          <li>• Zrušenie &gt;48h pred tréningom: <span className="text-success font-medium">0%</span></li>
          <li>• Zrušenie 24-48h pred tréningom: <span className="text-warning font-medium">50%</span></li>
          <li>• Zrušenie &lt;24h pred tréningom: <span className="text-destructive font-medium">80%</span></li>
          <li>• Neúčasť bez zrušenia: <span className="text-destructive font-medium">100%</span></li>
        </ul>
      </div>
    </div>
  );
}
