import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Euro, X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { CLIENT_TYPE_LABELS } from '@/lib/constants';
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
import { useState } from 'react';

interface ConfirmedBookingCardProps {
  booking: AdminBookingWithDetails;
  onCancel: (bookingId: string, reason?: string) => void;
  onComplete?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onNoShow?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  isCancelling?: boolean;
  isCompleting?: boolean;
}

export function ConfirmedBookingCard({
  booking,
  onCancel,
  onComplete,
  onNoShow,
  isCancelling,
  isCompleting,
}: ConfirmedBookingCardProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);
  const startTime = new Date(booking.slot.start_time);
  const endTime = new Date(booking.slot.end_time);
  const isProcessing = isCancelling || isCompleting;

  const handleCancel = () => {
    onCancel(booking.id, 'Zrušené trénerom');
    setIsCancelOpen(false);
  };

  const handleComplete = () => {
    onComplete?.(booking.id, booking.client.id, booking.price, booking.slot.id);
    setIsCompleteOpen(false);
  };

  const handleNoShow = () => {
    onNoShow?.(booking.id, booking.client.id, booking.price, booking.slot.id);
    setIsNoShowOpen(false);
  };

  return (
    <div className="ios-card p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Client name + type badge */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">{booking.client.full_name}</span>
              {booking.client.client_type && (
                <Badge variant="secondary" className="text-[10px]">
                  {CLIENT_TYPE_LABELS[booking.client.client_type]}
                </Badge>
              )}
            </div>

            {/* Date and time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(startTime, 'EEEE d. MMMM', { locale: sk })} o{' '}
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-success" />
              <span className="font-medium text-success">{booking.price} €</span>
            </div>
          </div>

          {/* Cancel button */}
          <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isProcessing}
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Zrušiť tréning?</AlertDialogTitle>
                <AlertDialogDescription>
                  Naozaj chcete zrušiť tréning s klientom{' '}
                  <strong>{booking.client.full_name}</strong> dňa{' '}
                  {format(startTime, "d. MMMM 'o' HH:mm", { locale: sk })}?
                  <br /><br />
                  Klient bude o zrušení informovaný notifikáciou.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Späť</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Zrušiť tréning
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Action buttons */}
        {(onComplete || onNoShow) && (
          <div className="flex gap-2 pt-1">
            {onComplete && (
              <AlertDialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="flex-1 gap-1" disabled={isProcessing}>
                    {isCompleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Odplávaný
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Označiť ako odplávaný?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Z kreditu klienta bude odpočítaných {booking.price}€.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Späť</AlertDialogCancel>
                    <AlertDialogAction onClick={handleComplete}>Potvrdiť</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {onNoShow && (
              <AlertDialog open={isNoShowOpen} onOpenChange={setIsNoShowOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="gap-1" disabled={isProcessing}>
                    <XCircle className="h-3 w-3" />
                    Neúčasť
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Neúčasť?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Klientovi bude účtovaný 100% poplatok ({booking.price}€).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Späť</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleNoShow}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Potvrdiť neúčasť
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
