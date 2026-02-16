import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Loader2, CheckCircle, Calendar } from 'lucide-react';
import { useProposedTrainings, DayTimeSelection, ConflictInfo } from '@/hooks/useProposedTrainings';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const DAYS = [
  { value: 1, label: 'Pondelok' },
  { value: 2, label: 'Utorok' },
  { value: 3, label: 'Streda' },
  { value: 4, label: 'Štvrtok' },
  { value: 5, label: 'Piatok' },
  { value: 6, label: 'Sobota' },
  { value: 7, label: 'Nedeľa' },
];

const HOURS = Array.from({ length: 14 }, (_, i) => i + 6); // 6:00 - 19:00

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
}

export function ProposeFixedTrainingsDialog({ open, onOpenChange, clientId, clientName }: Props) {
  const { proposeFixedTrainings } = useProposedTrainings();
  const [selectedDays, setSelectedDays] = useState<Record<number, { hour: number; minute: number }>>({});
  const [weeksAhead, setWeeksAhead] = useState<string>('1');
  const [skipConflicts, setSkipConflicts] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [showConflicts, setShowConflicts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) => {
      if (prev[day]) {
        const next = { ...prev };
        delete next[day];
        return next;
      }
      return { ...prev, [day]: { hour: 18, minute: 0 } };
    });
    setShowConflicts(false);
    setConflicts([]);
  };

  const setDayTime = (day: number, hour: number) => {
    setSelectedDays((prev) => ({
      ...prev,
      [day]: { hour, minute: 0 },
    }));
    setShowConflicts(false);
    setConflicts([]);
  };

  const handleSubmit = async () => {
    const selections: DayTimeSelection[] = Object.entries(selectedDays).map(([day, time]) => ({
      dayOfWeek: parseInt(day),
      hour: time.hour,
      minute: time.minute,
    }));

    if (selections.length === 0) {
      toast.error('Vyberte aspoň jeden deň');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await proposeFixedTrainings.mutateAsync({
        clientId,
        selections,
        weeksAhead: parseInt(weeksAhead),
        skipConflicts,
      });

      if (result.conflicts.length > 0 && result.created === 0) {
        setConflicts(result.conflicts);
        setShowConflicts(true);
        return;
      }

      if (result.created > 0) {
        toast.success(`Vytvorených ${result.created} návrhov tréningov`);
        if (result.skipped > 0) {
          toast.info(`${result.skipped} termínov preskočených (konflikty)`);
        }
        handleClose();
      }
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa vytvoriť návrhy');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDays({});
    setConflicts([]);
    setShowConflicts(false);
    setSkipConflicts(false);
    setWeeksAhead('1');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Navrhnúť fixné tréningy
          </DialogTitle>
          <p className="text-sm text-muted-foreground">Pre: {clientName}</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Day selection with time */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Výber dní a časov</Label>
            {DAYS.map((day) => (
              <div key={day.value} className="flex items-center gap-3">
                <Checkbox
                  checked={!!selectedDays[day.value]}
                  onCheckedChange={() => toggleDay(day.value)}
                  id={`day-${day.value}`}
                />
                <label htmlFor={`day-${day.value}`} className="text-sm flex-1 cursor-pointer">
                  {day.label}
                </label>
                {selectedDays[day.value] && (
                  <Select
                    value={selectedDays[day.value].hour.toString()}
                    onValueChange={(v) => setDayTime(day.value, parseInt(v))}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={h.toString()}>
                          {h.toString().padStart(2, '0')}:00
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
          </div>

          {/* Range selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Rozsah</Label>
            <Select value={weeksAhead} onValueChange={setWeeksAhead}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Najbližší 1 týždeň</SelectItem>
                <SelectItem value="2">Najbližšie 2 týždne</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conflicts display */}
          {showConflicts && conflicts.length > 0 && (
            <div className="space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertTriangle className="h-4 w-4" />
                Konflikt termínu ({conflicts.length})
              </div>
              <div className="space-y-1">
                {conflicts.map((c, i) => (
                  <div key={i} className="text-xs text-muted-foreground flex justify-between">
                    <span>
                      {format(new Date(c.date), 'EEEE d. MMM, HH:mm', { locale: sk })}
                    </span>
                    <span className="text-destructive">{c.reason}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-destructive/20">
                <Switch
                  checked={skipConflicts}
                  onCheckedChange={setSkipConflicts}
                  id="skip-conflicts"
                />
                <Label htmlFor="skip-conflicts" className="text-xs cursor-pointer">
                  Preskočiť konfliktné termíny
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Zrušiť
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(selectedDays).length === 0 || isSubmitting || (showConflicts && !skipConflicts)}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Vytváranie...
              </>
            ) : showConflicts && skipConflicts ? (
              'Vytvoriť bez konfliktov'
            ) : (
              'Vytvoriť návrhy tréningov'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
