import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useState } from 'react';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Clock, AlertCircle } from 'lucide-react';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Placeholder - no slots yet
  const slots: any[] = [];

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
            {slots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Na vybraný deň nie sú dostupné žiadne termíny
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Slots will be rendered here */}
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
    </ClientLayout>
  );
}
