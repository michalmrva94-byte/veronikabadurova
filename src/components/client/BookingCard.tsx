import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { BookingWithSlot } from '@/hooks/useClientBookings';
import { BOOKING_STATUS_LABELS } from '@/lib/constants';

interface BookingCardProps {
  booking: BookingWithSlot;
  onCancel?: (booking: BookingWithSlot) => void;
  showCancelButton?: boolean;
}

export function BookingCard({ booking, onCancel, showCancelButton = false }: BookingCardProps) {
  const startTime = format(new Date(booking.slot.start_time), 'HH:mm');
  const endTime = format(new Date(booking.slot.end_time), 'HH:mm');
  const dateFormatted = format(new Date(booking.slot.start_time), 'EEEE, d. MMMM', { locale: sk });

  const statusVariant = {
    booked: 'default',
    cancelled: 'destructive',
    completed: 'secondary',
    no_show: 'destructive',
  }[booking.status || 'booked'] as 'default' | 'destructive' | 'secondary';

  return (
    <Card className="ios-card border-0">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground capitalize">{dateFormatted}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {startTime} - {endTime}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Badge variant={statusVariant} className="text-xs">
                  {BOOKING_STATUS_LABELS[booking.status || 'booked']}
                </Badge>
                <span className="text-sm font-medium">{booking.price}€</span>
              </div>
            </div>
          </div>
          
          {showCancelButton && booking.status === 'booked' && (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => onCancel?.(booking)}
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
