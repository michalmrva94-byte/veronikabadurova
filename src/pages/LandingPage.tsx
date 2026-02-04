import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Calendar, Shield, CreditCard, Users, ArrowRight, Heart, ChevronRight } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  // If user is logged in, redirect to appropriate dashboard
  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="text-center space-y-5 animate-ios-fade-in">
          <div className="relative mx-auto">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-28 w-28 rounded-full object-cover shadow-ios-lg ring-4 ring-white"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Vitaj späť! 👋</h1>
            <p className="text-muted-foreground mt-1">Teší ma, že si tu.</p>
          </div>
          <Button asChild size="lg" className="w-full max-w-xs rounded-2xl h-14 text-base font-semibold ios-press">
            <Link to={dashboardRoute}>
              Pokračovať
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Hero section - iOS style */}
      <main className="flex-1">
        <section className="relative py-12 safe-top">
          <div className="container px-5">
            <div className="mx-auto max-w-lg text-center animate-ios-fade-in">
              {/* Veronika's Photo - Large and prominent */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img 
                    src={veronikaPhoto} 
                    alt="Veronika" 
                    className="h-36 w-36 rounded-full object-cover shadow-ios-lg ring-4 ring-white"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-2 shadow-ios">
                    <span className="text-lg">🏊‍♀️</span>
                  </div>
                </div>
              </div>
              
              <h1 className="mb-2">
                Ahoj, som Veronika!
              </h1>
              
              <p className="text-lg text-primary font-semibold mb-3">
                Tvoja osobná trénerka plávania
              </p>
              
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                Rada ťa naučím plávať alebo zdokonalím tvoju techniku. 
                Teším sa na teba v bazéne! 💙
              </p>

              <div className="space-y-3">
                <Button asChild size="lg" className="w-full rounded-2xl h-14 text-base font-semibold ios-press">
                  <Link to={ROUTES.REGISTER}>
                    Začať plávať
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="w-full rounded-2xl h-14 text-base font-semibold ios-press">
                  <Link to={ROUTES.LOGIN}>
                    Už mám účet
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Veronika - iOS Card */}
        <section className="py-6 px-5">
          <div className="ios-card p-5 mx-auto max-w-lg shadow-ios">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={veronikaPhoto} 
                  alt="Veronika" 
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">O mne</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plávaniu sa venujem od malička. Moja misia je ukázať, aké môže byť plávanie krásne. 
                  Tréningy prispôsobujem individuálne v priateľskej atmosfére.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features - iOS List style */}
        <section className="py-6 px-5">
          <div className="mx-auto max-w-lg">
            <h2 className="text-lg font-semibold mb-4 px-1">Ako to funguje</h2>
            
            <div className="ios-card shadow-ios overflow-hidden">
              <div className="ios-list-item">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Vyber si termín</p>
                    <p className="text-sm text-muted-foreground">Jednoduchá online rezervácia</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>

              <div className="ios-list-item">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium">Férové pravidlá</p>
                    <p className="text-sm text-muted-foreground">Flexibilné storno podmienky</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>

              <div className="ios-list-item">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="font-medium">Kreditový systém</p>
                    <p className="text-sm text-muted-foreground">Plávaj bez starostí</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>

              <div className="ios-list-item border-b-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-warning/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Pozvi kamarátov</p>
                    <p className="text-sm text-muted-foreground">Získaj tréning zadarmo 🎁</p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation policy - iOS style */}
        <section className="py-6 px-5">
          <div className="mx-auto max-w-lg">
            <h2 className="text-lg font-semibold mb-4 px-1">Storno pravidlá</h2>
            
            <div className="ios-card shadow-ios overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between rounded-xl bg-success/10 p-4">
                  <span className="font-medium text-sm">Viac ako 48h vopred</span>
                  <span className="font-bold text-success">Zadarmo ✓</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-warning/10 p-4">
                  <span className="font-medium text-sm">24 – 48 hodín</span>
                  <span className="font-bold text-warning">50%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4">
                  <span className="font-medium text-sm">Menej ako 24h</span>
                  <span className="font-bold text-destructive">80%</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-destructive/10 p-4">
                  <span className="font-medium text-sm">Bez ospravedlnenia</span>
                  <span className="font-bold text-destructive">100%</span>
                </div>
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Cena tréningu: <span className="font-semibold text-foreground">25€</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-8 px-5">
          <div className="mx-auto max-w-lg text-center">
            <p className="text-2xl mb-2">💦</p>
            <h2 className="text-xl font-bold mb-2">Pripravená?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Registrácia trvá len minútku
            </p>
            <Button asChild size="lg" className="w-full rounded-2xl h-14 text-base font-semibold ios-press">
              <Link to={ROUTES.REGISTER}>
                Zaregistrovať sa
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer - Minimal iOS style */}
      <footer className="py-6 px-5 safe-bottom">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            S 💙 vytvorené pre teba
          </p>
          <Link 
            to={ROUTES.ADMIN.LOGIN}
            className="text-xs text-muted-foreground mt-1 opacity-60 hover:opacity-100 transition-opacity"
          >
            © 2024 Veronika Swim
          </Link>
        </div>
      </footer>
    </div>
  );
}