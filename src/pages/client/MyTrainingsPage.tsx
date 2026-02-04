import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { useState } from 'react';
import { useClientBookings, BookingWithSlot } from '@/hooks/useClientBookings';
import { BookingCard } from '@/components/client/BookingCard';
import { CancelBookingDialog } from '@/components/client/CancelBookingDialog';
import { toast } from 'sonner';

export default function MyTrainingsPage() {
  const [cancellingBooking, setCancellingBooking] = useState<BookingWithSlot | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const { upcomingBookings, pastBookings, isLoading, cancelBooking } = useClientBookings();

  const handleCancelClick = (booking: BookingWithSlot) => {
    setCancellingBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;

    setIsCancelling(true);
    try {
      await cancelBooking.mutateAsync(cancellingBooking.id);
      toast.success('Rezervácia bola zrušená');
      setCancellingBooking(null);
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa zrušiť rezerváciu');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isCancelling) {
      setCancellingBooking(null);
    }
  };

  if (isLoading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Moje tréningy</h1>
          <p className="text-muted-foreground">
            Prehľad vašich rezervácií
          </p>
        </div>

        {/* Upcoming trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Nadchádzajúce</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  Nemáte žiadne naplánované tréningy
                </p>
                <Button asChild>
                  <Link to={ROUTES.CALENDAR}>Rezervovať tréning</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancelClick}
                    showCancelButton
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">História</CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Zatiaľ nemáte žiadnu históriu tréningov
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <CancelBookingDialog
        booking={cancellingBooking}
        isOpen={!!cancellingBooking}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </ClientLayout>
  );
}
