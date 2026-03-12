import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, User, Loader2, CalendarIcon, Lock, UserX } from 'lucide-react';
import { Profile } from '@/types/database';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';

type SlotMode = 'free' | 'client' | 'external';

interface CreateTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  clients: Profile[];
  onCreateSlot: (data: { start_time: string; end_time: string; notes?: string }) => Promise<void>;
  onAssignTraining: (data: {
    start_time: string;
    end_time: string;
    client_id: string;
    price: number;
    notes?: string;
  }) => Promise<void>;
  onCreateBlockedSlot?: (data: {
    start_time: string;
    end_time: string;
    blocked_client_name: string;
    blocked_price: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function CreateTrainingDialog({
  open,
  onOpenChange,
  selectedDate,
  clients,
  onCreateSlot,
  onAssignTraining,
  onCreateBlockedSlot,
  isLoading,
}: CreateTrainingDialogProps) {
  const [trainingDate, setTrainingDate] = useState<Date>(selectedDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [mode, setMode] = useState<SlotMode>('free');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [price, setPrice] = useState(DEFAULT_TRAINING_PRICE.toString());
  const [notes, setNotes] = useState('');
  const [blockedClientName, setBlockedClientName] = useState('');

  const resetForm = () => {
    setTrainingDate(selectedDate);
    setStartTime('09:00');
    setEndTime('10:00');
    setMode('free');
    setSelectedClient('');
    setPrice(DEFAULT_TRAINING_PRICE.toString());
    setNotes('');
    setBlockedClientName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = setMinutes(setHours(trainingDate, startHour), startMin);
    const endDateTime = setMinutes(setHours(trainingDate, endHour), endMin);

    if (mode === 'client' && selectedClient) {
      await onAssignTraining({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        client_id: selectedClient,
        price: parseFloat(price),
        notes: notes || undefined,
      });
    } else if (mode === 'external' && blockedClientName.trim()) {
      await onCreateBlockedSlot?.({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        blocked_client_name: blockedClientName.trim(),
        blocked_price: parseFloat(price) || 0,
        notes: notes || undefined,
      });
    } else {
      await onCreateSlot({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: notes || undefined,
      });
    }

    resetForm();
  };

  const canSubmit = mode === 'free' || 
    (mode === 'client' && selectedClient) || 
    (mode === 'external' && blockedClientName.trim());

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="ios-card border-0 mx-4 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Nový tréning
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  {format(trainingDate, 'd. MMMM yyyy', { locale: sk })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={trainingDate}
                  onSelect={(d) => d && setTrainingDate(d)}
                  locale={sk}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Time inputs */}
          <div className="ios-card p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="create-start-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Začiatok
                </Label>
                <Input
                  id="create-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="create-end-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Koniec
                </Label>
                <Input
                  id="create-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Mode selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Typ termínu</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMode('free')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  mode === 'free' 
                    ? 'border-primary bg-primary/10 text-primary' 
                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-foreground/20'
                )}
              >
                <Clock className="h-4 w-4" />
                Voľný slot
              </button>
              <button
                type="button"
                onClick={() => setMode('client')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  mode === 'client'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-foreground/20'
                )}
              >
                <User className="h-4 w-4" />
                Klient
              </button>
              <button
                type="button"
                onClick={() => setMode('external')}
                className={cn(
                  'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-medium',
                  mode === 'external'
                    ? 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-400'
                    : 'border-muted bg-muted/30 text-muted-foreground hover:border-foreground/20'
                )}
              >
                <Lock className="h-4 w-4" />
                Externý
              </button>
            </div>
          </div>

          {/* Client selection - only in client mode */}
          {mode === 'client' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                Klient
              </Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Vybrať klienta..." />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex flex-col">
                        <span>{client.full_name}</span>
                        <span className="text-xs text-muted-foreground">{client.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* External client name */}
          {mode === 'external' && (
            <div className="space-y-2">
              <Label htmlFor="blocked-client-name" className="text-sm font-medium flex items-center gap-2">
                <UserX className="h-4 w-4 text-violet-500" />
                Meno externého klienta
              </Label>
              <Input
                id="blocked-client-name"
                value={blockedClientName}
                onChange={(e) => setBlockedClientName(e.target.value)}
                placeholder="Napr. Mária K."
                className="h-12"
                required
              />
            </div>
          )}

          {/* Price - for client and external modes */}
          {(mode === 'client' || mode === 'external') && (
            <div className="space-y-2">
              <Label htmlFor="create-price" className="text-sm font-medium">
                Cena (€)
              </Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 text-center text-lg font-medium"
                required
              />
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="create-notes" className="text-sm font-medium">
              Poznámky (voliteľné)
            </Label>
            <Textarea
              id="create-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Napr. skupinový tréning, začiatočníci..."
              className="min-h-[60px] resize-none"
            />
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
              className={cn(
                "flex-1 h-12 ios-press",
                mode === 'external' && "bg-violet-600 hover:bg-violet-700 text-white"
              )}
              disabled={isLoading || !canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : mode === 'client' ? (
                'Priradiť tréning'
              ) : mode === 'external' ? (
                'Blokovať termín'
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
