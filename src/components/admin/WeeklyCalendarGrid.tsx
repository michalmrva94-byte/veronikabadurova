import { format, addDays, startOfWeek, isSameDay, isToday } from 'date-fns';
import { sk } from 'date-fns/locale';
import { SlotWithBooking } from '@/hooks/useWeeklySlots';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface WeeklyCalendarGridProps {
  weekStart: Date;
  slots: SlotWithBooking[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onAddSlot: (date: Date) => void;
  onSlotClick?: (slot: SlotWithBooking) => void;
}

const getSlotColor = (slot: SlotWithBooking) => {
  const status = slot.booking?.status;
  if (status === 'proposed') return 'bg-muted border-muted-foreground/30 text-muted-foreground';
  if (status === 'pending' || status === 'awaiting_confirmation') return 'bg-warning/20 border-warning text-warning-foreground';
  if (status === 'booked') return 'bg-primary/20 border-primary text-primary';
  if (status === 'cancelled' || status === 'no_show') return 'bg-destructive/20 border-destructive text-destructive';
  if (status === 'completed') return 'bg-success/20 border-success text-success';
  return 'bg-emerald-100 border-emerald-500 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
};

const getSlotChipColor = (slot: SlotWithBooking) => {
  const status = slot.booking?.status;
  if (status === 'proposed') return 'bg-muted text-muted-foreground border-muted-foreground/30';
  if (status === 'pending' || status === 'awaiting_confirmation') return 'bg-warning/20 text-warning-foreground border-warning';
  if (status === 'booked') return 'bg-primary/20 text-primary border-primary';
  if (status === 'cancelled' || status === 'no_show') return 'bg-destructive/20 text-destructive border-destructive';
  if (status === 'completed') return 'bg-success/20 text-success border-success';
  return 'bg-emerald-100 text-emerald-700 border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-400';
};

function MobileView({
  days,
  getSlotsByDay,
  onSlotClick,
  onAddSlot,
}: {
  days: Date[];
  getSlotsByDay: (day: Date) => SlotWithBooking[];
  onSlotClick?: (slot: SlotWithBooking) => void;
  onAddSlot: (date: Date) => void;
}) {
  return (
    <div className="space-y-1">
      {days.map((day) => {
        const daySlots = getSlotsByDay(day);
        const today = isToday(day);

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'flex items-start gap-3 rounded-xl px-3 py-2.5',
              today && 'bg-primary/5 ring-1 ring-primary/20'
            )}
          >
            {/* Day label */}
            <div className={cn(
              'flex-shrink-0 w-14 text-center rounded-lg py-1.5',
              today ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <p className="text-[10px] font-medium uppercase leading-tight">
                {format(day, 'EEE', { locale: sk })}
              </p>
              <p className="text-base font-bold leading-tight">
                {format(day, 'd')}
              </p>
            </div>

            {/* Slots */}
            <div className="flex-1 flex flex-wrap items-center gap-1.5 min-h-[40px]">
              {daySlots.length === 0 ? (
                <span className="text-xs text-muted-foreground italic">Žiadne tréningy</span>
              ) : (
                daySlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => onSlotClick?.(slot)}
                    className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-colors active:scale-95',
                      getSlotChipColor(slot)
                    )}
                  >
                    <span>{format(new Date(slot.start_time), 'HH:mm')}</span>
                    {slot.booking?.client && (
                      <span className="opacity-80 truncate max-w-[60px]">
                        {slot.booking.client.full_name.split(' ')[0]}
                      </span>
                    )}
                    {(slot.booking?.status === 'pending' || slot.booking?.status === 'awaiting_confirmation') && (
                      <span className="text-[9px]">⏳</span>
                    )}
                    {slot.booking?.status === 'completed' && (
                      <span className="text-[9px]">✓</span>
                    )}
                  </button>
                ))
              )}

              {/* Add button */}
              <button
                onClick={() => onAddSlot(day)}
                className="inline-flex items-center justify-center w-7 h-7 rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DesktopView({
  days,
  getSlotsByDay,
  onSlotClick,
  onAddSlot,
}: {
  days: Date[];
  getSlotsByDay: (day: Date) => SlotWithBooking[];
  onSlotClick?: (slot: SlotWithBooking) => void;
  onAddSlot: (date: Date) => void;
}) {
  return (
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
                    {(slot.booking?.status === 'pending' || slot.booking?.status === 'awaiting_confirmation') && (
                      <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                        Čaká
                      </Badge>
                    )}
                    {slot.booking?.status === 'proposed' && (
                      <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0">
                        Návrh
                      </Badge>
                    )}
                    {slot.booking?.status === 'completed' && (
                      <Badge variant="outline" className="mt-1 text-[10px] px-1 py-0 border-success text-success">
                        ✓
                      </Badge>
                    )}
                  </button>
                ))}
              </div>

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
  );
}

export function WeeklyCalendarGrid({
  weekStart,
  slots,
  onPreviousWeek,
  onNextWeek,
  onAddSlot,
  onSlotClick,
}: WeeklyCalendarGridProps) {
  const isMobile = useIsMobile();
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

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

      {/* Calendar grid */}
      {isMobile ? (
        <MobileView days={days} getSlotsByDay={getSlotsByDay} onSlotClick={onSlotClick} onAddSlot={onAddSlot} />
      ) : (
        <DesktopView days={days} getSlotsByDay={getSlotsByDay} onSlotClick={onSlotClick} onAddSlot={onAddSlot} />
      )}

      {/* Legend */}
      <div className={cn(
        'flex flex-wrap gap-3 text-xs text-muted-foreground justify-center',
        isMobile && 'gap-x-4 gap-y-1.5'
      )}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-500" />
          <span>Voľný</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-muted border border-muted-foreground/30" />
          <span>Návrh</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/20 border border-warning" />
          <span>Čaká</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-primary/20 border border-primary" />
          <span>Potvrdené</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/20 border border-success" />
          <span>Odpláv.</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive" />
          <span>Zrušené</span>
        </div>
      </div>
    </div>
  );
}
