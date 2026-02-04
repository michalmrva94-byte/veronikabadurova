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

interface AssignTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  clients: Profile[];
  onSubmit: (data: {
    start_time: string;
    end_time: string;
    client_id: string;
    price: number;
    notes?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

export function AssignTrainingDialog({
  open,
  onOpenChange,
  selectedDate,
  clients,
  onSubmit,
  isLoading,
}: AssignTrainingDialogProps) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [price, setPrice] = useState(DEFAULT_TRAINING_PRICE.toString());
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) return;

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startDateTime = setMinutes(setHours(selectedDate, startHour), startMin);
    const endDateTime = setMinutes(setHours(selectedDate, endHour), endMin);

    await onSubmit({
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      client_id: selectedClient,
      price: parseFloat(price),
      notes: notes || undefined,
    });

    // Reset form
    setStartTime('09:00');
    setEndTime('10:00');
    setSelectedClient('');
    setPrice(DEFAULT_TRAINING_PRICE.toString());
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="ios-card border-0 mx-4 max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center">
            Priradiť tréning klientovi
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground text-center">
            {format(selectedDate, 'd. MMMM yyyy', { locale: sk })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Client selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Vyber klienta
            </Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Vyber klienta..." />
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

          {/* Time inputs */}
          <div className="ios-card p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="assign-start-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Začiatok
                </Label>
                <Input
                  id="assign-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="assign-end-time" className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Koniec
                </Label>
                <Input
                  id="assign-end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="h-12 text-center text-lg font-medium"
                  required
                />
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="assign-price" className="text-sm font-medium">
                Cena (€)
              </Label>
              <Input
                id="assign-price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-12 text-center text-lg font-medium"
                required
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="assign-notes" className="text-sm font-medium">
                Poznámky (voliteľné)
              </Label>
              <Textarea
                id="assign-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Napr. špeciálny tréning..."
                className="min-h-[60px] resize-none"
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
              disabled={isLoading || !selectedClient}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ukladám...
                </>
              ) : (
                'Priradiť tréning'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
