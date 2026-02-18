import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Megaphone, Send, Clock, Users, AlertTriangle, Plus, Percent, Loader2, CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, setHours, setMinutes } from 'date-fns';
import { sk } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useClients } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AdminBroadcastPage() {
  // Last-minute slot form
  const [slotDate, setSlotDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('20');
  const [slotNotes, setSlotNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Broadcast form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const { createSlot } = useTrainingSlots();
  const { data: clients = [] } = useClients();
  const queryClient = useQueryClient();

  const approvedClients = clients.filter(c => c.approval_status === 'approved');

  const basePrice = DEFAULT_TRAINING_PRICE;
  const discount = hasDiscount ? Math.min(100, Math.max(0, parseInt(discountPercent) || 0)) : 0;
  const finalPrice = basePrice * (1 - discount / 100);

  const handleCreateLastMinuteSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    setIsCreating(true);
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startDateTime = setMinutes(setHours(slotDate, startH), startM);
      const endDateTime = setMinutes(setHours(slotDate, endH), endM);

      // Create the slot
      const slotResult = await createSlot.mutateAsync({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: slotNotes || `Last-minute${discount > 0 ? ` (-${discount}%)` : ''}`,
      });

      // Auto-fill broadcast form
      const timeStr = format(startDateTime, 'HH:mm');
      const dateStr = format(startDateTime, 'd. MMMM', { locale: sk });
      const priceStr = discount > 0
        ? `so zľavou ${discount}% (${finalPrice.toFixed(2)}€ namiesto ${basePrice.toFixed(2)}€)`
        : `za ${basePrice.toFixed(2)}€`;

      setTitle(`🏊 Voľný termín ${dateStr} o ${timeStr}!`);
      setMessage(
        `Uvoľnil sa termín na ${dateStr} o ${timeStr} ${priceStr}. Prvý, kto si rezervuje, pláva! 🏊‍♀️`
      );

      toast.success('Last-minute slot vytvorený!');
      setStartTime('');
      setEndTime('');
      setSlotNotes('');
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa vytvoriť slot');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!title || !message || approvedClients.length === 0) return;

    setIsSending(true);
    try {
      // Send notification to all approved clients
      const notifications = approvedClients.map(client => ({
        user_id: client.id,
        title,
        message,
        type: 'last_minute',
        is_last_minute: true,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;

      toast.success(`Broadcast odoslaný ${approvedClients.length} klientom!`);
      setTitle('');
      setMessage('');
    } catch (err: any) {
      toast.error(err.message || 'Nepodarilo sa odoslať broadcast');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Last-minute broadcast</h1>
          <p className="text-muted-foreground">
            Vytvorte last-minute termín a ponúknite ho klientom
          </p>
        </div>

        {/* Info card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex gap-3 p-4">
            <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Ako to funguje?</p>
              <p className="text-muted-foreground">
                Vytvorte last-minute termín (voliteľne so zľavou), systém automaticky 
                predvyplní broadcast správu. Potom ju odošlite všetkým klientom.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Create Last-Minute Slot */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5" />
              Vytvoriť last-minute termín
            </CardTitle>
            <CardDescription>
              Vytvorte voľný slot a voliteľne aplikujte zľavu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateLastMinuteSlot} className="space-y-4">
              {/* Date picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-primary" />
                  Dátum
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full h-12 justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(slotDate, 'd. MMMM yyyy', { locale: sk })}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={slotDate}
                      onSelect={(d) => d && setSlotDate(d)}
                      locale={sk}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time inputs */}
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Začiatok
                  </Label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-12 text-center text-lg font-medium"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Koniec
                  </Label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-12 text-center text-lg font-medium"
                    required
                  />
                </div>
              </div>

              {/* Discount toggle */}
              <div className="ios-card p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Percent className="h-4 w-4 text-primary" />
                    Aplikovať zľavu
                  </Label>
                  <Switch
                    checked={hasDiscount}
                    onCheckedChange={setHasDiscount}
                  />
                </div>

                {hasDiscount && (
                  <div className="space-y-3 animate-ios-fade-in">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Výška zľavy (%)</Label>
                      <div className="flex gap-2">
                        {['10', '20', '30', '50'].map((val) => (
                          <Button
                            key={val}
                            type="button"
                            variant={discountPercent === val ? 'default' : 'outline'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setDiscountPercent(val)}
                          >
                            {val}%
                          </Button>
                        ))}
                      </div>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        className="h-10 text-center"
                        placeholder="Vlastná %"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm bg-muted/50 rounded-xl p-3">
                      <span className="text-muted-foreground">Pôvodná cena:</span>
                      <span className="line-through">{basePrice.toFixed(2)}€</span>
                    </div>
                    <div className="flex items-center justify-between text-sm bg-primary/10 rounded-xl p-3 font-semibold">
                      <span className="text-primary">Cena so zľavou:</span>
                      <span className="text-primary text-lg">{finalPrice.toFixed(2)}€</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Poznámky (voliteľné)</Label>
                <Textarea
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  placeholder="Napr. uvoľnený termín po zrušení..."
                  className="min-h-[60px] resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 ios-press"
                disabled={isCreating || !startTime || !endTime}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vytváram...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Vytvoriť last-minute slot
                    {hasDiscount && ` (-${discount}%)`}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Broadcast form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5" />
              Odoslať broadcast
            </CardTitle>
            <CardDescription>
              Správa bude odoslaná všetkým schváleným klientom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nadpis</Label>
              <Input
                placeholder="Voľný termín dnes o 18:00!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Správa</Label>
              <Textarea
                placeholder="Uvoľnil sa termín na dnes o 18:00. Prvý, kto si rezervuje, pláva! 🏊‍♀️"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Odošle sa {approvedClients.length} klientom</span>
            </div>

            <Button
              className="w-full h-12 ios-press"
              disabled={!title || !message || isSending || approvedClients.length === 0}
              onClick={handleSendBroadcast}
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Odosielam...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Odoslať broadcast
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Upozornenie</p>
              <p className="text-muted-foreground">
                Broadcast odošle notifikáciu všetkým klientom naraz. 
                Používajte ho len pre skutočne last-minute ponuky.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}