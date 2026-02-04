import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES, DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { ArrowLeft, Shield } from 'lucide-react';

export default function CancellationPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="container px-5 py-4">
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-2xl"
            >
              <Link to={ROUTES.HOME}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">Storno pravidlá</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-6">
        <div className="mx-auto max-w-sm space-y-6">
          {/* Intro */}
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Férové podmienky</h2>
            <p className="text-muted-foreground text-sm">
              Storno poplatky závisia od toho, koľko času vopred zrušíš tréning.
            </p>
          </div>

          {/* Rules */}
          <div className="ios-card-elevated overflow-hidden">
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between rounded-2xl bg-success/8 p-4">
                <div>
                  <p className="font-semibold text-sm">Viac ako 48h vopred</p>
                  <p className="text-xs text-muted-foreground">Zruš bez poplatku</p>
                </div>
                <span className="font-bold text-success">Zadarmo ✓</span>
              </div>
              
              <div className="flex items-center justify-between rounded-2xl bg-warning/8 p-4">
                <div>
                  <p className="font-semibold text-sm">24 – 48 hodín</p>
                  <p className="text-xs text-muted-foreground">Polovica ceny tréningu</p>
                </div>
                <span className="font-bold text-warning">50%</span>
              </div>
              
              <div className="flex items-center justify-between rounded-2xl bg-destructive/8 p-4">
                <div>
                  <p className="font-semibold text-sm">Menej ako 24h</p>
                  <p className="text-xs text-muted-foreground">Väčšina ceny tréningu</p>
                </div>
                <span className="font-bold text-destructive">80%</span>
              </div>
            </div>
          </div>

          {/* Price info */}
          <div className="ios-card p-5 text-center">
            <p className="text-muted-foreground text-sm mb-1">Cena jedného tréningu</p>
            <p className="text-3xl font-bold text-foreground">{DEFAULT_TRAINING_PRICE}€</p>
          </div>

          {/* Example */}
          <div className="ios-card p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Príklad:</span> Ak zrušíš tréning 12 hodín vopred, 
              storno poplatok bude 80% z {DEFAULT_TRAINING_PRICE}€ = <span className="font-semibold">{(DEFAULT_TRAINING_PRICE * 0.8).toFixed(0)}€</span>.
            </p>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <Button 
              asChild 
              size="lg" 
              className="w-full btn-dark h-14 text-base ios-press"
            >
              <Link to={ROUTES.REGISTER}>
                Zaregistrovať sa
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
