import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { format, differenceInHours } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Booking, TrainingSlot } from '@/types/database';

interface CancelBookingDialogProps {
  booking: (Booking & { slot: TrainingSlot }) | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

function getCancellationFee(slotStartTime: string, price: number): { percentage: number; fee: number } {
  const hoursUntilTraining = differenceInHours(new Date(slotStartTime), new Date());
  
  if (hoursUntilTraining > 48) {
    return { percentage: 0, fee: 0 };
  } else if (hoursUntilTraining >= 24) {
    return { percentage: 50, fee: price * 0.5 };
  } else {
    return { percentage: 80, fee: price * 0.8 };
  }
}

export function CancelBookingDialog({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelBookingDialogProps) {
  if (!booking?.slot) return null;

  const startTime = format(new Date(booking.slot.start_time), 'HH:mm');
  const endTime = format(new Date(booking.slot.end_time), 'HH:mm');
  const dateFormatted = format(new Date(booking.slot.start_time), 'EEEE, d. MMMM yyyy', { locale: sk });
  
  const { percentage, fee } = getCancellationFee(booking.slot.start_time, booking.price);
  const hasFee = fee > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Zrušiť rezerváciu
          </DialogTitle>
          <DialogDescription>
            Naozaj chcete zrušiť túto rezerváciu?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Date and time */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium capitalize">{dateFormatted}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {startTime} - {endTime}
              </p>
            </div>
          </div>

          {/* Cancellation fee warning */}
          {hasFee ? (
            <div className="flex gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">
                  Storno poplatok: {fee.toFixed(2)}€ ({percentage}%)
                </p>
                <p className="text-muted-foreground">
                  Tento poplatok bude odpočítaný z vášho kreditu podľa storno podmienok.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Zrušenie bez poplatku</p>
                <p className="text-muted-foreground">
                  Tréning je viac ako 48 hodín, takže storno poplatok sa neúčtuje.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Ponechať rezerváciu
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Ruším...
              </>
            ) : (
              'Zrušiť rezerváciu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
