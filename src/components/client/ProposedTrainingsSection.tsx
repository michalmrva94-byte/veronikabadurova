import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Loader2, Clock, CheckCheck, ChevronDown } from 'lucide-react';
import { useProposedTrainings } from '@/hooks/useProposedTrainings';
import { BookingWithSlot } from '@/hooks/useClientBookings';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function CountdownBadge({ deadline }: { deadline: string }) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const totalMinutes = differenceInMinutes(deadlineDate, now);
  const hoursLeft = Math.floor(totalMinutes / 60);
  const minutesLeft = totalMinutes % 60;

  if (totalMinutes < 0) {
    return <Badge variant="destructive" className="text-xs">Vypršané</Badge>;
  }

  const isUrgent = hoursLeft < 3;

  return (
    <Badge
      variant="outline"
      className={`text-xs gap-1 ${isUrgent ? 'border-destructive text-destructive' : 'border-warning text-warning'}`}
    >
      <Clock className="h-3 w-3" />
      {hoursLeft > 0 ? `${hoursLeft}h ${minutesLeft}m` : `${minutesLeft}m`}
    </Badge>
  );
}

export function getStatusBadge(status: string, deadline?: string | null) {
  // Check if expired (awaiting_confirmation past deadline)
  if (status === 'awaiting_confirmation' && deadline) {
    const now = new Date();
    if (new Date(deadline) < now) {
      return { label: 'Vypršané', className: 'bg-destructive/10 text-destructive' };
    }
    return { label: 'Čaká na potvrdenie', className: 'bg-warning/10 text-warning' };
  }

  switch (status) {
    case 'awaiting_confirmation':
      return { label: 'Čaká na potvrdenie', className: 'bg-warning/10 text-warning' };
    case 'booked':
      return { label: 'Potvrdené', className: 'bg-success/10 text-success' };
    case 'completed':
      return { label: 'Prebehlo', className: 'bg-success/10 text-success' };
    case 'cancelled':
      return { label: 'Zrušené', className: 'bg-muted text-muted-foreground' };
    case 'no_show':
      return { label: 'Neúčasť', className: 'bg-destructive/10 text-destructive' };
    case 'pending':
      return { label: 'Čaká', className: 'bg-warning/10 text-warning' };
    default:
      return { label: status, className: 'bg-muted text-muted-foreground' };
  }
}

interface Props {
  proposedBookings: BookingWithSlot[];
}

export function ProposedTrainingsSection({ proposedBookings }: Props) {
  const { confirmProposedTraining, rejectProposedTraining, confirmAllProposed } = useProposedTrainings();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  if (proposedBookings.length === 0) return null;

  // Find nearest deadline
  const nearestDeadline = proposedBookings
    .filter((b) => b.confirmation_deadline)
    .sort((a, b) => new Date(a.confirmation_deadline!).getTime() - new Date(b.confirmation_deadline!).getTime())[0]
    ?.confirmation_deadline;

  const handleConfirm = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      await confirmProposedTraining.mutateAsync(bookingId);
      toast.success('Tréning potvrdený');
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa potvrdiť tréning');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setLoadingId(bookingId);
    try {
      await rejectProposedTraining.mutateAsync(bookingId);
      toast.success('Tréning odmietnutý');
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa odmietnuť tréning');
    } finally {
      setLoadingId(null);
    }
  };

  const handleConfirmAll = async () => {
    setConfirmingAll(true);
    try {
      const ids = proposedBookings.map((b) => b.id);
      const results = await confirmAllProposed.mutateAsync(ids);
      const succeeded = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success).length;

      if (succeeded > 0) toast.success(`Potvrdených ${succeeded} tréningov`);
      if (failed > 0) toast.error(`${failed} tréningov sa nepodarilo potvrdiť (konflikty)`);
    } catch (err: any) {
      toast.error('Nepodarilo sa potvrdiť tréningy');
    } finally {
      setConfirmingAll(false);
    }
  };

  return (
    <Card className="border-warning/50 bg-warning/5 shadow-sm">
      <CardContent className="p-4 space-y-3">
        {/* Hero alert box */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground">
              {proposedBookings.length === 1 ? 'Navrhla som vám tréning ✨' : 'Navrhla som vám tréningy ✨'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {proposedBookings.length === 1 ? 'Dajte mi vedieť, či vám termín vyhovuje.' : 'Dajte mi vedieť, či vám termíny vyhovujú.'}
            </p>
            {nearestDeadline && (
              <div className="mt-1.5">
                <CountdownBadge deadline={nearestDeadline} />
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {proposedBookings.length >= 2 && (
            <Button
              size="sm"
              onClick={handleConfirmAll}
              disabled={confirmingAll}
              className="flex-1 gap-1.5"
            >
              {confirmingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCheck className="h-4 w-4" />
              )}
              Potvrdiť všetky termíny
            </Button>
          )}
          <Collapsible open={isOpen} onOpenChange={setIsOpen} className={proposedBookings.length < 2 ? 'flex-1' : ''}>
            <CollapsibleTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className={`gap-1.5 ${proposedBookings.length < 2 ? 'w-full' : ''}`}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                Zobraziť termíny
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>

        {/* Collapsible detail list */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent className="space-y-2 pt-1">
            {proposedBookings.map((booking) => {
              const badge = getStatusBadge('awaiting_confirmation', booking.confirmation_deadline);
              return (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background border"
                >
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <p className="text-sm font-medium capitalize">
                      {format(new Date(booking.slot.start_time), 'EEEE, d. MMM', { locale: sk })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(booking.slot.start_time), 'HH:mm')} –{' '}
                      {format(new Date(booking.slot.end_time), 'HH:mm')}
                    </p>
                    {booking.slot.notes && (
                      <p className="text-xs text-muted-foreground">📍 {booking.slot.notes}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                        {badge.label}
                      </span>
                      {booking.confirmation_deadline && (
                        <CountdownBadge deadline={booking.confirmation_deadline} />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    {loadingId === booking.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:bg-muted"
                          onClick={() => handleReject(booking.id)}
                          title="Navrhnúť iný čas"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleConfirm(booking.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
