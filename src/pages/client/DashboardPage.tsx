import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Calendar, Clock, TrendingUp, TrendingDown, Minus, Loader2, ClockIcon, Ban, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientBookings } from '@/hooks/useClientBookings';
import { ProposedTrainingsSection, getStatusBadge } from '@/components/client/ProposedTrainingsSection';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

function PendingApprovalScreen({ name }: { name: string }) {
  return (
    <ClientLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
          <ClockIcon className="h-10 w-10 text-warning" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Ahoj, {name}! 👋
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm">
            Vaša žiadosť o spoluprácu bola odoslaná a čaká na schválenie trénerom.
          </p>
        </div>
        <Card className="w-full max-w-sm border-warning/30 bg-warning/5">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p>Budete informovaní hneď, ako tréner vašu žiadosť posúdi. Ďakujeme za trpezlivosť! 🏊‍♀️</p>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}

function RejectedScreen({ name }: { name: string }) {
  return (
    <ClientLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <Ban className="h-10 w-10 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Ahoj, {name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-sm">
            Bohužiaľ, vaša žiadosť o spoluprácu nebola schválená.
          </p>
        </div>
        <Card className="w-full max-w-sm border-border">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p>Ak máte otázky, neváhajte kontaktovať trénera priamo.</p>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}

export default function ClientDashboardPage() {
  const { profile, approvalStatus } = useAuth();
  const firstName = profile?.full_name?.split(' ')[0] || '';

  if (approvalStatus === 'pending') {
    return <PendingApprovalScreen name={firstName} />;
  }
  if (approvalStatus === 'rejected') {
    return <RejectedScreen name={firstName} />;
  }

  return <ApprovedDashboard />;
}

function ApprovedDashboard() {
  const { profile } = useAuth();
  const { upcomingBookings, proposedBookings, pastBookings, isLoading: bookingsLoading } = useClientBookings();
  
  const balance = profile?.balance ?? 0;
  const debtBalance = (profile as any)?.debt_balance ?? 0;
  const netBalance = balance - debtBalance;

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

        {/* Váš zostatok - unified balance card */}
        <Card className={cn(
          "relative overflow-hidden",
          netBalance > 0 && "border-success/30",
          netBalance === 0 && "border-warning/30",
          netBalance < 0 && "border-destructive/30"
        )}>
          <div className={cn(
            "absolute inset-0 opacity-5",
            netBalance > 0 && "bg-success",
            netBalance === 0 && "bg-warning",
            netBalance < 0 && "bg-destructive"
          )} />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Váš zostatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {netBalance > 0 && <TrendingUp className="h-6 w-6 text-success" />}
              {netBalance === 0 && <Minus className="h-6 w-6 text-warning" />}
              {netBalance < 0 && <TrendingDown className="h-6 w-6 text-destructive" />}
              <span className={cn(
                "text-3xl font-bold",
                netBalance > 0 && "text-success",
                netBalance === 0 && "text-warning",
                netBalance < 0 && "text-destructive"
              )}>
                {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)} €
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {netBalance > 0 && "Máte dostupný kredit na tréningy."}
              {netBalance === 0 && "Rezervácia je možná. Vznikne nedoplatok."}
              {netBalance < 0 && "Máte nedoplatok. Prosím uhraďte platbu."}
            </p>
            {netBalance < 0 && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.FINANCES}>Zobraziť platobné údaje</Link>
              </Button>
            )}
          </CardContent>
        </Card>

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

        {/* === SEKCIA: Vyžaduje pozornosť === */}
        {!bookingsLoading && <ProposedTrainingsSection proposedBookings={proposedBookings} />}

        {/* === SEKCIA: Nadchádzajúce tréningy === */}
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
                {upcomingBookings.slice(0, 3).map((booking) => {
                  const badge = getStatusBadge(booking.status || 'booked');
                  return (
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
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badge.className)}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
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

        {/* === SEKCIA: História === */}
        {!bookingsLoading && pastBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">História</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastBookings.slice(0, 5).map((booking) => {
                  const badge = getStatusBadge(booking.status || 'completed', booking.confirmation_deadline);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
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
                      <span className={cn("text-xs font-medium px-2 py-1 rounded-full", badge.className)}>
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
                {pastBookings.length > 5 && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link to={ROUTES.MY_TRAININGS}>
                      Zobraziť celú históriu ({pastBookings.length})
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
