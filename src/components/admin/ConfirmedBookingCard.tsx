import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Euro, X, Loader2, CheckCircle, XCircle, CalendarPlus } from 'lucide-react';
import { toast } from 'sonner';
import { CLIENT_TYPE_LABELS } from '@/lib/constants';
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
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface ConfirmedBookingCardProps {
  booking: AdminBookingWithDetails;
  onCancel: (bookingId: string, reason?: string, feePercentage?: number) => void;
  onComplete?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onNoShow?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  isCancelling?: boolean;
  isCompleting?: boolean;
}

export function ConfirmedBookingCard({
  booking,
  onCancel,
  onComplete,
  onNoShow,
  isCancelling,
  isCompleting,
}: ConfirmedBookingCardProps) {
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [isNoShowOpen, setIsNoShowOpen] = useState(false);
  const [cancelFeePercent, setCancelFeePercent] = useState('0');
  const startTime = new Date(booking.slot.start_time);
  const endTime = new Date(booking.slot.end_time);
  const isProcessing = isCancelling || isCompleting;

  const handleAddToCalendar = () => {
    const title = `Tréning – ${booking.client?.full_name || 'Klient'}`;
    const start = format(startTime, "yyyyMMdd'T'HHmmss");
    const end = format(endTime, "yyyyMMdd'T'HHmmss");
    const description = `Cena: ${booking.price}€`;

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trening-${format(startTime, 'yyyy-MM-dd-HHmm')}.ics`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Súbor kalendára stiahnutý');
  };

  const handleCancel = () => {
    onCancel(booking.id, 'Zrušené trénerom', parseInt(cancelFeePercent));
    setIsCancelOpen(false);
    setCancelFeePercent('0');
  };

  const feeOptions = [
    { value: '0', label: 'Bez poplatku', amount: 0 },
    { value: '50', label: '50%', amount: booking.price * 0.5 },
    { value: '80', label: '80%', amount: booking.price * 0.8 },
    { value: '100', label: '100%', amount: booking.price },
  ];

  const handleComplete = () => {
    onComplete?.(booking.id, booking.client?.id || '', booking.price, booking.slot.id);
    setIsCompleteOpen(false);
  };

  const handleNoShow = () => {
    onNoShow?.(booking.id, booking.client?.id || '', booking.price, booking.slot.id);
    setIsNoShowOpen(false);
  };

  return (
    <div className="ios-card p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            {/* Client name + type badge */}
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span className="font-semibold">{booking.client?.full_name || 'Neznámy klient'}</span>
              {booking.client?.client_type && (
                <Badge variant="secondary" className="text-[10px]">
                  {CLIENT_TYPE_LABELS[booking.client?.client_type as keyof typeof CLIENT_TYPE_LABELS]}
                </Badge>
              )}
            </div>

            {/* Date and time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(startTime, 'EEEE d. MMMM', { locale: sk })} o{' '}
                {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2 text-sm">
              <Euro className="h-4 w-4 text-success" />
              <span className="font-medium text-success">{booking.price} €</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Add to calendar */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-primary hover:text-primary hover:bg-primary/10"
              onClick={handleAddToCalendar}
              disabled={isProcessing}
            >
              <CalendarPlus className="h-4 w-4" />
            </Button>

            {/* Cancel button */}
            <AlertDialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isProcessing}
              >
                {isCancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Zrušiť tréning?</AlertDialogTitle>
                <AlertDialogDescription asChild>
                  <div className="space-y-3">
                    <p>
                      Naozaj chcete zrušiť tréning s klientom{' '}
                      <strong>{booking.client?.full_name || 'Neznámy klient'}</strong> dňa{' '}
                      {format(startTime, "d. MMMM 'o' HH:mm", { locale: sk })}?
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Storno poplatok:</p>
                      <RadioGroup value={cancelFeePercent} onValueChange={setCancelFeePercent} className="space-y-1.5">
                        {feeOptions.map((opt) => (
                          <div key={opt.value} className="flex items-center gap-2">
                            <RadioGroupItem value={opt.value} id={`fee-card-${booking.id}-${opt.value}`} />
                            <Label htmlFor={`fee-card-${booking.id}-${opt.value}`} className="text-sm cursor-pointer">
                              {opt.label} {opt.amount > 0 ? `– ${opt.amount.toFixed(2)} €` : '(0 €)'}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    <p className="text-xs text-muted-foreground">Klient bude o zrušení informovaný notifikáciou.</p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setCancelFeePercent('0')}>Späť</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleCancel}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Zrušiť tréning
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          </div>
        </div>

        {/* Action buttons */}
        {(onComplete || onNoShow) && (
          <div className="flex gap-2 pt-1">
            {onComplete && (
              <AlertDialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" className="flex-1 gap-1" disabled={isProcessing}>
                    {isCompleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                    Odplávaný
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Označiť ako odplávaný?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Z kreditu klienta bude odpočítaných {booking.price}€.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Späť</AlertDialogCancel>
                    <AlertDialogAction onClick={handleComplete}>Potvrdiť</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {onNoShow && (
              <AlertDialog open={isNoShowOpen} onOpenChange={setIsNoShowOpen}>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="gap-1" disabled={isProcessing}>
                    <XCircle className="h-3 w-3" />
                    Neúčasť
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Neúčasť?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Klientovi bude účtovaný 100% poplatok ({booking.price}€).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Späť</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleNoShow}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Potvrdiť neúčasť
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
