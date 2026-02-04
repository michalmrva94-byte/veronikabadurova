import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { Button } from '@/components/ui/button';
import { Clock, User, Euro, X, Loader2 } from 'lucide-react';
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
  isCancelling?: boolean;
}

export function ConfirmedBookingCard({
  booking,
  onCancel,
  isCancelling,
}: ConfirmedBookingCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const startTime = new Date(booking.slot.start_time);
  const endTime = new Date(booking.slot.end_time);

  const handleCancel = () => {
    onCancel(booking.id, 'Zrušené trénerom');
    setIsOpen(false);
  };

  return (
    <div className="ios-card p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          {/* Client name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            <span className="font-semibold">{booking.client.full_name}</span>
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
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
              disabled={isCancelling}
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
                {format(startTime, 'd. MMMM o HH:mm', { locale: sk })}?
                <br />
                <br />
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
    </div>
  );
}
