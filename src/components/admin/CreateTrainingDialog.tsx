import { useState } from 'react';
import { format, setHours, setMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
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
import { Clock, User, Loader2 } from 'lucide-react';
import { Profile } from '@/types/database';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';

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
  isLoading?: boolean;
}

const NO_CLIENT_VALUE = '__none__';

export function CreateTrainingDialog({
  open,
  onOpenChange,
  selectedDate,
  clients,
  onCreateSlot,
  onAssignTraining,
  isLoading,
}: CreateTrainingDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedClient, setSelectedClient] = useState<string>(NO_CLIENT_VALUE);
  const [price, setPrice] = useState(DEFAULT_TRAINING_PRICE.toString());
  const [notes, setNotes] = useState('');

  const hasClient = selectedClient !== NO_CLIENT_VALUE;

  const resetForm = () => {
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedClient(NO_CLIENT_VALUE);
    setPrice(DEFAULT_TRAINING_PRICE.toString());
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = setMinutes(setHours(selectedDate, startHour), startMin);
    const endDateTime = setMinutes(setHours(selectedDate, endHour), endMin);

    if (hasClient) {
      await onAssignTraining({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        client_id: selectedClient,
        price: parseFloat(price),
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

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetForm(); onOpenChange(v); }}>
      <DialogContent className="ios-card border-0 mx-4 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Nový tréning
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}
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

          {/* Client selection (optional) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Klient (voliteľné)
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Bez klienta – voľný slot" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value={NO_CLIENT_VALUE}>Bez klienta – voľný slot</SelectItem>
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

          {/* Price - only when client selected */}
          {hasClient && (
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
              className="flex-1 h-12 ios-press"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : hasClient ? (
                'Priradiť tréning'
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
