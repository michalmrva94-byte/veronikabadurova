import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { DEFAULT_TRAINING_PRICE, CANCELLATION_RULES } from '@/lib/constants';
import { BookingWithSlot } from '@/hooks/useClientBookings';

interface ProposedConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  /** Single booking for individual confirm, or array for batch */
  bookings: BookingWithSlot[];
}

export function ProposedConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  bookings,
}: ProposedConfirmDialogProps) {
  if (bookings.length === 0) return null;

  const isBatch = bookings.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isBatch ? `Potvrdiť ${bookings.length} tréningov` : 'Potvrdiť tréning'}
          </DialogTitle>
          <DialogDescription>
            {isBatch
              ? 'Skontrolujte si detaily a potvrďte všetky navrhnuté tréningy'
              : 'Skontrolujte si detaily a potvrďte navrhnutý tréning'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Training details */}
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium capitalize">
                  {format(new Date(booking.slot.start_time), 'EEEE, d. MMMM yyyy', { locale: sk })}
                </p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(booking.slot.start_time), 'HH:mm')} –{' '}
                  {format(new Date(booking.slot.end_time), 'HH:mm')}
                </p>
                {booking.slot.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">📍 {booking.slot.notes}</p>
                )}
              </div>
            </div>
          ))}

          {/* Price */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">
              {isBatch ? `Cena (${bookings.length}× tréning)` : 'Cena tréningu'}
            </span>
            <span className="font-semibold text-lg">
              {isBatch ? `${bookings.length} × ${DEFAULT_TRAINING_PRICE}€` : `${DEFAULT_TRAINING_PRICE}€`}
            </span>
          </div>

          {/* Cancellation conditions */}
          <div className="flex gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-xs w-full">
              <p className="font-medium text-foreground text-sm mb-1">Podmienky zrušenia</p>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Potvrdením súhlasíte so storno podmienkami. Rozumiem, že sa plány menia — storno podmienky sú nastavené férovo, aby sme si navzájom chránili čas.
              </p>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>{CANCELLATION_RULES.MORE_THAN_48H.label} pred tréningom</span>
                  <span className="font-medium text-success">bez poplatku</span>
                </div>
                <div className="flex justify-between">
                  <span>{CANCELLATION_RULES.BETWEEN_24_48H.label} pred tréningom</span>
                  <span className="font-medium text-foreground">{CANCELLATION_RULES.BETWEEN_24_48H.percentage} %</span>
                </div>
                <div className="flex justify-between">
                  <span>{CANCELLATION_RULES.LESS_THAN_24H.label} pred tréningom</span>
                  <span className="font-medium text-foreground">{CANCELLATION_RULES.LESS_THAN_24H.percentage} %</span>
                </div>
                <div className="flex justify-between">
                  <span>{CANCELLATION_RULES.NO_SHOW.label}</span>
                  <span className="font-medium text-destructive">{CANCELLATION_RULES.NO_SHOW.percentage} %</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground/60 mt-2">
                Percentá sa počítajú z ceny tréningu ({DEFAULT_TRAINING_PRICE} €).
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            Zrušiť
          </Button>
          <Button onClick={onConfirm} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Potvrdzujem...
              </>
            ) : isBatch ? (
              `Potvrdiť všetky (${bookings.length})`
            ) : (
              'Potvrdiť tréning'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
