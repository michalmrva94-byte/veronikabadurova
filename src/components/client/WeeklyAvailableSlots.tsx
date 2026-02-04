import { format, addDays, startOfWeek, isSameDay, isToday, isBefore } from 'date-fns';
import { sk } from 'date-fns/locale';
import { SlotWithBooking } from '@/hooks/useWeeklySlots';
import { Button } from '@/components/ui/button';
import { Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrainingSlot } from '@/types/database';

interface WeeklyAvailableSlotsProps {
  weekStart: Date;
  slots: SlotWithBooking[];
  onSlotClick: (slot: TrainingSlot) => void;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

export function WeeklyAvailableSlots({
  weekStart,
  slots,
  onSlotClick,
  selectedDate,
  onDateSelect,
}: WeeklyAvailableSlotsProps) {
  const weekStartDate = startOfWeek(weekStart, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStartDate, i));

  // Filter only available slots (no booking)
  const availableSlots = slots.filter((slot) => !slot.booking);

  const getSlotsByDay = (day: Date) => {
    return availableSlots
      .filter((slot) => isSameDay(new Date(slot.start_time), day))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {days.map((day) => {
          const daySlots = getSlotsByDay(day);
          const isPast = isBefore(day, now) && !isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayIsToday = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateSelect(day)}
              disabled={isPast}
              className={cn(
                'flex flex-col items-center min-w-[60px] py-2 px-3 rounded-xl transition-all ios-press',
                isPast && 'opacity-40 cursor-not-allowed',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : dayIsToday
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted/50 hover:bg-muted',
              )}
            >
              <span className="text-[10px] uppercase font-medium opacity-80">
                {format(day, 'EEE', { locale: sk })}
              </span>
              <span className="text-lg font-bold">{format(day, 'd')}</span>
              {daySlots.length > 0 && !isPast && (
                <span
                  className={cn(
                    'text-[10px] font-medium mt-0.5',
                    isSelected ? 'text-primary-foreground' : 'text-success'
                  )}
                >
                  {daySlots.length} voľ.
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Slots grid for selected day or all week */}
      <div className="space-y-3">
        {days.map((day) => {
          const daySlots = getSlotsByDay(day);
          const isPast = isBefore(day, now) && !isToday(day);
          
          if (isPast || daySlots.length === 0) return null;

          return (
            <div key={day.toISOString()} className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                <span>
                  {isToday(day) ? 'Dnes' : format(day, 'EEEE', { locale: sk })}
                  {' - '}
                  {format(day, 'd. MMMM', { locale: sk })}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {daySlots.map((slot) => (
                  <Button
                    key={slot.id}
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSlotClick(slot);
                    }}
                    className={cn(
                      'h-10 px-4 rounded-xl border-success/30 bg-success/5 hover:bg-success/10 hover:border-success transition-all ios-press',
                      'text-success font-medium'
                    )}
                  >
                    <Clock className="h-4 w-4 mr-1.5" />
                    {format(new Date(slot.start_time), 'HH:mm')}
                  </Button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {availableSlots.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground text-sm">
              V tomto týždni nie sú dostupné žiadne voľné termíny
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
