import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Calendar, Loader2, ClockIcon, Ban, Wallet, ArrowRight, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientBookings } from '@/hooks/useClientBookings';
import { ProposedTrainingsSection } from '@/components/client/ProposedTrainingsSection';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, isWithinInterval } from 'date-fns';
import { sk } from 'date-fns/locale';
import { useMemo } from 'react';
import type { BookingWithSlot } from '@/hooks/useClientBookings';

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
            Vaša žiadosť, žiaľ, nebola schválená.
          </p>
        </div>
        <Card className="w-full max-w-sm border-border">
          <CardContent className="p-4 text-sm text-muted-foreground">
            <p>Ak máte otázky, neváhajte sa ozvať priamo Veronike.</p>
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}

function useTrainingMetrics(bookings: BookingWithSlot[]) {
  return useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const activeBookings = bookings.filter(
      (b) => b.status === 'booked' || b.status === 'completed'
    );

    const thisWeekCount = activeBookings.filter((b) =>
      isWithinInterval(new Date(b.slot.start_time), { start: weekStart, end: weekEnd })
    ).length;

    const thisMonthCount = activeBookings.filter((b) =>
      isWithinInterval(new Date(b.slot.start_time), { start: monthStart, end: monthEnd })
    ).length;

    // Consistency: consecutive weeks going back from current week
    let consistencyWeeks = 0;
    for (let i = 1; i <= 52; i++) {
      const wStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const wEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
      const hasTraining = activeBookings.some((b) =>
        isWithinInterval(new Date(b.slot.start_time), { start: wStart, end: wEnd })
      );
      if (hasTraining) {
        consistencyWeeks++;
      } else {
        break;
      }
    }

    return { thisWeekCount, thisMonthCount, consistencyWeeks };
  }, [bookings]);
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
  const { upcomingBookings, proposedBookings, bookings, isLoading: bookingsLoading } = useClientBookings();
  const { thisWeekCount, thisMonthCount, consistencyWeeks } = useTrainingMetrics(bookings);

  const balance = profile?.balance ?? 0;
  const debtBalance = (profile as any)?.debt_balance ?? 0;
  const netBalance = balance - debtBalance;
  const firstName = profile?.full_name?.split(' ')[0] || '';

  const nextBooking = upcomingBookings[0];
  const hasNoTrainings = proposedBookings.length === 0 && upcomingBookings.length === 0;

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        {/* 1. Pozdrav */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Ahoj, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            Teším sa na ďalší tréning.
          </p>
        </div>

        {/* 2. Nadchádzajúce tréningy */}
        {bookingsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* A) Proposed – najvyššia priorita */}
            {proposedBookings.length > 0 && (
              <ProposedTrainingsSection proposedBookings={proposedBookings} />
            )}

            {/* B) Potvrdený tréning */}
            {nextBooking && (
              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Najbližší tréning</p>
                        <p className="font-semibold text-foreground capitalize">
                          {format(new Date(nextBooking.slot.start_time), 'EEEE, d. MMM', { locale: sk })} o {format(new Date(nextBooking.slot.start_time), 'HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={ROUTES.MY_TRAININGS}>
                        Detail <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* C) Prázdny stav */}
            {hasNoTrainings && (
              <div className="space-y-3">
                <p className="text-muted-foreground">
                  Zatiaľ nemáte tréning na najbližší týždeň.
                </p>
                <Button asChild className="w-full h-12 text-base">
                  <Link to={ROUTES.CALENDAR}>
                    Rezervovať tréning
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* 3. Moje tréningy – metriky + CTA */}
        {!bookingsLoading && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-muted-foreground" />
                Moje tréningy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{thisWeekCount}</p>
                  <p className="text-xs text-muted-foreground">Tento týždeň</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{thisMonthCount}</p>
                  <p className="text-xs text-muted-foreground">Tento mesiac</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold text-foreground">{consistencyWeeks}</p>
                  <p className="text-xs text-muted-foreground">Po sebe (týž.)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link to={ROUTES.CALENDAR}>Rezervovať nový tréning</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link to={ROUTES.MY_TRAININGS}>Zobraziť históriu</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 4. Zostatok */}
        <Card className={cn(
          netBalance > 0 && "border-success/30",
          netBalance === 0 && "border-border",
          netBalance < 0 && "border-destructive/30"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Wallet className="h-4 w-4" />
              Váš zostatok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className={cn(
              "text-3xl font-bold",
              netBalance > 0 && "text-success",
              netBalance === 0 && "text-muted-foreground",
              netBalance < 0 && "text-destructive"
            )}>
              {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)} €
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              {netBalance > 0 && "Máte dostupný kredit."}
              {netBalance === 0 && "Momentálne nemáte kredit ani dlh."}
              {netBalance < 0 && "Evidujeme nezaplatený zostatok."}
            </p>
            {netBalance < 0 && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.FINANCES}>Zobraziť platobné údaje</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientLayout>
  );
}
