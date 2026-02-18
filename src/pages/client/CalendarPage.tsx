import { ClientLayout } from '@/components/layout/ClientLayout';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Clock, Loader2, ChevronLeft, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useSlotsForMonth, useClientMonthBookings, useWeeklySlots } from '@/hooks/useWeeklySlots';
import { useBookings } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { BookingConfirmDialog } from '@/components/client/BookingConfirmDialog';
import { LowCreditWarningDialog } from '@/components/client/LowCreditWarningDialog';
import { WeeklyAvailableSlots } from '@/components/client/WeeklyAvailableSlots';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';
import { TrainingSlot } from '@/types/database';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSlot, setSelectedSlot] = useState<TrainingSlot | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isLowCreditDialogOpen, setIsLowCreditDialogOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  
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
    
    const creditBalance = profile.balance ?? 0;
    if (creditBalance < DEFAULT_TRAINING_PRICE) {
      setIsLowCreditDialogOpen(true);
    } else {
      setIsConfirmDialogOpen(true);
    }
  };

  const handleLowCreditConfirm = () => {
    setIsLowCreditDialogOpen(false);
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
      setIsLowCreditDialogOpen(false);
      setSelectedSlot(null);
    }
  };

  const missingAmount = selectedSlot
    ? Math.max(0, DEFAULT_TRAINING_PRICE - (profile?.balance ?? 0))
    : 0;

  // Modifiers for calendar highlighting
  const getDayModifiers = () => {
    const hasAvailable: Date[] = [];
    const myBookings: Date[] = [];
    
    if (monthSlots) {
      monthSlots.forEach((value, key) => {
        if (value.hasAvailable) {
          hasAvailable.push(new Date(key));
        }
      });
    }
    
    if (myBookingDates) {
      myBookingDates.forEach((dateStr) => {
        myBookings.push(new Date(dateStr));
      });
    }
    
    return { hasAvailable, myBookings };
  };

  const modifiers = getDayModifiers();

  return (
    <ClientLayout>
      <div className="space-y-5 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Rezervácie</h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Vyberte si termín, ktorý vám vyhovuje.
            </p>
            <Link
              to={ROUTES.MY_TRAININGS}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
            >
              Moje tréningy →
            </Link>
          </div>
        </div>

        {/* Weekly Available Slots — PRIMARY */}
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
                  {format(weekStart, 'd. MMM', { locale: sk })} – {format(addWeeks(weekStart, 1), 'd. MMM', { locale: sk })}
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

        {/* Calendar — collapsible */}
        <Collapsible open={calendarOpen} onOpenChange={setCalendarOpen}>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-xl border bg-card p-4 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors">
            <span>Mesačný kalendár</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${calendarOpen ? 'rotate-180' : ''}`} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mt-2 border-0 shadow-none">
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
          </CollapsibleContent>
        </Collapsible>

        {/* Storno pravidlá — always visible */}
        <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Storno pravidlá</p>
          <p className="text-xs text-muted-foreground">
            Ak sa niečo zmení, dajte mi vedieť čo najskôr. Spolu to vždy vyriešime.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <span>&gt;48h: <span className="text-success font-medium">0 %</span></span>
            <span>24–48h: <span className="text-warning font-medium">50 %</span></span>
            <span>&lt;24h: <span className="text-destructive font-medium">80 %</span></span>
            <span>neúčasť: <span className="text-destructive font-medium">100 %</span></span>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <LowCreditWarningDialog
        isOpen={isLowCreditDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleLowCreditConfirm}
        missingAmount={missingAmount}
      />
      <BookingConfirmDialog
        slot={selectedSlot}
        isOpen={isConfirmDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmBooking}
        isLoading={isBooking}
        creditBalance={profile?.balance ?? 0}
      />
    </ClientLayout>
  );
}
