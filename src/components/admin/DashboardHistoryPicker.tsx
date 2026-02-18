import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { sk } from 'date-fns/locale';
import { DashboardDateRange } from '@/hooks/useAdminDashboardStats';

interface DashboardHistoryPickerProps {
  onSelectRange: (range: DashboardDateRange) => void;
  currentRange: DashboardDateRange | null;
  onClear: () => void;
}

type HistoryGranularity = 'week' | 'month';

export function DashboardHistoryPicker({ onSelectRange, currentRange, onClear }: DashboardHistoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [granularity, setGranularity] = useState<HistoryGranularity>('week');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2024, i, 1), 'LLLL', { locale: sk }),
  }));

  // Get weeks for selected month
  const getWeeksInMonth = () => {
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth, 1));
    const monthEnd = endOfMonth(monthStart);
    const weeks: { start: Date; end: Date; label: string }[] = [];
    
    let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    while (weekStart <= monthEnd) {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `${format(weekStart, 'd.M.', { locale: sk })} – ${format(weekEnd, 'd.M.', { locale: sk })}`,
      });
      weekStart = addDays(weekEnd, 1);
    }
    return weeks;
  };

  const handleSelectMonth = () => {
    const start = startOfMonth(new Date(selectedYear, selectedMonth, 1));
    const end = endOfMonth(start);
    onSelectRange({
      start,
      end,
      label: format(start, 'LLLL yyyy', { locale: sk }),
    });
    setOpen(false);
  };

  const handleSelectWeek = (weekStart: Date, weekEnd: Date, label: string) => {
    onSelectRange({
      start: weekStart,
      end: weekEnd,
      label: `Týždeň ${label}`,
    });
    setOpen(false);
  };

  const weeks = getWeeksInMonth();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={currentRange ? 'default' : 'outline'}
          size="sm"
          className="gap-1.5 text-xs h-8 rounded-xl"
        >
          <History className="h-3.5 w-3.5" />
          {currentRange ? currentRange.label : 'História'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Zobraziť obdobie</h4>
            {currentRange && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                Aktuálne
              </Button>
            )}
          </div>

          {/* Year selector */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSelectedYear(y => y - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium flex-1 text-center">{selectedYear}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setSelectedYear(y => Math.min(y + 1, currentYear))}
              disabled={selectedYear >= currentYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month selector */}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(v) => setSelectedMonth(parseInt(v))}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()} className="text-xs capitalize">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Granularity toggle */}
          <div className="flex gap-1 bg-muted/60 rounded-lg p-0.5">
            <button
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${granularity === 'month' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
              onClick={() => setGranularity('month')}
            >
              Celý mesiac
            </button>
            <button
              className={`flex-1 text-xs py-1.5 rounded-md transition-colors ${granularity === 'week' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'}`}
              onClick={() => setGranularity('week')}
            >
              Podľa týždňa
            </button>
          </div>

          {/* Action */}
          {granularity === 'month' ? (
            <Button size="sm" className="w-full text-xs h-8" onClick={handleSelectMonth}>
              Zobraziť {months[selectedMonth].label} {selectedYear}
            </Button>
          ) : (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {weeks.map((w, i) => (
                <button
                  key={i}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => handleSelectWeek(w.start, w.end, w.label)}
                >
                  {w.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
