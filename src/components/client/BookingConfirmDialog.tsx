import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, AlertCircle, Info, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { TrainingSlot } from '@/types/database';
import { DEFAULT_TRAINING_PRICE, CANCELLATION_RULES } from '@/lib/constants';

interface BookingConfirmDialogProps {
  slot: TrainingSlot | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  creditBalance?: number;
}

export function BookingConfirmDialog({
  slot,
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  creditBalance,
}: BookingConfirmDialogProps) {
  if (!slot) return null;

  const startTime = format(new Date(slot.start_time), 'HH:mm');
  const endTime = format(new Date(slot.end_time), 'HH:mm');
  const dateFormatted = format(new Date(slot.start_time), 'EEEE, d. MMMM yyyy', { locale: sk });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Potvrdiť rezerváciu</DialogTitle>
          <DialogDescription>
            Skontrolujte si detaily a potvrďte rezerváciu tréningu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
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

          {/* Notes */}
          {slot.notes && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Info className="h-5 w-5 text-primary flex-shrink-0" />
              <p className="text-sm text-foreground">{slot.notes}</p>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <span className="text-muted-foreground">Cena tréningu</span>
            <span className="font-semibold text-lg">{DEFAULT_TRAINING_PRICE}€</span>
          </div>

          {/* Credit balance info */}
          {creditBalance !== undefined && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-muted-foreground">Váš kredit</span>
              <span className={cn(
                'font-semibold',
                creditBalance >= DEFAULT_TRAINING_PRICE ? 'text-success' : 'text-warning'
              )}>
                {creditBalance.toFixed(2)}€
              </span>
            </div>
          )}

          {/* Approval info */}
          <div className="flex gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Čaká na potvrdenie</p>
              <p className="text-muted-foreground">
                Po odoslaní rezervácie vás Veronika potvrdí a dostanete notifikáciu.
              </p>
            </div>
          </div>

          {/* Cancellation conditions */}
          <div className="flex gap-3 p-3 rounded-lg border border-warning/30 bg-warning/5">
            <AlertCircle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-xs w-full">
              <p className="font-medium text-foreground text-sm mb-1">Podmienky zrušenia</p>
              <p className="text-muted-foreground mb-2 leading-relaxed">
                Rozumiem, že sa plány menia. Storno podmienky sú nastavené férovo, aby sme si navzájom chránili čas.
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
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Zrušiť
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rezervujem...
              </>
            ) : (
              'Potvrdiť rezerváciu'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
