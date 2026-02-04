import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { AvailableSlotCard } from '@/components/client/AvailableSlotCard';
import { BookingConfirmDialog } from '@/components/client/BookingConfirmDialog';
import { toast } from 'sonner';
import { TrainingSlot } from '@/types/database';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TrainingSlot | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const { slots, isLoading } = useTrainingSlots(selectedDate);
  const { createBooking } = useBookings();
  const { profile } = useAuth();

  const handleSlotClick = (slot: TrainingSlot) => {
    if (!profile) {
      toast.error('Pre rezerváciu sa musíte prihlásiť');
      return;
    }
    setSelectedSlot(slot);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmBooking = async () => {
    if (!profile || !selectedSlot) return;

    setIsBooking(true);
    
    try {
      await createBooking.mutateAsync({
        slot_id: selectedSlot.id,
        client_id: profile.id,
        price: DEFAULT_TRAINING_PRICE,
      });
      
      toast.success('Tréning úspešne rezervovaný!');
      setIsConfirmDialogOpen(false);
      setSelectedSlot(null);
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa rezervovať tréning');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isBooking) {
      setIsConfirmDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Kalendár</h1>
          <p className="text-muted-foreground">
            Vyberte si termín tréningu
          </p>
        </div>

        {/* Calendar */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={sk}
              className="rounded-md"
              disabled={(date) => date < new Date()}
            />
          </CardContent>
        </Card>

        {/* Available slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? (
                <>Voľné termíny - {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}</>
              ) : (
                'Vyberte dátum'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Na vybraný deň nie sú dostupné žiadne termíny
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <AvailableSlotCard
                    key={slot.id}
                    slot={slot}
                    onBook={() => handleSlotClick(slot)}
                    isBooking={false}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancellation reminder */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex gap-3 p-4">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Storno pravidlá</p>
              <p className="text-muted-foreground">
                Pri rezervácii súhlasíte so storno podmienkami. Zrušenie &lt;24h = 80% poplatok.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog */}
      <BookingConfirmDialog
        slot={selectedSlot}
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmBooking}
        isLoading={isBooking}
      />
    </ClientLayout>
  );
}
