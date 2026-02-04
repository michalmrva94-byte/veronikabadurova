import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Clock, AlertCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useSlotsForMonth, useClientMonthBookings, useWeeklySlots } from '@/hooks/useWeeklySlots';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { AvailableSlotCard } from '@/components/client/AvailableSlotCard';
import { BookingConfirmDialog } from '@/components/client/BookingConfirmDialog';
import { WeeklyAvailableSlots } from '@/components/client/WeeklyAvailableSlots';
import { toast } from 'sonner';
import { TrainingSlot } from '@/types/database';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<TrainingSlot | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  
  const { slots, isLoading } = useTrainingSlots(selectedDate);
  const { data: monthSlots } = useSlotsForMonth(currentMonth);
  const { data: weeklySlots, isLoading: weeklyLoading } = useWeeklySlots(weekStart);
  const { createBooking } = useBookings();
  const { profile } = useAuth();
  const { data: myBookingDates } = useClientMonthBookings(currentMonth, profile?.id);

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
      
      toast.success('Žiadosť o rezerváciu bola odoslaná. Čakajte na potvrdenie.');
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

  // Modifiers for calendar highlighting
  const getDayModifiers = () => {
    const hasAvailable: Date[] = [];
    const myBookings: Date[] = [];
    
    // Days with available slots
    if (monthSlots) {
      monthSlots.forEach((value, key) => {
        if (value.hasAvailable) {
          hasAvailable.push(new Date(key));
        }
      });
    }
    
    // Days with my bookings
    if (myBookingDates) {
      myBookingDates.forEach((dateStr) => {
        myBookings.push(new Date(dateStr));
      });
    }
    
    return {
      hasAvailable,
      myBookings,
    };
  };

  const modifiers = getDayModifiers();

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Kalendár</h1>
          <p className="text-muted-foreground">
            Vyberte si termín tréningu
          </p>
        </div>

        {/* Calendar with highlights */}
        <Card>
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              onMonthChange={setCurrentMonth}
              locale={sk}
              className="rounded-md"
              disabled={(date) => date < new Date()}
              modifiers={modifiers}
              modifiersClassNames={{
                hasAvailable: 'bg-emerald-100 dark:bg-emerald-950/50 font-bold text-emerald-700 dark:text-emerald-300',
                myBookings: 'ring-2 ring-primary ring-inset',
              }}
            />
            {/* Calendar legend */}
            <div className="flex gap-4 text-xs text-muted-foreground justify-center mt-4 pt-4 border-t">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50" />
                <span>Voľné termíny</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded ring-2 ring-primary ring-inset" />
                <span>Moje rezervácie</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Available Slots */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Voľné termíny</CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setWeekStart(subWeeks(weekStart, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[100px] text-center">
                  {format(weekStart, 'd. MMM', { locale: sk })} - {format(addWeeks(weekStart, 1), 'd. MMM', { locale: sk })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setWeekStart(addWeeks(weekStart, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {weeklyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <WeeklyAvailableSlots
                weekStart={weekStart}
                slots={weeklySlots || []}
                onSlotClick={handleSlotClick}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
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
