import { useAuth } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Calendar, Loader2, ClockIcon, Ban, Wallet, ChevronDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useClientBookings } from '@/hooks/useClientBookings';
import { ProposedTrainingsSection, getStatusBadge } from '@/components/client/ProposedTrainingsSection';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
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
  const firstName = profile?.full_name?.split(' ')[0] || '';

  const nextBooking = upcomingBookings[0];

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        {/* 1. Hero sekcia */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Ahoj, {firstName}! 👋
            </h1>
            <p className="text-muted-foreground">
              Teším sa na ďalší tréning.
            </p>
          </div>

          {bookingsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : nextBooking ? (
            <Card className="border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Najbližšie</p>
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
          ) : (
            <p className="text-muted-foreground">
              Zatiaľ nemáte rezervovaný tréning.
            </p>
          )}
        </div>

        {/* 2. Primárne CTA */}
        <Button asChild className="w-full h-14 text-base">
          <Link to={ROUTES.CALENDAR}>
            Rezervovať nový tréning
          </Link>
        </Button>

        {/* 3. Návrhy tréningov */}
        {!bookingsLoading && <ProposedTrainingsSection proposedBookings={proposedBookings} />}

        {/* 4. Zostatok – kompaktná karta */}
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

        {/* 5. História */}
        {!bookingsLoading && pastBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">História</CardTitle>
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
                  <Link to={ROUTES.MY_TRAININGS}>
                    Zobraziť všetko
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 6. Rezervačné podmienky – Collapsible */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-4 text-sm font-medium text-muted-foreground hover:bg-muted/50 transition-colors">
            Rezervačné podmienky
            <ChevronDown className="h-4 w-4 transition-transform [[data-state=open]_&]:rotate-180" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span>&gt;48h: <span className="text-success font-medium">0%</span></span>
                <span>24-48h: <span className="text-warning font-medium">50%</span></span>
                <span>&lt;24h: <span className="text-destructive font-medium">80%</span></span>
                <span>neúčasť bez zrušenia: <span className="text-destructive font-medium">100%</span></span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </ClientLayout>
  );
}
