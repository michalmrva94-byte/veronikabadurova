import { format, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';
import { sk } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DaySlotSummary } from '@/hooks/useSlotsForYear';
import { useIsMobile } from '@/hooks/use-mobile';

interface YearCalendarGridProps {
  year: number;
  yearSlots: Map<string, DaySlotSummary> | undefined;
  onPreviousYear: () => void;
  onNextYear: () => void;
  onDayClick: (date: Date) => void;
  selectedDate?: Date;
}

function MiniMonth({
  month,
  yearSlots,
  onDayClick,
  selectedDate,
}: {
  month: Date;
  yearSlots: Map<string, DaySlotSummary> | undefined;
  onDayClick: (date: Date) => void;
  selectedDate?: Date;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });

  // Build 6 weeks of days
  const weeks: Date[][] = [];
  let day = calStart;
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(day);
      day = addDays(day, 1);
    }
    // Only include week if at least one day is in this month
    if (week.some(d => isSameMonth(d, month))) {
      weeks.push(week);
    }
  }

  const dayNames = ['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'];

  return (
    <div className="p-3">
      <h4 className="text-sm font-semibold text-center mb-2">
        {format(month, 'LLLL', { locale: sk })}
      </h4>
      <div className="grid grid-cols-7 gap-px">
        {dayNames.map(d => (
          <div key={d} className="text-[9px] text-muted-foreground text-center font-medium py-0.5">
            {d}
          </div>
        ))}
        {weeks.map((week, wi) =>
          week.map((d, di) => {
            const inMonth = isSameMonth(d, month);
            const dateKey = format(d, 'yyyy-MM-dd');
            const summary = yearSlots?.get(dateKey);
            const today = isToday(d);
            const selected = selectedDate && isSameDay(d, selectedDate);

            let dotColor = '';
            if (summary) {
              if (summary.hasBooked && summary.hasAvailable) dotColor = 'bg-sky-500';
              else if (summary.hasBooked) dotColor = 'bg-sky-500';
              else if (summary.hasAvailable) dotColor = 'bg-emerald-500';
            }

            return (
              <button
                key={`${wi}-${di}`}
                onClick={() => inMonth && onDayClick(d)}
                disabled={!inMonth}
                className={cn(
                  'relative flex flex-col items-center justify-center h-6 w-full rounded-sm text-[10px] transition-colors',
                  !inMonth && 'opacity-0 pointer-events-none',
                  inMonth && 'hover:bg-muted',
                  today && 'font-bold text-primary',
                  selected && 'bg-primary text-primary-foreground hover:bg-primary/90 rounded-md'
                )}
              >
                <span>{format(d, 'd')}</span>
                {dotColor && !selected && (
                  <span className={cn('absolute bottom-0 w-1 h-1 rounded-full', dotColor)} />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function YearCalendarGrid({
  year,
  yearSlots,
  onPreviousYear,
  onNextYear,
  onDayClick,
  selectedDate,
}: YearCalendarGridProps) {
  const isMobile = useIsMobile();
  const months = Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));

  return (
    <div className="space-y-4">
      {/* Year navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onPreviousYear}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h3 className="text-lg font-semibold">{year}</h3>
        <Button variant="ghost" size="icon" onClick={onNextYear}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Month grid */}
      <div className={cn(
        'grid gap-2',
        isMobile ? 'grid-cols-2' : 'grid-cols-3 lg:grid-cols-4'
      )}>
        {months.map(month => (
          <div key={month.getMonth()} className="bg-card rounded-xl border border-border/50">
            <MiniMonth
              month={month}
              yearSlots={yearSlots}
              onDayClick={onDayClick}
              selectedDate={selectedDate}
            />
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground justify-center">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Voľné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-500" />
          <span>Rezervované</span>
        </div>
      </div>
    </div>
  );
}
