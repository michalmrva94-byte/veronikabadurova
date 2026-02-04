import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Loader2 } from 'lucide-react';

interface AddSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onSubmit: (data: { start_time: string; end_time: string; notes?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function AddSlotDialog({
  open,
  onOpenChange,
  selectedDate,
  onSubmit,
  isLoading,
}: AddSlotDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = setMinutes(setHours(selectedDate, startHour), startMin);
    const endDateTime = setMinutes(setHours(selectedDate, endHour), endMin);

    await onSubmit({
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      notes: notes || undefined,
    });

    // Reset form
    setStartTime('09:00');
    setEndTime('10:00');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ios-card border-0 mx-4 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Pridať tréningový slot
          </DialogTitle>
          <p className="text-sm text-muted-foreground text-center">
            {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="ios-card p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="start-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Začiatok
                </Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="end-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Koniec
                </Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Poznámky (voliteľné)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Napr. skupinový tréning, začiatočníci..."
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1 h-12 ios-press"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Zrušiť
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 ios-press"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : (
                'Pridať slot'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
