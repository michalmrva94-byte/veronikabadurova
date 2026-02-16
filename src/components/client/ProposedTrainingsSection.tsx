import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Check, X, Loader2, Clock, CheckCheck } from 'lucide-react';
import { useProposedTrainings } from '@/hooks/useProposedTrainings';
import { BookingWithSlot } from '@/hooks/useClientBookings';
import { format, differenceInHours, differenceInMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
import { toast } from 'sonner';
import { useState } from 'react';

function CountdownBadge({ deadline }: { deadline: string }) {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const hoursLeft = differenceInHours(deadlineDate, now);
  const minutesLeft = differenceInMinutes(deadlineDate, now) % 60;

  if (hoursLeft < 0) {
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

interface Props {
  proposedBookings: BookingWithSlot[];
}

export function ProposedTrainingsSection({ proposedBookings }: Props) {
  const { confirmProposedTraining, rejectProposedTraining, confirmAllProposed } = useProposedTrainings();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [confirmingAll, setConfirmingAll] = useState(false);

  if (proposedBookings.length === 0) return null;

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
    <Card className="border-warning/30 bg-warning/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Návrhy tréningov na potvrdenie
          </CardTitle>
          {proposedBookings.length > 1 && (
            <Button
              size="sm"
              onClick={handleConfirmAll}
              disabled={confirmingAll}
              className="gap-1"
            >
              {confirmingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <CheckCheck className="h-3 w-3" />
              )}
              Potvrdiť všetky
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {proposedBookings.map((booking) => (
          <div
            key={booking.id}
            className="flex items-center justify-between p-3 rounded-lg bg-background border"
          >
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium capitalize">
                {format(new Date(booking.slot.start_time), 'EEEE, d. MMM', { locale: sk })}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(booking.slot.start_time), 'HH:mm')} -{' '}
                {format(new Date(booking.slot.end_time), 'HH:mm')}
              </p>
              {booking.confirmation_deadline && (
                <CountdownBadge deadline={booking.confirmation_deadline} />
              )}
            </div>
            <div className="flex items-center gap-2">
              {loadingId === booking.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(booking.id)}
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
        ))}
      </CardContent>
    </Card>
  );
}
