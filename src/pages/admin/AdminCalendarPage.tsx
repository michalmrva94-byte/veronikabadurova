import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Plus, Clock, Loader2 } from 'lucide-react';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { AddSlotDialog } from '@/components/admin/AddSlotDialog';
import { SlotCard } from '@/components/admin/SlotCard';
import { toast } from 'sonner';

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { slots, isLoading, createSlot, deleteSlot } = useTrainingSlots(selectedDate);

  const handleAddSlot = async (data: { start_time: string; end_time: string; notes?: string }) => {
    try {
      await createSlot.mutateAsync(data);
      toast.success('Slot vytvorený', {
        description: 'Tréningový termín bol úspešne pridaný.',
      });
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating slot:', error);
      toast.error('Chyba', {
        description: 'Nepodarilo sa vytvoriť termín. Skúste znova.',
      });
    }
  };

  const handleDeleteSlot = async (id: string) => {
    try {
      await deleteSlot.mutateAsync(id);
      toast.success('Slot zmazaný', {
        description: 'Tréningový termín bol odstránený.',
      });
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast.error('Chyba', {
        description: 'Nepodarilo sa odstrániť termín. Skúste znova.',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Kalendár</h1>
            <p className="text-muted-foreground">
              Spravujte tréningové termíny
            </p>
          </div>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            disabled={!selectedDate}
            className="ios-press"
          >
            <Plus className="mr-2 h-4 w-4" />
            Pridať slot
          </Button>
        </div>

        {/* Calendar */}
        <Card className="ios-card border-0">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={sk}
              className="rounded-md"
            />
          </CardContent>
        </Card>

        {/* Slots for selected date */}
        <Card className="ios-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedDate ? (
                <>Termíny - {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}</>
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
                <p className="text-muted-foreground mb-4">
                  Na tento deň nie sú vytvorené žiadne termíny
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(true)}
                  disabled={!selectedDate}
                  className="ios-press"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Pridať termín
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {slots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onDelete={handleDeleteSlot}
                    isDeleting={deleteSlot.isPending}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Slot Dialog */}
      {selectedDate && (
        <AddSlotDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          selectedDate={selectedDate}
          onSubmit={handleAddSlot}
          isLoading={createSlot.isPending}
        />
      )}
    </AdminLayout>
  );
}
