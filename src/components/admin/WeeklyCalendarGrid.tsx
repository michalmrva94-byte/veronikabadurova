import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { sk } from 'date-fns/locale';
import { SlotWithBooking } from '@/hooks/useWeeklySlots';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  slots: SlotWithBooking[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddSlot: (date: Date) => void;
  onSlotClick?: (slot: SlotWithBooking) => void;
}

export function WeeklyCalendarGrid({
  weekStart,
  slots,
  onPreviousWeek,
  onNextWeek,
  onAddSlot,
  onSlotClick,
}: WeeklyCalendarGridProps) {
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

  const getSlotColor = (slot: SlotWithBooking) => {
    if (slot.booking?.status === 'booked') {
      return 'bg-primary/20 border-primary text-primary';
    }
    if (slot.booking?.status === 'pending') {
      return 'bg-warning/20 border-warning text-warning-foreground';
    }
    return 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
  };

  const getSlotsByDay = (day: Date) => {
    return slots.filter((slot) => isSameDay(new Date(slot.start_time), day));
  };

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onPreviousWeek}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(days[0], 'd. MMM', { locale: sk })} - {format(days[6], 'd. MMM yyyy', { locale: sk })}
        </h3>
        <Button variant="ghost" size="icon" onClick={onNextWeek}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* 7-day grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const daySlots = getSlotsByDay(day);
          const dayIsToday = isToday(day);

          return (
            <Card
              key={day.toISOString()}
              className={cn(
                'min-h-[200px] border',
                dayIsToday && 'ring-2 ring-primary ring-offset-2'
              )}
            >
              <CardContent className="p-2 space-y-2">
                {/* Day header */}
                <div className={cn(
                  'text-center p-2 rounded-lg',
                  dayIsToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  <p className="text-xs font-medium">
                    {format(day, 'EEE', { locale: sk })}
                  </p>
                  <p className={cn(
                    'text-lg font-bold',
                    dayIsToday ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>

                {/* Slots */}
                <div className="space-y-1.5">
                  {daySlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => onSlotClick?.(slot)}
                      className={cn(
                        'w-full text-left p-2 rounded-lg border text-xs transition-all hover:scale-[1.02]',
                        getSlotColor(slot)
                      )}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {format(new Date(slot.start_time), 'HH:mm')}
                      </div>
                      {slot.booking?.client && (
                        <div className="flex items-center gap-1 mt-1 text-xs opacity-80">
                          <User className="h-3 w-3" />
                          <span className="truncate">
                            {slot.booking.client.full_name.split(' ')[0]}
                          </span>
                        </div>
                      )}
                      {slot.booking?.status === 'pending' && (
                        <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                          Čaká
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* Add slot button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => onAddSlot(day)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Pridať
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" />
          <span>Voľný</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/20 border border-warning" />
          <span>Čaká na potvrdenie</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/20 border border-primary" />
          <span>Rezervované</span>
        </div>
      </div>
    </div>
  );
}
