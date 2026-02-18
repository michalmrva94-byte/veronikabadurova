import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { TrainingSlot } from '@/types/database';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Clock, Trash2, User, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlotCardProps {
  slot: TrainingSlot;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export function SlotCard({ slot, onDelete, isDeleting }: SlotCardProps) {
  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);

  return (
    <div className={cn(
      "ios-card p-4 transition-all",
      !slot.is_available && "opacity-60"
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-semibold text-lg">
              {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
            </span>
          </div>

          {slot.notes && (
            <p className="text-sm text-muted-foreground mt-1 ml-6">
              {slot.notes}
            </p>
          )}

          <div className="flex items-center gap-2 mt-2 ml-6">
            {slot.is_available ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-full">
                <CheckCircle className="h-3 w-3" />
                Voľný
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
                <User className="h-3 w-3" />
                Rezervovaný
              </span>
            )}
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 ios-press"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Zmazať termín?</AlertDialogTitle>
              <AlertDialogDescription>
                Naozaj chcete odstrániť tento termín ({format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')})? Táto akcia sa nedá vrátiť späť.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Späť</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(slot.id)}
              >
                Zmazať
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
