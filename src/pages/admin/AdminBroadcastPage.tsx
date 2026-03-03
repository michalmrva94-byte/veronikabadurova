import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { Megaphone, Send, Clock, Users, AlertTriangle, Plus, Percent, Loader2, CalendarIcon, Zap, XCircle, ChevronDown, BookOpen } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, setHours, setMinutes, formatDistanceToNow, differenceInHours } from 'date-fns';
import { sk } from 'date-fns/locale';
import { DEFAULT_TRAINING_PRICE } from '@/lib/constants';
import { useTrainingSlots } from '@/hooks/useTrainingSlots';
import { useClients } from '@/hooks/useClients';
import { useAdminBookings, AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sendNotificationEmail } from '@/lib/sendNotificationEmail';
import { sendPushNotification } from '@/lib/sendPushNotification';

function CancelledTrainingCard({
  booking,
  onOffer,
}: {
  booking: AdminBookingWithDetails;
  onOffer: (booking: AdminBookingWithDetails) => void;
}) {
  const slotStart = new Date(booking.slot.start_time);
  const hoursUntil = differenceInHours(slotStart, new Date());
  const cancelledAgo = booking.cancelled_at
    ? formatDistanceToNow(new Date(booking.cancelled_at), { locale: sk, addSuffix: true })
    : null;

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
              <span className="font-semibold text-sm">
                {format(slotStart, 'EEEE d. MMMM', { locale: sk })} o {format(slotStart, 'HH:mm')}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Zrušil/a: <span className="font-medium text-foreground">{booking.client.full_name}</span>
              {cancelledAgo && <> · {cancelledAgo}</>}
            </p>
            {booking.cancellation_reason && (
              <p className="text-xs text-muted-foreground italic">
                „{booking.cancellation_reason}"
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Do tréningu: <span className="font-medium text-foreground">{hoursUntil}h</span>
            </p>
          </div>
          <Button
            size="sm"
            className="flex-shrink-0"
            onClick={() => onOffer(booking)}
          >
            <Zap className="mr-1.5 h-3.5 w-3.5" />
            Ponúknuť
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminBroadcastPage() {
  // Last-minute slot form
  const [slotDate, setSlotDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountPercent, setDiscountPercent] = useState('20');
  const [slotNotes, setSlotNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);

  // Broadcast form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [broadcastDiscount, setBroadcastDiscount] = useState(false);
  const [broadcastDiscountPercent, setBroadcastDiscountPercent] = useState('20');
  const [broadcastSlotId, setBroadcastSlotId] = useState<string | null>(null);

  const { createSlot } = useTrainingSlots();
  const { data: clients = [] } = useClients();
  const { bookings, isLoading: bookingsLoading } = useAdminBookings();

  const approvedClients = clients.filter(c => c.approval_status === 'approved');
  const lastMinuteClients = approvedClients.filter(c => c.last_minute_notifications !== false);

  // Filter cancelled bookings with future slots (within 48h) and available
  const now = new Date();
  const cancelledForOffer = bookings
    .filter((b) => {
      if (b.status !== 'cancelled') return false;
      const slotStart = new Date(b.slot.start_time);
      const hoursUntil = differenceInHours(slotStart, now);
      return hoursUntil > 0 && hoursUntil <= 48 && b.slot.is_available;
    })
    .sort((a, b) => {
      const aTime = a.cancelled_at ? new Date(a.cancelled_at).getTime() : 0;
      const bTime = b.cancelled_at ? new Date(b.cancelled_at).getTime() : 0;
      return bTime - aTime;
    });

  const basePrice = DEFAULT_TRAINING_PRICE;
  const discount = hasDiscount ? Math.min(100, Math.max(0, parseInt(discountPercent) || 0)) : 0;
  const finalPrice = basePrice * (1 - discount / 100);

  const broadcastDiscountValue = broadcastDiscount ? Math.min(100, Math.max(0, parseInt(broadcastDiscountPercent) || 0)) : 0;
  const broadcastFinalPrice = basePrice * (1 - broadcastDiscountValue / 100);

  const updateBroadcastMessageWithDiscount = (pct: string) => {
    const d = Math.min(100, Math.max(0, parseInt(pct) || 0));
    const price = basePrice * (1 - d / 100);
    setMessage((prev) => {
      const priceRegex = /za \d+[.,]\d{2}€/;
      const discountRegex = /so zľavou \d+%.*?\d+[.,]\d{2}€/;
      if (d > 0) {
        const newText = `so zľavou ${d}% za ${price.toFixed(2)}€ (namiesto ${basePrice.toFixed(2)}€)`;
        if (discountRegex.test(prev)) return prev.replace(discountRegex, newText);
        if (priceRegex.test(prev)) return prev.replace(priceRegex, newText);
      } else {
        const newText = `za ${basePrice.toFixed(2)}€`;
        if (discountRegex.test(prev)) return prev.replace(discountRegex, newText);
        if (priceRegex.test(prev)) return prev.replace(priceRegex, newText);
      }
      return prev;
    });
  };

  const handleOfferCancelled = (booking: AdminBookingWithDetails) => {
    const slotStart = new Date(booking.slot.start_time);
    const timeStr = format(slotStart, 'HH:mm');
    const dateStr = format(slotStart, 'd. MMMM', { locale: sk });

    setBroadcastSlotId(booking.slot.id);
    setTitle(`🏊 Voľný termín ${dateStr} o ${timeStr}!`);
    setMessage(
      `Uvoľnil sa termín na ${dateStr} o ${timeStr} za ${basePrice.toFixed(2)}€. Prvý, kto si rezervuje, pláva! 🏊‍♀️`
    );
    toast.info('Broadcast predvyplnený — upravte a odošlite.');
  };

  const handleCreateLastMinuteSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startTime || !endTime) return;

    setIsCreating(true);
    try {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const startDateTime = setMinutes(setHours(slotDate, startH), startM);
      const endDateTime = setMinutes(setHours(slotDate, endH), endM);

      const createdSlot = await createSlot.mutateAsync({
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: slotNotes || `Last-minute${discount > 0 ? ` (-${discount}%)` : ''}`,
      });

      setBroadcastSlotId(createdSlot?.id || null);

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
      const notifications = lastMinuteClients.map(client => ({
        user_id: client.id,
        title,
        message,
        type: 'last_minute',
        is_last_minute: true,
        related_slot_id: broadcastSlotId,
      }));

      const { error } = await supabase.from('notifications').insert(notifications);
      if (error) throw error;

      // Send emails to clients with email notifications enabled
      for (const client of lastMinuteClients) {
        if (client.email_notifications) {
          sendNotificationEmail({
            type: 'last_minute',
            to: client.email,
            clientName: client.full_name,
            title,
            message,
            slotId: broadcastSlotId || undefined,
          });
        }
      }

      toast.success(`Broadcast odoslaný ${lastMinuteClients.length} klientom!`);

      // Send push notification to all last-minute clients
      const pushUserIds = lastMinuteClients.map(c => c.user_id);
      if (pushUserIds.length > 0) {
        sendPushNotification({
          user_ids: pushUserIds,
          title,
          body: message,
          url: broadcastSlotId ? `/last-minute` : '/',
        });
      }
      setTitle('');
      setMessage('');
      setBroadcastSlotId(null);
      setBroadcastDiscount(false);
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
            Ponúknite zrušené alebo voľné termíny všetkým klientom
          </p>
        </div>

        {/* Info card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex gap-3 p-4">
            <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Ako to funguje?</p>
              <p className="text-muted-foreground">
                Systém automaticky zobrazí zrušené tréningy v nasledujúcich 48 hodinách.
                Kliknite „Ponúknuť" a broadcast sa predvyplní. Alebo vytvorte slot manuálne nižšie.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="guidelines" className="border rounded-xl px-4">
            <AccordionTrigger className="hover:no-underline">
              <span className="flex items-center gap-2 text-sm font-medium">
                <BookOpen className="h-4 w-4 text-primary" />
                Pravidlá a odporúčania pre Last-minute
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">📋 Kedy použiť</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Len ak sa termín uvoľnil &lt;24h pred tréningom</li>
                    <li>Nie ako bežný nástroj na plnenie rozvrhu</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">⏰ Načasovanie</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Minimálne 3–4 hodiny pred tréningom</li>
                    <li>Odosielať len medzi 8:00–21:00</li>
                    <li>Max 2–3× týždenne</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💬 Tón komunikácie</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Pozitívny a priateľský, nie naliehavý</li>
                    <li>Formulovať ako príležitosť, nie „poslednú šancu"</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">💰 Zľava</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Zvážiť pri &lt;6h do tréningu alebo opakovane neobsadenom termíne</li>
                    <li>Odporúčaná výška: 10–20%, max 30%</li>
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Cancelled trainings section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <XCircle className="h-5 w-5 text-destructive" />
              Zrušené tréningy na ponuku
            </CardTitle>
            <CardDescription>
              Tréningy zrušené v nasledujúcich 48 hodinách s voľným slotom
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : cancelledForOffer.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Žiadne zrušené tréningy na ponuku</p>
              </div>
            ) : (
              cancelledForOffer.map((booking) => (
                <CancelledTrainingCard
                  key={booking.id}
                  booking={booking}
                  onOffer={handleOfferCancelled}
                />
              ))
            )}
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
            {/* Broadcast discount */}
            <div className="ios-card p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  Ponúknuť so zľavou
                </Label>
                <Switch checked={broadcastDiscount} onCheckedChange={(checked) => {
                  setBroadcastDiscount(checked);
                  if (checked) updateBroadcastMessageWithDiscount(broadcastDiscountPercent);
                  else updateBroadcastMessageWithDiscount('0');
                }} />
              </div>
              {broadcastDiscount && (
                <div className="space-y-3 animate-ios-fade-in">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Výška zľavy (%)</Label>
                    <div className="flex gap-2">
                      {['10', '20', '30'].map((val) => (
                        <Button
                          key={val}
                          type="button"
                          variant={broadcastDiscountPercent === val ? 'default' : 'outline'}
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setBroadcastDiscountPercent(val);
                            updateBroadcastMessageWithDiscount(val);
                          }}
                        >
                          {val}%
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-muted/50 rounded-xl p-3">
                    <span className="text-muted-foreground">Pôvodná cena:</span>
                    <span className="line-through">{basePrice.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between text-sm bg-primary/10 rounded-xl p-3 font-semibold">
                    <span className="text-primary">Cena so zľavou:</span>
                    <span className="text-primary text-lg">{broadcastFinalPrice.toFixed(2)}€</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Odošle sa {lastMinuteClients.length} klientom (s aktívnym last-minute odberom)</span>
            </div>
            <Button
              className="w-full h-12 ios-press"
              disabled={!title || !message || isSending || lastMinuteClients.length === 0}
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

        {/* Manual slot creation - collapsible */}
        <Collapsible open={manualOpen} onOpenChange={setManualOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Vytvoriť slot manuálne
                  </span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${manualOpen ? 'rotate-180' : ''}`} />
                </CardTitle>
                <CardDescription>
                  Vytvorte nový voľný slot a voliteľne aplikujte zľavu
                </CardDescription>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
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
                      <Switch checked={hasDiscount} onCheckedChange={setHasDiscount} />
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
            </CollapsibleContent>
          </Card>
        </Collapsible>

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
