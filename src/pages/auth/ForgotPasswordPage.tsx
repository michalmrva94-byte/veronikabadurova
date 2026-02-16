import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ROUTES } from '@/lib/constants';
import { Loader2, Waves, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-hesla`,
    });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Chyba',
        description: error.message,
      });
      setIsLoading(false);
      return;
    }

    setIsSent(true);
    setIsLoading(false);
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
        {isSent ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-2">
                <CheckCircle className="h-12 w-12 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Email odoslaný</CardTitle>
              <CardDescription>
                Skontrolujte svoju emailovú schránku <strong>{email}</strong> a kliknite na odkaz pre obnovenie hesla.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to={ROUTES.LOGIN}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Späť na prihlásenie
                </Link>
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Zabudnuté heslo</CardTitle>
              <CardDescription>
                Zadajte svoj email a pošleme vám odkaz na obnovenie hesla.
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
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Odosielam...
                    </>
                  ) : (
                    'Odoslať odkaz'
                  )}
                </Button>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-center text-sm font-medium text-primary hover:underline"
                >
                  Späť na prihlásenie
                </Link>
              </CardFooter>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
