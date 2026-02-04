import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Calendar, Shield, CreditCard, Users, ArrowRight, Heart, ChevronRight } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  // If user is logged in, show welcome back screen
  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="text-center space-y-6 animate-ios-fade-in max-w-sm">
          {/* Photo with soft glow */}
          <div className="relative mx-auto">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="relative h-32 w-32 rounded-full object-cover shadow-float ring-4 ring-white"
            />
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-foreground">Vitaj späť! 👋</h1>
            <p className="text-muted-foreground mt-2 text-lg">Teší ma, že si tu.</p>
          </div>
          
          <Button 
            asChild 
            size="lg" 
            className="w-full btn-dark h-14 text-base ios-press"
          >
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
      {/* Hero section */}
      <section className="relative py-12 safe-top">
        <div className="container px-6">
          <div className="mx-auto max-w-sm text-center animate-ios-fade-in">
            {/* Photo with elegant presentation */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl scale-150" />
                <img 
                  src={veronikaPhoto} 
                  alt="Veronika" 
                  className="relative h-36 w-36 rounded-full object-cover shadow-float ring-4 ring-white"
                />
                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2.5 shadow-soft">
                  <span className="text-xl">🏊‍♀️</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
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
              <Button 
                asChild 
                size="lg" 
                className="w-full btn-dark h-14 text-base ios-press"
              >
                <Link to={ROUTES.REGISTER}>
                  Začať plávať
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="ghost" 
                size="lg" 
                className="w-full rounded-2xl h-14 text-base font-medium ios-press text-muted-foreground"
              >
                <Link to={ROUTES.LOGIN}>
                  Už mám účet
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Card - Floating style */}
      <section className="py-4 px-5">
        <div className="ios-card-elevated p-5 mx-auto max-w-sm">
          <div className="flex items-start gap-4">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-14 w-14 rounded-2xl object-cover shadow-soft"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">O mne</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plávaniu sa venujem od malička. Moja misia je ukázať, aké môže byť plávanie krásne.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Clean cards */}
      <section className="py-6 px-5">
        <div className="mx-auto max-w-sm">
          <h2 className="text-xl font-bold mb-4 px-1">Ako to funguje</h2>
          
          <div className="space-y-3">
            <div className="ios-card p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Vyber si termín</p>
                  <p className="text-sm text-muted-foreground">Jednoduchá online rezervácia</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            <div className="ios-card p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Férové pravidlá</p>
                  <p className="text-sm text-muted-foreground">Flexibilné storno podmienky</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            <div className="ios-card p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Kreditový systém</p>
                  <p className="text-sm text-muted-foreground">Plávaj bez starostí</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>

            <div className="ios-card p-4 card-hover">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Pozvi kamarátov</p>
                  <p className="text-sm text-muted-foreground">Získaj tréning zadarmo 🎁</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing - Clean pill style */}
      <section className="py-6 px-5">
        <div className="mx-auto max-w-sm">
          <h2 className="text-xl font-bold mb-4 px-1">Storno pravidlá</h2>
          
          <div className="ios-card-elevated overflow-hidden">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-success/8 p-4">
                <span className="font-medium text-sm">Viac ako 48h vopred</span>
                <span className="font-bold text-success text-sm">Zadarmo ✓</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-warning/8 p-4">
                <span className="font-medium text-sm">24 – 48 hodín</span>
                <span className="font-bold text-warning text-sm">50%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-destructive/8 p-4">
                <span className="font-medium text-sm">Menej ako 24h</span>
                <span className="font-bold text-destructive text-sm">80%</span>
              </div>
            </div>
            <div className="px-4 pb-4 pt-2 border-t border-border/30">
              <p className="text-center text-muted-foreground">
                Cena tréningu: <span className="font-bold text-foreground text-lg">25€</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-10 px-5">
        <div className="mx-auto max-w-sm text-center">
          <div className="ios-card-elevated p-8">
            <p className="text-3xl mb-3">💦</p>
            <h2 className="text-2xl font-bold mb-2">Pripravená?</h2>
            <p className="text-muted-foreground mb-6">
              Registrácia trvá len minútku
            </p>
            <Button 
              asChild 
              size="lg" 
              className="w-full btn-dark h-14 text-base ios-press"
            >
              <Link to={ROUTES.REGISTER}>
                Zaregistrovať sa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-5 safe-bottom">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            S 💙 vytvorené pre teba
          </p>
          <Link 
            to={ROUTES.ADMIN.LOGIN}
            className="text-xs text-muted-foreground/50 mt-2 block hover:text-muted-foreground transition-colors"
          >
            © 2024 Veronika Swim
          </Link>
        </div>
      </footer>
    </div>
  );
}
