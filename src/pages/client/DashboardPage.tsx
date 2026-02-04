import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Calendar, CreditCard, Clock, TrendingUp, TrendingDown, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTransactions } from '@/hooks/useTransactions';
import { useClientBookings } from '@/hooks/useClientBookings';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function ClientDashboardPage() {
  const { profile } = useAuth();
  const { totalCancellationFees, isLoading: transactionsLoading } = useTransactions();
  const { upcomingBookings, isLoading: bookingsLoading } = useClientBookings();
  
  const balance = profile?.balance ?? 0;
  const isPositive = balance >= 0;

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Welcome section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Ahoj, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            Vitajte v rezervačnom systéme
          </p>
        </div>

        {/* Balance card */}
        <Card className={cn(
          'relative overflow-hidden',
          isPositive ? 'border-success/30' : 'border-destructive/30'
        )}>
          <div className={cn(
            'absolute inset-0 opacity-5',
            isPositive ? 'bg-success' : 'bg-destructive'
          )} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Váš zostatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-success" />
              ) : (
                <TrendingDown className="h-6 w-6 text-destructive" />
              )}
              <span className={cn(
                'text-3xl font-bold',
                isPositive ? 'text-success' : 'text-destructive'
              )}>
                {isPositive ? '+' : ''}{balance.toFixed(2)} €
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {isPositive ? 'Kredit' : 'Dlh'}
            </p>
          </CardContent>
        </Card>

        {/* Cancellation fees warning - show only if there are fees */}
        {!transactionsLoading && totalCancellationFees > 0 && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-medium text-foreground">Storno poplatky</span>
                </div>
                <Link to={ROUTES.FINANCES}>
                  <span className="text-lg font-bold text-destructive">
                    -{totalCancellationFees.toFixed(2)} €
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link to={ROUTES.CALENDAR}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Rezervovať</h3>
                <p className="text-xs text-muted-foreground">Nový tréning</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={ROUTES.MY_TRAININGS}>
            <Card className="card-hover cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-semibold">Moje tréningy</h3>
                <p className="text-xs text-muted-foreground">Nadchádzajúce</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Upcoming trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nadchádzajúce tréningy</CardTitle>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">Zatiaľ nemáte žiadne rezervácie</p>
                <Button asChild className="mt-4">
                  <Link to={ROUTES.CALENDAR}>Rezervovať tréning</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground capitalize">
                          {format(new Date(booking.slot.start_time), 'EEEE, d. MMM', { locale: sk })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(booking.slot.start_time), 'HH:mm')} - {format(new Date(booking.slot.end_time), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "text-xs font-medium px-2 py-1 rounded-full",
                      booking.status === 'booked' 
                        ? "bg-success/10 text-success" 
                        : "bg-warning/10 text-warning"
                    )}>
                      {booking.status === 'booked' ? 'Potvrdené' : 'Čaká'}
                    </div>
                  </div>
                ))}
                {upcomingBookings.length > 3 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link to={ROUTES.MY_TRAININGS}>
                      Zobraziť všetky ({upcomingBookings.length})
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation policy reminder */}
        <Card className="border-border/50 bg-muted/30">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              💡 Pripomienka storno pravidiel:
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>&gt;48h: <span className="text-success font-medium">0%</span></span>
              <span>24-48h: <span className="text-warning font-medium">50%</span></span>
              <span>&lt;24h: <span className="text-destructive font-medium">80%</span></span>
              <span>Neúčasť: <span className="text-destructive font-medium">100%</span></span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
