import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { TrainingSlot } from '@/types/database';

interface AvailableSlotCardProps {
  slot: TrainingSlot;
  onBook?: (slotId: string) => void;
  isBooking?: boolean;
}

export function AvailableSlotCard({ slot, onBook, isBooking }: AvailableSlotCardProps) {
  const startTime = format(new Date(slot.start_time), 'HH:mm');
  const endTime = format(new Date(slot.end_time), 'HH:mm');

  return (
    <Card className="ios-card border-0">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {startTime} - {endTime}
              </p>
              {slot.notes && (
                <p className="text-sm text-muted-foreground">{slot.notes}</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => onBook?.(slot.id)}
            disabled={isBooking}
            size="sm"
            className="ios-press"
          >
            Rezervovať
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
