import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, Check, X, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { AdminBookingWithDetails } from '@/hooks/useAdminBookings';

interface PendingBookingCardProps {
  booking: AdminBookingWithDetails;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export function PendingBookingCard({
  booking,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: PendingBookingCardProps) {
  const startTime = format(new Date(booking.slot.start_time), 'HH:mm');
  const endTime = format(new Date(booking.slot.end_time), 'HH:mm');
  const dateFormatted = format(new Date(booking.slot.start_time), 'EEEE, d. MMMM', { locale: sk });

  const isLoading = isApproving || isRejecting;

  return (
    <Card className="ios-card border-0 border-l-4 border-l-warning">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Client info */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{booking.client.full_name}</p>
              <p className="text-sm text-muted-foreground">{booking.client.email}</p>
            </div>
          </div>

          {/* Date and time */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="capitalize">{dateFormatted}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{startTime} - {endTime}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReject(booking.id)}
              disabled={isLoading}
            >
              {isRejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <X className="h-4 w-4 mr-1" />
                  Zamietnuť
                </>
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onApprove(booking.id)}
              disabled={isLoading}
            >
              {isApproving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Potvrdiť
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
