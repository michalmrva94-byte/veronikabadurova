import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Plus, Clock, Trash2 } from 'lucide-react';

export default function AdminCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Placeholder - no slots yet
  const slots: any[] = [];

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
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Pridať slot
          </Button>
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
            />
          </CardContent>
        </Card>

        {/* Slots for selected date */}
        <Card>
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
            {slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground mb-4">
                  Na tento deň nie sú vytvorené žiadne termíny
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Pridať termín
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Slots will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
