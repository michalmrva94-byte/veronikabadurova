import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { SlotWithBooking } from '@/hooks/useWeeklySlots';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Clock, User, Euro, CheckCircle, XCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { BOOKING_STATUS_LABELS, CLIENT_TYPE_LABELS } from '@/lib/constants';
import { BookingStatus } from '@/types/database';

interface SlotDetailDialogProps {
  slot: SlotWithBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onNoShow?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onCancel?: (bookingId: string, reason?: string) => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDelete?: (slotId: string) => void;
  isProcessing?: boolean;
}

const statusColors: Record<string, string> = {
  proposed: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/20 text-warning-foreground border-warning',
  awaiting_confirmation: 'bg-warning/20 text-warning-foreground border-warning',
  booked: 'bg-primary/20 text-primary border-primary',
  cancelled: 'bg-destructive/20 text-destructive border-destructive',
  no_show: 'bg-destructive/20 text-destructive border-destructive',
  completed: 'bg-success/20 text-success border-success',
};

export function SlotDetailDialog({
  slot,
  open,
  onOpenChange,
  onComplete,
  onNoShow,
  onCancel,
  onApprove,
  onReject,
  onDelete,
  isProcessing,
}: SlotDetailDialogProps) {
  if (!slot) return null;

  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);
  const booking = slot.booking;
  const status = (booking?.status as BookingStatus) || null;
  const hasBooking = !!booking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail termínu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {format(startTime, 'EEEE d. MMMM yyyy', { locale: sk })}
            </span>
          </div>
          <div className="text-lg font-bold">
            {format(startTime, 'HH:mm')} – {format(endTime, 'HH:mm')}
          </div>

          {/* Client info */}
          {booking?.client && (
            <div className="ios-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">{booking.client.full_name}</span>
              </div>
              {(booking.client as any).client_type && (
                <Badge variant="secondary" className="text-xs">
                  {CLIENT_TYPE_LABELS[(booking.client as any).client_type as keyof typeof CLIENT_TYPE_LABELS]}
                </Badge>
              )}
            </div>
          )}

          {/* Status badge */}
          {status && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stav:</span>
              <Badge className={statusColors[status] || ''}>
                {BOOKING_STATUS_LABELS[status]}
              </Badge>
            </div>
          )}

          {/* Actions based on status */}
          <div className="space-y-2 pt-2">
            {status === 'booked' && booking && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full gap-2" disabled={isProcessing}>
                      <CheckCircle className="h-4 w-4" />
                      Označiť ako odplávaný
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Označiť ako odplávaný?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tréning bude označený ako dokončený a z kreditu klienta bude odpočítaná cena tréningu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Späť</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        onComplete?.(booking.id, (booking.client as any)?.id, (booking as any)?.price ?? 25, slot.id);
                        onOpenChange(false);
                      }}>
                        Potvrdiť
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2" disabled={isProcessing}>
                      <XCircle className="h-4 w-4" />
                      Neúčasť (100% poplatok)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Označiť neúčasť?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Klientovi bude účtovaný 100% poplatok za neúčasť.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Späť</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          onNoShow?.(booking.id, (booking.client as any)?.id, (booking as any)?.price ?? 25, slot.id);
                          onOpenChange(false);
                        }}
                      >
                        Potvrdiť neúčasť
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  variant="outline"
                  className="w-full gap-2 text-destructive"
                  disabled={isProcessing}
                  onClick={() => {
                    onCancel?.(booking.id, 'Zrušené trénerom');
                    onOpenChange(false);
                  }}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Zrušiť tréning
                </Button>
              </>
            )}

            {(status === 'pending' || status === 'awaiting_confirmation') && booking && (
              <>
                <Button
                  className="w-full gap-2"
                  disabled={isProcessing}
                  onClick={() => {
                    onApprove?.(booking.id);
                    onOpenChange(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Potvrdiť
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={isProcessing}
                  onClick={() => {
                    onReject?.(booking.id);
                    onOpenChange(false);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Zamietnuť
                </Button>
              </>
            )}

            {status === 'proposed' && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Čaká sa na odpoveď klienta
              </div>
            )}

            {!hasBooking && (
              <Button
                variant="destructive"
                className="w-full gap-2"
                disabled={isProcessing}
                onClick={() => {
                  onDelete?.(slot.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Zmazať slot
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Spracovávam...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
