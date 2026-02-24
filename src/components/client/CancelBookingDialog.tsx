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
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CancelBookingDialogProps {
  booking: (Booking & { slot: TrainingSlot }) | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function CancelBookingDialog({
  booking,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: CancelBookingDialogProps) {
  const { data: feeSettings, isLoading: isLoadingFees } = useQuery({
    queryKey: ['cancel-fee-settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('key, value')
        .in('key', ['cancel_fee_24h', 'cancel_fee_48h']);
      const map: Record<string, number> = {};
      (data || []).forEach((s: any) => { map[s.key] = parseFloat(s.value) || 0; });
      return { fee24h: map['cancel_fee_24h'] ?? 80, fee48h: map['cancel_fee_48h'] ?? 50 };
    },
    enabled: isOpen,
    staleTime: 60_000,
  });

  if (!booking?.slot) return null;

  const startTime = format(new Date(booking.slot.start_time), 'HH:mm');
  const endTime = format(new Date(booking.slot.end_time), 'HH:mm');
  const dateFormatted = format(new Date(booking.slot.start_time), 'EEEE, d. MMMM yyyy', { locale: sk });

  const fee24h = feeSettings?.fee24h ?? 80;
  const fee48h = feeSettings?.fee48h ?? 50;

  const hoursUntilTraining = differenceInHours(new Date(booking.slot.start_time), new Date());
  let percentage: number;
  let fee: number;

  if (hoursUntilTraining > 48) {
    percentage = 0;
    fee = 0;
  } else if (hoursUntilTraining >= 24) {
    percentage = fee48h;
    fee = booking.price * (fee48h / 100);
  } else {
    percentage = fee24h;
    fee = booking.price * (fee24h / 100);
  }

  const hasFee = fee > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Zrušiť rezerváciu
          </DialogTitle>
          <DialogDescription>
            Chcete zrušiť túto rezerváciu?
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
          {isLoadingFees ? (
            <div className="flex gap-3 p-3 rounded-lg border border-muted bg-muted/30">
              <Skeleton className="h-5 w-5 flex-shrink-0 mt-0.5 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ) : hasFee ? (
            <div className="flex gap-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
              <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">
                  Podľa podmienok sa účtuje {percentage} % ceny tréningu ({fee.toFixed(2)} €).
                </p>
                <p className="text-muted-foreground">
                  Suma bude zohľadnená vo vašom zostatku.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Zrušenie bez poplatku</p>
                <p className="text-muted-foreground">
                  Zrušenie prebehne bez poplatku.
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
            disabled={isLoading || isLoadingFees}
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
