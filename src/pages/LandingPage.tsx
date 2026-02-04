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
      <div className="flex min-h-screen flex-col items-center justify-center gradient-teal p-4">
        <div className="text-center space-y-5 animate-ios-fade-in">
          <div className="relative mx-auto">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-32 w-32 rounded-full object-cover shadow-ios-lg ring-4 ring-white/90"
            />
          </div>
          <div className="text-white">
            <h1 className="text-3xl font-bold drop-shadow-sm">Vitaj späť! 👋</h1>
            <p className="text-white/80 mt-2 text-lg">Teší ma, že si tu.</p>
          </div>
          <Button 
            asChild 
            size="lg" 
            className="w-full max-w-xs rounded-2xl h-14 text-base font-semibold ios-press bg-white text-primary hover:bg-white/95 shadow-ios-lg"
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
    <div className="flex min-h-screen flex-col">
      {/* Hero section with gradient */}
      <section className="relative gradient-teal min-h-[70vh] flex flex-col justify-end safe-top">
        {/* Decorative wave pattern */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="relative container px-5 pb-12 pt-8">
          <div className="mx-auto max-w-lg text-center animate-ios-fade-in">
            {/* Veronika's Photo - Prominent with glow effect */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl scale-125" />
                <img 
                  src={veronikaPhoto} 
                  alt="Veronika" 
                  className="relative h-40 w-40 rounded-full object-cover shadow-ios-lg ring-4 ring-white/90"
                />
                <div className="absolute -bottom-2 -right-2 bg-white text-primary rounded-full p-3 shadow-ios-lg">
                  <span className="text-xl">🏊‍♀️</span>
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-sm">
              Ahoj, som Veronika!
            </h1>
            
            <p className="text-xl text-white/95 font-medium mb-4">
              Tvoja osobná trénerka plávania
            </p>
            
            <p className="text-white/75 mb-8 text-base leading-relaxed max-w-sm mx-auto">
              Rada ťa naučím plávať alebo zdokonalím tvoju techniku. 
              Teším sa na teba v bazéne! 💙
            </p>

            <div className="space-y-3">
              <Button 
                asChild 
                size="lg" 
                className="w-full rounded-2xl h-14 text-base font-semibold ios-press bg-white text-primary hover:bg-white/95 shadow-ios-lg"
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
                className="w-full rounded-2xl h-14 text-base font-semibold ios-press text-white hover:bg-white/10 hover:text-white"
              >
                <Link to={ROUTES.LOGIN}>
                  Už mám účet
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content on white/light background */}
      <main className="flex-1 bg-background">
        {/* About Veronika - Modern Card */}
        <section className="py-8 px-5 -mt-6">
          <div className="ios-card-elevated p-6 mx-auto max-w-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <img 
                  src={veronikaPhoto} 
                  alt="Veronika" 
                  className="h-16 w-16 rounded-2xl object-cover shadow-soft"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-lg">O mne</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Plávaniu sa venujem od malička. Moja misia je ukázať, aké môže byť plávanie krásne. 
                  Tréningy prispôsobujem individuálne v priateľskej atmosfére.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features - Modern Cards */}
        <section className="py-6 px-5">
          <div className="mx-auto max-w-lg">
            <h2 className="text-xl font-bold mb-5 px-1">Ako to funguje</h2>
            
            <div className="grid gap-3">
              <div className="ios-card-elevated p-4 transition-all hover:shadow-teal">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Vyber si termín</p>
                    <p className="text-sm text-muted-foreground">Jednoduchá online rezervácia</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
              </div>

              <div className="ios-card-elevated p-4 transition-all hover:shadow-teal">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Férové pravidlá</p>
                    <p className="text-sm text-muted-foreground">Flexibilné storno podmienky</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
              </div>

              <div className="ios-card-elevated p-4 transition-all hover:shadow-teal">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Kreditový systém</p>
                    <p className="text-sm text-muted-foreground">Plávaj bez starostí</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
              </div>

              <div className="ios-card-elevated p-4 transition-all hover:shadow-teal">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Pozvi kamarátov</p>
                    <p className="text-sm text-muted-foreground">Získaj tréning zadarmo 🎁</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation policy - Modern style */}
        <section className="py-6 px-5">
          <div className="mx-auto max-w-lg">
            <h2 className="text-xl font-bold mb-5 px-1">Storno pravidlá</h2>
            
            <div className="ios-card-elevated overflow-hidden">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between rounded-2xl bg-success/10 p-4 border border-success/20">
                  <span className="font-medium">Viac ako 48h vopred</span>
                  <span className="font-bold text-success">Zadarmo ✓</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-warning/10 p-4 border border-warning/20">
                  <span className="font-medium">24 – 48 hodín</span>
                  <span className="font-bold text-warning">50%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-destructive/10 p-4 border border-destructive/20">
                  <span className="font-medium">Menej ako 24h</span>
                  <span className="font-bold text-destructive">80%</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-destructive/10 p-4 border border-destructive/20">
                  <span className="font-medium">Bez ospravedlnenia</span>
                  <span className="font-bold text-destructive">100%</span>
                </div>
              </div>
              <div className="px-4 pb-4 pt-2 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">
                  Cena tréningu: <span className="font-bold text-foreground text-lg">25€</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA with gradient accent */}
        <section className="py-10 px-5">
          <div className="mx-auto max-w-lg">
            <div className="gradient-teal rounded-3xl p-8 text-center shadow-teal">
              <p className="text-3xl mb-3">💦</p>
              <h2 className="text-2xl font-bold text-white mb-2">Pripravená?</h2>
              <p className="text-white/80 mb-6">
                Registrácia trvá len minútku
              </p>
              <Button 
                asChild 
                size="lg" 
                className="w-full rounded-2xl h-14 text-base font-semibold ios-press bg-white text-primary hover:bg-white/95 shadow-ios"
              >
                <Link to={ROUTES.REGISTER}>
                  Zaregistrovať sa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Minimal */}
      <footer className="py-6 px-5 bg-background safe-bottom">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            S 💙 vytvorené pre teba
          </p>
          <Link 
            to={ROUTES.ADMIN.LOGIN}
            className="text-xs text-muted-foreground mt-2 block opacity-50 hover:opacity-100 transition-opacity"
          >
            © 2024 Veronika Swim
          </Link>
        </div>
      </footer>
    </div>
  );
}
