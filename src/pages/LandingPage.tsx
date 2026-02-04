import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Waves, Calendar, Shield, CreditCard, Users, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Waves className="h-9 w-9" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Veronika Swim</h1>
          <p className="text-muted-foreground">Vitajte späť!</p>
          <Button asChild size="lg" className="mt-4">
            <Link to={dashboardRoute}>
              Prejsť na dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-20 safe-top">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              {/* Logo */}
              <div className="mb-8 flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-medium">
                  <Waves className="h-11 w-11" />
                </div>
              </div>
              
              <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Veronika Swim
              </h1>
              
              <p className="mb-8 text-lg text-muted-foreground">
                Rezervačný systém pre súkromné tréningy plávania.<br />
                Jednoduché rezervácie, férové pravidlá.
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link to={ROUTES.REGISTER}>
                    Zaregistrovať sa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to={ROUTES.LOGIN}>
                    Prihlásiť sa
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <h2 className="mb-12 text-center text-2xl font-bold">Prečo Veronika Swim?</h2>
            
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl bg-card p-6 shadow-soft">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Jednoduché rezervácie</h3>
                <p className="text-sm text-muted-foreground">
                  Rezervujte si tréning jedným kliknutím. Prehľadný kalendár s voľnými termínmi.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold">Férové pravidlá</h3>
                <p className="text-sm text-muted-foreground">
                  Jasné storno podmienky. Čím skôr zrušíte, tým menej zaplatíte.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <h3 className="mb-2 font-semibold">Kreditový systém</h3>
                <p className="text-sm text-muted-foreground">
                  Nabite si kredit a plávajte bez starostí. Prehľad všetkých transakcií.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft sm:col-span-2 lg:col-span-1">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <h3 className="mb-2 font-semibold">Odporúčací program</h3>
                <p className="text-sm text-muted-foreground">
                  Pozvite priateľov a získajte tréning zdarma po ich prvom odplávanom tréningu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation policy */}
        <section className="py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-8 text-center text-2xl font-bold">Storno pravidlá</h2>
              
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
                    <span className="font-medium">Zrušenie viac ako 48h vopred</span>
                    <span className="text-lg font-bold text-success">0%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-warning/10 p-4">
                    <span className="font-medium">Zrušenie 24-48h vopred</span>
                    <span className="text-lg font-bold text-warning">50%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
                    <span className="font-medium">Zrušenie menej ako 24h vopred</span>
                    <span className="text-lg font-bold text-destructive">80%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
                    <span className="font-medium">Neúčasť bez zrušenia</span>
                    <span className="text-lg font-bold text-destructive">100%</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Cena tréningu: 25€
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 safe-bottom">
        <div className="container px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 Veronika Swim. Všetky práva vyhradené.</p>
        </div>
      </footer>
    </div>
  );
}
