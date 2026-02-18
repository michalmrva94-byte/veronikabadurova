import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format, addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Plus, Clock, Loader2, CalendarDays, CalendarIcon, CalendarRange } from 'lucide-react';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useWeeklySlots, useSlotsForMonth, SlotWithBooking } from '@/hooks/useWeeklySlots';
import { useSlotsForYear } from '@/hooks/useSlotsForYear';
import { useClients } from '@/hooks/useClients';
import { useAssignTraining } from '@/hooks/useAssignTraining';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { useCompleteTraining } from '@/hooks/useCompleteTraining';
import { CreateTrainingDialog } from '@/components/admin/CreateTrainingDialog';
import { WeeklyCalendarGrid } from '@/components/admin/WeeklyCalendarGrid';
import { YearCalendarGrid } from '@/components/admin/YearCalendarGrid';
import { SlotDetailDialog } from '@/components/admin/SlotDetailDialog';
import { SlotCard } from '@/components/admin/SlotCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year'>('week');
  const [selectedSlot, setSelectedSlot] = useState<SlotWithBooking | null>(null);
  const [isSlotDetailOpen, setIsSlotDetailOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { slots, isLoading, createSlot, deleteSlot } = useTrainingSlots(selectedDate);
  const { data: weeklySlots, isLoading: weeklyLoading } = useWeeklySlots(weekStart);
  const { data: monthSlots } = useSlotsForMonth(selectedDate || new Date());
  const { data: yearSlots, isLoading: yearLoading } = useSlotsForYear(selectedYear);
  const { data: clients = [] } = useClients();
  const assignTraining = useAssignTraining();
  const { approveBooking, rejectBooking, cancelBooking } = useAdminBookings();
  const { completeTraining, markNoShow } = useCompleteTraining();

  const handleAddSlot = async (data: { start_time: string; end_time: string; notes?: string }) => {
    try {
      await createSlot.mutateAsync(data);
      toast.success('Slot vytvorený');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Nepodarilo sa vytvoriť termín.');
    }
  };

  const handleAssignTraining = async (data: {
    start_time: string;
    end_time: string;
    client_id: string;
    price: number;
    notes?: string;
  }) => {
    try {
      await assignTraining.mutateAsync(data);
      toast.success('Tréning priradený');
      setIsCreateDialogOpen(false);
    } catch (error) {
      toast.error('Nepodarilo sa priradiť tréning.');
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteSlot.mutateAsync(id);
      toast.success('Slot zmazaný');
    } catch (error) {
      toast.error('Nepodarilo sa odstrániť termín.');
    }
  };

  const openCreateDialog = (date: Date) => {
    setDialogDate(date);
    setIsCreateDialogOpen(true);
  };

  const handleSlotClick = (slot: SlotWithBooking) => {
    setSelectedSlot(slot);
    setIsSlotDetailOpen(true);
  };

  const handleSlotComplete = async (bookingId: string, clientId: string, price: number, slotId: string) => {
    setIsProcessing(true);
    try {
      await completeTraining.mutateAsync({ bookingId, clientId, price, slotId });
      toast.success('Tréning označený ako odplávaný');
    } catch (e: any) {
      toast.error(e.message || 'Chyba');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotNoShow = async (bookingId: string, clientId: string, price: number, slotId: string) => {
    setIsProcessing(true);
    try {
      await markNoShow.mutateAsync({ bookingId, clientId, price, slotId });
      toast.success('Neúčasť zaznamenaná');
    } catch (e: any) {
      toast.error(e.message || 'Chyba');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotCancel = async (bookingId: string, reason?: string) => {
    setIsProcessing(true);
    try {
      await cancelBooking.mutateAsync({ bookingId, reason });
      toast.success('Tréning zrušený');
    } catch (e: any) {
      toast.error(e.message || 'Chyba');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotApprove = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      await approveBooking.mutateAsync(bookingId);
      toast.success('Rezervácia potvrdená');
    } catch (e: any) {
      toast.error(e.message || 'Chyba');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSlotReject = async (bookingId: string) => {
    setIsProcessing(true);
    try {
      await rejectBooking.mutateAsync({ bookingId });
      toast.success('Rezervácia zamietnutá');
    } catch (e: any) {
      toast.error(e.message || 'Chyba');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleYearDayClick = (date: Date) => {
    setSelectedDate(date);
    setViewMode('month');
  };

  const getDayModifiers = () => {
    if (!monthSlots) return {};
    const hasAvailable: Date[] = [];
    const hasBooked: Date[] = [];
    monthSlots.forEach((value, key) => {
      const date = new Date(key);
      if (value.hasAvailable) hasAvailable.push(date);
      if (value.hasBooked) hasBooked.push(date);
    });
    return { hasAvailable, hasBooked };
  };

  const modifiers = getDayModifiers();

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Kalendár</h1>
            <p className="text-muted-foreground">Spravujte tréningové termíny</p>
          </div>
          <Button onClick={() => openCreateDialog(selectedDate || new Date())} className="ios-press">
            <Plus className="mr-2 h-4 w-4" />
            Nový tréning
          </Button>
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'week' | 'month' | 'year')} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="week" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Týždeň</span>
              <span className="sm:hidden">Týž.</span>
            </TabsTrigger>
            <TabsTrigger value="month" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Mesiac</span>
            </TabsTrigger>
            <TabsTrigger value="year" className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4" />
              <span>Rok</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="mt-4">
            <Card className="ios-card border-0">
              <CardContent className="p-4">
                {weeklyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <WeeklyCalendarGrid
                    weekStart={weekStart}
                    slots={weeklySlots || []}
                    onPreviousWeek={() => setWeekStart(subWeeks(weekStart, 1))}
                    onNextWeek={() => setWeekStart(addWeeks(weekStart, 1))}
                    onAddSlot={openCreateDialog}
                    onSlotClick={handleSlotClick}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="month" className="mt-4 space-y-4">
            <Card className="ios-card border-0">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  locale={sk}
                  className="rounded-md"
                  modifiers={modifiers}
                  modifiersClassNames={{
                    hasAvailable: 'bg-emerald-100 dark:bg-emerald-950/50 font-bold',
                    hasBooked: 'ring-2 ring-sky-500 ring-inset',
                  }}
                />
                <div className="flex gap-4 text-xs text-muted-foreground justify-center mt-4 pt-4 border-t">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-950/50" />
                    <span>Voľné termíny</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded ring-2 ring-sky-500 ring-inset" />
                    <span>Rezervované</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="ios-card border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedDate ? (
                      <>Termíny – {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}</>
                    ) : 'Vyberte dátum'}
                  </CardTitle>
                  {selectedDate && (
                    <Button
                      size="sm"
                      onClick={() => openCreateDialog(selectedDate)}
                      className="ios-press"
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Pridať
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="mb-3 h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">Žiadne termíny na tento deň</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <SlotCard key={slot.id} slot={slot} onDelete={handleDeleteSlot} isDeleting={deleteSlot.isPending} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="year" className="mt-4">
            <Card className="ios-card border-0">
              <CardContent className="p-4">
                {yearLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <YearCalendarGrid
                    year={selectedYear}
                    yearSlots={yearSlots}
                    onPreviousYear={() => setSelectedYear(y => y - 1)}
                    onNextYear={() => setSelectedYear(y => y + 1)}
                    onDayClick={handleYearDayClick}
                    selectedDate={selectedDate}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <CreateTrainingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        selectedDate={dialogDate}
        clients={clients}
        onCreateSlot={handleAddSlot}
        onAssignTraining={handleAssignTraining}
        isLoading={createSlot.isPending || assignTraining.isPending}
      />
      <SlotDetailDialog
        slot={selectedSlot}
        open={isSlotDetailOpen}
        onOpenChange={setIsSlotDetailOpen}
        onComplete={handleSlotComplete}
        onNoShow={handleSlotNoShow}
        onCancel={handleSlotCancel}
        onApprove={handleSlotApprove}
        onReject={handleSlotReject}
        onDelete={handleDeleteSlot}
        isProcessing={isProcessing}
      />
    </AdminLayout>
  );
}
