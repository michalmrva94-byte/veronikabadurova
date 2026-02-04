import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Calendar, Shield, CreditCard, Users, ArrowRight, Heart, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/30 p-4">
        <div className="text-center space-y-4">
          <Avatar className="h-20 w-20 mx-auto ring-4 ring-primary/20">
            <AvatarImage src="/veronika-avatar.jpg" alt="Veronika" />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">V</AvatarFallback>
          </Avatar>
          <h1 className="text-3xl font-bold">Vitaj späť! 👋</h1>
          <p className="text-muted-foreground">Teší ma, že si tu.</p>
          <Button asChild size="lg" className="mt-4">
            <Link to={dashboardRoute}>
              Pokračovať
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero section - Personal & Warm */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-background via-secondary/20 to-background py-16 safe-top">
          <div className="container px-4">
            <div className="mx-auto max-w-3xl text-center">
              {/* Veronika's Avatar */}
              <div className="mb-6 flex justify-center">
                <Avatar className="h-28 w-28 ring-4 ring-primary/20 shadow-lg">
                  <AvatarImage src="/veronika-avatar.jpg" alt="Veronika" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-semibold">V</AvatarFallback>
                </Avatar>
              </div>
              
              <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                Ahoj, som Veronika! 👋
              </h1>
              
              <p className="mb-2 text-xl text-primary font-medium">
                Tvoja osobná trénerka plávania
              </p>
              
              <p className="mb-8 text-muted-foreground max-w-xl mx-auto">
                Rada ťa naučím plávať alebo zdokonalím tvoju techniku. 
                Rezervuj si tréning jednoducho a rýchlo – 
                teším sa na teba v bazéne! 🏊‍♀️
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="text-base">
                  <Link to={ROUTES.REGISTER}>
                    Chcem začať plávať
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-base">
                  <Link to={ROUTES.LOGIN}>
                    Už mám účet
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Veronika section */}
        <section className="py-12 bg-card border-y border-border">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Heart className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">O mne</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Plávaniu sa venujem od malička a milujem ho. 💙 
                Moja misia je ukázať ľuďom, aké môže byť plávanie krásne a oslobodzujúce. 
                Či už začínaš od nuly alebo chceš zlepšiť svoju techniku, 
                som tu pre teba. Tréningy prispôsobujem individuálne 
                a vždy v priateľskej atmosfére.
              </p>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">Ako to funguje?</h2>
            
            <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-card p-6 shadow-soft border border-border/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold">Vyber si termín</h3>
                <p className="text-sm text-muted-foreground">
                  Pozri sa do môjho kalendára a vyber si čas, ktorý ti vyhovuje. 
                  Žiadne volania, žiadne čakanie.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft border border-border/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold">Férové pravidlá</h3>
                <p className="text-sm text-muted-foreground">
                  Potrebuješ zrušiť? Žiadny problém. Čím skôr mi dáš vedieť, 
                  tým menej ťa to bude stáť.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft border border-border/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-success/10">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <h3 className="mb-2 font-semibold">Jednoduchý kredit</h3>
                <p className="text-sm text-muted-foreground">
                  Nabi si kredit a plávaj bez starostí. Vždy vidíš, 
                  koľko máš a na čo sa ti minul.
                </p>
              </div>

              <div className="rounded-xl bg-card p-6 shadow-soft border border-border/50">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-warning/10">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <h3 className="mb-2 font-semibold">Pozvi kamarátov</h3>
                <p className="text-sm text-muted-foreground">
                  Odporuč ma priateľom a po ich prvom tréningu 
                  dostaneš jeden tréning zadarmo! 🎁
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation policy */}
        <section className="py-16">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl">
              <h2 className="mb-2 text-center text-2xl font-bold">Storno pravidlá</h2>
              <p className="mb-8 text-center text-muted-foreground">
                Chápem, že život je nepredvídateľný. Tu sú moje férové pravidlá:
              </p>
              
              <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-success/10 p-4">
                    <span className="font-medium">Viac ako 48 hodín vopred</span>
                    <span className="text-lg font-bold text-success">Zadarmo ✓</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-warning/10 p-4">
                    <span className="font-medium">24 – 48 hodín vopred</span>
                    <span className="text-lg font-bold text-warning">50%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
                    <span className="font-medium">Menej ako 24 hodín</span>
                    <span className="text-lg font-bold text-destructive">80%</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-4">
                    <span className="font-medium">Bez ospravedlnenia</span>
                    <span className="text-lg font-bold text-destructive">100%</span>
                  </div>
                </div>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  Cena tréningu: <span className="font-semibold">25€</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="py-12 bg-primary/5">
          <div className="container px-4">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="mb-4 text-2xl font-bold">Pripravená skočiť do vody? 💦</h2>
              <p className="mb-6 text-muted-foreground">
                Registrácia trvá len minútku. Teším sa na teba!
              </p>
              <Button asChild size="lg">
                <Link to={ROUTES.REGISTER}>
                  Zaregistrovať sa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-6 safe-bottom">
        <div className="container px-4 text-center">
          <p className="text-sm text-muted-foreground">
            S 💙 vytvorené pre teba
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            © 2024 Veronika Swim
          </p>
        </div>
      </footer>
    </div>
  );
}