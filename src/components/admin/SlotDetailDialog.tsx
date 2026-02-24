import { format } from 'date-fns';
import { sk } from 'date-fns/locale';
import { SlotWithBooking } from '@/hooks/useWeeklySlots';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, User, Euro, CheckCircle, XCircle, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { BOOKING_STATUS_LABELS, CLIENT_TYPE_LABELS } from '@/lib/constants';
import { BookingStatus } from '@/types/database';
import { useState } from 'react';

interface SlotDetailDialogProps {
  slot: SlotWithBooking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onNoShow?: (bookingId: string, clientId: string, price: number, slotId: string) => void;
  onCancel?: (bookingId: string, reason?: string, feePercentage?: number) => void;
  onApprove?: (bookingId: string) => void;
  onReject?: (bookingId: string) => void;
  onDelete?: (slotId: string) => void;
  isProcessing?: boolean;
}

const statusColors: Record<string, string> = {
  proposed: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/20 text-warning-foreground border-warning',
  awaiting_confirmation: 'bg-warning/20 text-warning-foreground border-warning',
  booked: 'bg-primary/20 text-primary border-primary',
  cancelled: 'bg-destructive/20 text-destructive border-destructive',
  no_show: 'bg-destructive/20 text-destructive border-destructive',
  completed: 'bg-success/20 text-success border-success',
};

export function SlotDetailDialog({
  slot,
  open,
  onOpenChange,
  onComplete,
  onNoShow,
  onCancel,
  onApprove,
  onReject,
  onDelete,
  isProcessing,
}: SlotDetailDialogProps) {
  const [cancelFeePercent, setCancelFeePercent] = useState('0');

  if (!slot) return null;

  const startTime = new Date(slot.start_time);
  const endTime = new Date(slot.end_time);
  const booking = slot.booking;
  const status = (booking?.status as BookingStatus) || null;
  const hasBooking = !!booking;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Detail termínu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & time */}
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-medium">
              {format(startTime, 'EEEE d. MMMM yyyy', { locale: sk })}
            </span>
          </div>
          <div className="text-lg font-bold">
            {format(startTime, 'HH:mm')} – {format(endTime, 'HH:mm')}
          </div>

          {/* Client info */}
          {booking?.client && (
            <div className="ios-card p-4 space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">{booking.client.full_name}</span>
              </div>
              {(booking.client as any).client_type && (
                <Badge variant="secondary" className="text-xs">
                  {CLIENT_TYPE_LABELS[(booking.client as any).client_type as keyof typeof CLIENT_TYPE_LABELS]}
                </Badge>
              )}
            </div>
          )}

          {/* Status badge */}
          {status && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Stav:</span>
              <Badge className={statusColors[status] || ''}>
                {BOOKING_STATUS_LABELS[status]}
              </Badge>
            </div>
          )}

          {/* Actions based on status */}
          <div className="space-y-2 pt-2">
            {status === 'booked' && booking && (
              <>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="w-full gap-2" disabled={isProcessing}>
                      <CheckCircle className="h-4 w-4" />
                      Označiť ako odplávaný
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Označiť ako odplávaný?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tréning bude označený ako dokončený a z kreditu klienta bude odpočítaná cena tréningu.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Späť</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        onComplete?.(booking.id, (booking.client as any)?.id, (booking as any)?.price ?? 25, slot.id);
                        onOpenChange(false);
                      }}>
                        Potvrdiť
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2" disabled={isProcessing}>
                      <XCircle className="h-4 w-4" />
                      Neúčasť (100% poplatok)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Označiť neúčasť?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Klientovi bude účtovaný 100% poplatok za neúčasť.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Späť</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          onNoShow?.(booking.id, (booking.client as any)?.id, (booking as any)?.price ?? 25, slot.id);
                          onOpenChange(false);
                        }}
                      >
                        Potvrdiť neúčasť
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full gap-2 text-destructive"
                      disabled={isProcessing}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Zrušiť tréning
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Zrušiť tréning?</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div className="space-y-3">
                          <p>
                            Naozaj chcete zrušiť tréning s klientom{' '}
                            <strong>{booking.client?.full_name}</strong>?
                          </p>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Storno poplatok:</p>
                            <RadioGroup value={cancelFeePercent} onValueChange={setCancelFeePercent} className="space-y-1.5">
                              {[
                                { value: '0', label: 'Bez poplatku', amount: 0 },
                                { value: '50', label: '50%', amount: (booking as any)?.price * 0.5 },
                                { value: '80', label: '80%', amount: (booking as any)?.price * 0.8 },
                                { value: '100', label: '100%', amount: (booking as any)?.price },
                              ].map((opt) => (
                                <div key={opt.value} className="flex items-center gap-2">
                                  <RadioGroupItem value={opt.value} id={`fee-slot-${opt.value}`} />
                                  <Label htmlFor={`fee-slot-${opt.value}`} className="text-sm cursor-pointer">
                                    {opt.label} {opt.amount > 0 ? `– ${opt.amount?.toFixed(2)} €` : '(0 €)'}
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
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => {
                          onCancel?.(booking.id, 'Zrušené trénerom', parseInt(cancelFeePercent));
                          setCancelFeePercent('0');
                          onOpenChange(false);
                        }}
                      >
                        Zrušiť tréning
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}

            {status === 'pending' && booking && (
              <>
                <Button
                  className="w-full gap-2"
                  disabled={isProcessing}
                  onClick={() => {
                    onApprove?.(booking.id);
                    onOpenChange(false);
                  }}
                >
                  <CheckCircle className="h-4 w-4" />
                  Potvrdiť
                </Button>
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  disabled={isProcessing}
                  onClick={() => {
                    onReject?.(booking.id);
                    onOpenChange(false);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                  Zamietnuť
                </Button>
              </>
            )}

            {(status === 'proposed' || status === 'awaiting_confirmation') && (
              <div className="text-center text-sm text-muted-foreground py-2">
                Čaká sa na odpoveď klienta
              </div>
            )}

            {!hasBooking && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full gap-2"
                    disabled={isProcessing}
                  >
                    <Trash2 className="h-4 w-4" />
                    Zmazať slot
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Zmazať termín?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Naozaj chcete odstrániť tento termín ({format(startTime, 'HH:mm')} – {format(endTime, 'HH:mm')})? Táto akcia sa nedá vrátiť späť.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Späť</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        onDelete?.(slot.id);
                        onOpenChange(false);
                      }}
                    >
                      Zmazať
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Spracovávam...
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
