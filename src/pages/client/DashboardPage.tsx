import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Calendar, Loader2, ClockIcon, Ban, Wallet, ChevronDown, ArrowRight, Flame, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useClientBookings } from '@/hooks/useClientBookings';
import { ProposedTrainingsSection, getStatusBadge } from '@/components/client/ProposedTrainingsSection';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { format, startOfWeek, startOfMonth, subWeeks, endOfWeek } from 'date-fns';
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

  // Metrics
  const now = new Date();
  const completedBookings = pastBookings.filter(b => b.status === 'completed');

  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const thisWeekCount = completedBookings.filter(
    b => new Date(b.slot.start_time) >= weekStart
  ).length;

  const monthStart = startOfMonth(now);
  const thisMonthCount = completedBookings.filter(
    b => new Date(b.slot.start_time) >= monthStart
  ).length;

  // Streak
  let streak = 0;
  let checkWeek = startOfWeek(now, { weekStartsOn: 1 });
  if (thisWeekCount === 0) {
    checkWeek = subWeeks(checkWeek, 1);
  }
  while (streak < 52) {
    const weekEnd = endOfWeek(checkWeek, { weekStartsOn: 1 });
    const hasTraining = completedBookings.some(b => {
      const d = new Date(b.slot.start_time);
      return d >= checkWeek && d <= weekEnd;
    });
    if (!hasTraining) break;
    streak++;
    checkWeek = subWeeks(checkWeek, 1);
  }

  const nextBooking = upcomingBookings.length > 0 ? upcomingBookings[upcomingBookings.length - 1] : null;

  const handleAddToCalendar = () => {
    if (!nextBooking) return;
    const startTime = new Date(nextBooking.slot.start_time);
    const endTime = new Date(nextBooking.slot.end_time);
    const title = 'Tréning – Veronika';
    const start = format(startTime, "yyyyMMdd'T'HHmmss");
    const end = format(endTime, "yyyyMMdd'T'HHmmss");
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:Cena: ${nextBooking.price}€`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trening-${format(startTime, 'yyyy-MM-dd-HHmm')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Súbor kalendára stiahnutý');
  };

  return (
    <ClientLayout>
      <div className="space-y-5 animate-fade-in">
        {/* 1. Pozdrav */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Ahoj, {profile?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">
            {(nextBooking || proposedBookings.length > 0) ? 'Teším sa na náš najbližší tréning. 💙' : 'Kedy sa vidíme najbližšie? 😊'}
          </p>
        </div>

        {/* 2. Hero blok -- Najbližší tréning / Akcia */}
        {bookingsLoading ? (
          <Card>
            <CardContent className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : proposedBookings.length > 0 ? (
          // A) Návrhy od Veroniky
          <ProposedTrainingsSection proposedBookings={proposedBookings} />
        ) : nextBooking ? (
          // B) Potvrdený tréning
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Najbližší tréning
              </CardTitle>
              <p className="text-sm text-muted-foreground">Už sa na vás teším.</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-foreground capitalize">
                {format(new Date(nextBooking.slot.start_time), 'EEEE, d. MMMM', { locale: sk })}
              </p>
              <p className="text-lg text-foreground/80">
                {format(new Date(nextBooking.slot.start_time), 'HH:mm')} – {format(new Date(nextBooking.slot.end_time), 'HH:mm')}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <Button asChild size="sm" variant="outline">
                  <Link to={ROUTES.MY_TRAININGS}>
                    Moje tréningy
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="sm" variant="ghost" onClick={handleAddToCalendar}>
                  <CalendarPlus className="mr-1 h-4 w-4" />
                  Pridať do kalendára
                </Button>
              </div>
              {upcomingBookings.length > 1 && (
                <Link to={ROUTES.MY_TRAININGS} className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  +{upcomingBookings.length - 1} ďalší{upcomingBookings.length - 1 > 1 ? 'ch' : ''} tréning{upcomingBookings.length - 1 > 1 ? 'ov' : ''}
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          // C) Nič naplánované
          <Card className="border-muted">
            <CardContent className="flex flex-col items-center py-8 text-center">
              <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Momentálne nemáme naplánovaný tréning.
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Rezervujte si termín alebo počkajte — navrhnem vám tréning priamo sem.
              </p>
              <Button asChild>
                <Link to={ROUTES.CALENDAR}>Rezervovať tréning</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 3. Primárne CTA -- len ak má tréning (inak je CTA v hero karte) */}
        {(nextBooking || proposedBookings.length > 0) && (
          <Button asChild className="w-full" size="lg">
            <Link to={ROUTES.CALENDAR}>Rezervovať tréning</Link>
          </Button>
        )}

        {/* 4. Moja aktivita */}
        {!bookingsLoading && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Vaša aktivita</CardTitle>
                <Link to={ROUTES.MY_TRAININGS} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Zobraziť históriu
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-foreground">{thisWeekCount}</p>
                  <p className="text-xs text-muted-foreground">Tento týždeň</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{thisMonthCount}</p>
                  <p className="text-xs text-muted-foreground">Tento mesiac</p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-2xl font-bold text-foreground">{streak}</p>
                    {streak > 0 && <Flame className="h-4 w-4 text-warning" />}
                  </div>
                  <p className="text-xs text-muted-foreground">Séria týždňov</p>
                </div>
              </div>
              {streak > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">Skvelá konzistentnosť.</p>
              )}
              {thisWeekCount === 0 && thisMonthCount === 0 && streak === 0 && (
                <p className="text-xs text-muted-foreground text-center mt-3">Každý začiatok sa počíta. 💪</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* 5. Zostatok */}
        <Card className={cn(
          netBalance > 0 && "border-success/30",
          netBalance === 0 && "border-warning/20",
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
              "text-2xl font-bold",
              netBalance > 0 && "text-success",
              netBalance === 0 && "text-muted-foreground",
              netBalance < 0 && "text-destructive"
            )}>
              {netBalance > 0 ? '+' : ''}{netBalance.toFixed(2)} €
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              {netBalance > 0 && "Máte dostupný kredit na tréningy."}
              {netBalance === 0 && "Momentálne nemáte kredit ani záväzok."}
              {netBalance < 0 && "Momentálne evidujem neuhradený tréning. Platbu si vyriešime pri najbližšom stretnutí."}
            </p>
            {netBalance < 0 && (
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to={ROUTES.FINANCES}>Zobraziť platobné údaje</Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* 6. Posledné tréningy */}
        {!bookingsLoading && pastBookings.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">Posledné tréningy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastBookings.slice(0, 3).map((booking) => {
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
                <Button asChild variant="ghost" className="w-full">
                  <Link to={ROUTES.MY_TRAININGS}>Zobraziť všetko</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 7. Rezervačné podmienky -- Collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Storno pravidlá
            <ChevronDown className="h-4 w-4 transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 pt-2">
            <p className="text-xs text-muted-foreground mb-2">Ak sa niečo zmení, dajte mi vedieť čo najskôr. Spolu to vždy vyriešime.</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>&gt;48h: <span className="text-success font-medium">0%</span></span>
              <span>24-48h: <span className="text-warning font-medium">50%</span></span>
              <span>&lt;24h: <span className="text-destructive font-medium">80%</span></span>
              <span>neúčasť bez zrušenia: <span className="text-destructive font-medium">100%</span></span>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ClientLayout>
  );
}
