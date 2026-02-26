import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES, BOOKING_STATUS_LABELS } from '@/lib/constants';
import { 
  Users, Calendar, CreditCard, Clock,
  ChevronRight, Bell, Loader2, CalendarCheck,
  AlertTriangle, Euro, Megaphone, CheckCircle, XCircle,
  Activity, TrendingDown, BarChart3
} from 'lucide-react';
import { useAdminBookings, AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { useAdminDashboardStats, DashboardDateRange, getDefaultRange } from '@/hooks/useAdminDashboardStats';
import { useCompleteTraining } from '@/hooks/useCompleteTraining';
import { ConfirmedBookingCard } from '@/components/admin/ConfirmedBookingCard';
import { AdminStatsSection } from '@/components/admin/AdminStatsSection';
import { AdminActionAlerts } from '@/components/admin/AdminActionAlerts';
import { DashboardHistoryPicker } from '@/components/admin/DashboardHistoryPicker';
import { KPICard } from '@/components/admin/KPICard';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { format, differenceInHours } from 'date-fns';
import { sk } from 'date-fns/locale';

type QuickPeriod = 'week' | 'month';

function getOccupancyColor(val: number): 'success' | 'warning' | 'destructive' | 'muted' {
  if (val >= 75) return 'success';
  if (val >= 50) return 'warning';
  if (val >= 30) return 'warning';
  return 'destructive';
}

function getOccupancyInsight(val: number): string {
  if (val >= 75) return 'Výborné využitie kapacity';
  if (val >= 50) return 'Stabilné, priestor na rast';
  if (val >= 30) return 'Slabšie využitie';
  return 'Kapacita sa nevyužíva efektívne';
}

export default function AdminDashboardPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  const [quickPeriod, setQuickPeriod] = useState<QuickPeriod>('week');
  const [customRange, setCustomRange] = useState<DashboardDateRange | null>(null);

  const activeRange = customRange || getDefaultRange(quickPeriod);
  
  const { 
    pendingBookings, 
    confirmedBookings, 
    todayBookings,
    bookings,
    isLoading, 
    approveBooking, 
    rejectBooking,
    cancelBooking 
  } = useAdminBookings();

  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats(activeRange);

  const periodLabel = customRange?.label 
    ? customRange.label 
    : quickPeriod === 'week' ? 'tento týždeň' : 'tento mesiac';

  const { completeTraining, markNoShow } = useCompleteTraining();

  const now = new Date();
  const unconfirmedBookings = (bookings || []).filter(
    (b) => {
      if (b.status !== 'pending' && b.status !== 'proposed' && b.status !== 'awaiting_confirmation') return false;
      // Skryť ak je tréning v minulosti
      if (b.slot && new Date(b.slot.start_time) <= now) return false;
      // Skryť ak deadline vypršal
      if (b.status === 'awaiting_confirmation' && b.confirmation_deadline && new Date(b.confirmation_deadline) <= now) return false;
      return true;
    }
  );

  const handleApprove = async (bookingId: string) => {
    setProcessingId(bookingId);
    setProcessingAction('approve');
    try {
      await approveBooking.mutateAsync(bookingId);
      toast.success('Rezervácia potvrdená');
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa potvrdiť rezerváciu');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async (bookingId: string) => {
    setProcessingId(bookingId);
    setProcessingAction('reject');
    try {
      await rejectBooking.mutateAsync({ bookingId });
      toast.success('Rezervácia zamietnutá');
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa zamietnuť rezerváciu');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleCancel = async (bookingId: string, reason?: string, feePercentage?: number) => {
    setProcessingId(bookingId);
    setProcessingAction('cancel');
    try {
      await cancelBooking.mutateAsync({ bookingId, reason, feePercentage });
      toast.success('Tréning zrušený');
    } catch (error: any) {
      toast.error(error.message || 'Nepodarilo sa zrušiť tréning');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleComplete = async (bookingId: string, clientId: string, price: number, slotId: string) => {
    setProcessingId(bookingId);
    setProcessingAction('complete');
    try {
      await completeTraining.mutateAsync({ bookingId, clientId, price, slotId });
      toast.success('Tréning označený ako odplávaný');
    } catch (error: any) {
      toast.error(error.message || 'Chyba pri dokončení tréningu');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleNoShow = async (bookingId: string, clientId: string, price: number, slotId: string) => {
    setProcessingId(bookingId);
    setProcessingAction('no_show');
    try {
      await markNoShow.mutateAsync({ bookingId, clientId, price, slotId });
      toast.success('Neúčasť zaznamenaná');
    } catch (error: any) {
      toast.error(error.message || 'Chyba pri zaznamenaní neúčasti');
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Riadiaci panel</p>
        </div>

        {/* Period Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-muted/60 rounded-xl p-0.5 h-8">
            <button
              onClick={() => { setQuickPeriod('week'); setCustomRange(null); }}
              className={`text-xs rounded-lg px-3 h-7 transition-all ${
                !customRange && quickPeriod === 'week' 
                  ? 'bg-background shadow-sm font-medium text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Týždeň
            </button>
            <button
              onClick={() => { setQuickPeriod('month'); setCustomRange(null); }}
              className={`text-xs rounded-lg px-3 h-7 transition-all ${
                !customRange && quickPeriod === 'month' 
                  ? 'bg-background shadow-sm font-medium text-foreground' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mesiac
            </button>
          </div>
          <DashboardHistoryPicker
            onSelectRange={(range) => setCustomRange(range)}
            currentRange={customRange}
            onClear={() => setCustomRange(null)}
          />
        </div>

        {/* Period indicator when custom */}
        {customRange && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span>Zobrazené obdobie:</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {customRange.label}
            </Badge>
          </div>
        )}

        {/* KPI Summary - Clean 2x2 grid */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            icon={<Users className="h-4 w-4 text-success" />}
            title="Aktívni klienti"
            tooltip="Klienti s aspoň 1 potvrdeným alebo odplávaným tréningom v zvolenom období. Pravidelní = 2+ tréningy."
            mainValue={stats?.activeClients ?? 0}
            mainColor="success"
            loading={statsLoading}
            trend={stats ? { current: stats.activeClients, previous: stats.prevActiveClients } : undefined}
          />
          <KPICard
            icon={<Calendar className="h-4 w-4 text-primary" />}
            title={`Tréningy / ${periodLabel}`}
            tooltip="Celkový počet tréningov v období: plánované + odplávané. Zrušené sa nezapočítavajú."
            mainValue={`${(stats?.plannedTrainings ?? 0) + (stats?.completedTrainings ?? 0)}`}
            mainColor="primary"
            loading={statsLoading}
            trend={stats ? { current: (stats.plannedTrainings + stats.completedTrainings), previous: stats.prevTrainings } : undefined}
          />
          <KPICard
            icon={<Clock className="h-4 w-4 text-warning" />}
            title="Nepotvrdené"
            tooltip="Rezervácie čakajúce na potvrdenie. Kritické = deadline vyprší do 6 hodín."
            mainValue={stats?.unconfirmedBookings ?? 0}
            mainColor={(stats?.criticalBookings ?? 0) > 0 ? 'destructive' : 'warning'}
            badge={(stats?.criticalBookings ?? 0) > 0 
              ? { label: `${stats!.criticalBookings} <6h`, variant: 'destructive' as const }
              : undefined
            }
            loading={statsLoading}
          />
          <KPICard
            icon={<BarChart3 className="h-4 w-4 text-primary" />}
            title="Obsadenosť"
            tooltip="Pomer obsadených slotov k celkovému počtu dostupných slotov v zvolenom období."
            mainValue={`${(stats?.slotOccupancy ?? 0).toFixed(0)}%`}
            mainColor={getOccupancyColor(stats?.slotOccupancy ?? 0)}
            insightText={getOccupancyInsight(stats?.slotOccupancy ?? 0)}
            insightColor={getOccupancyColor(stats?.slotOccupancy ?? 0)}
            loading={statsLoading}
            trend={stats ? { current: stats.slotOccupancy, previous: stats.prevSlotOccupancy } : undefined}
          />
        </div>

        {/* Earned row - full width */}
        <KPICard
          icon={<Euro className="h-4 w-4 text-success" />}
          title={`Zarobené / ${periodLabel}`}
          tooltip="Zarobené = reálny výnos z tréningov, storno poplatkov a last-minute obsadení. Nezahŕňa kreditné vklady."
          mainValue={`${(stats?.earned ?? 0).toFixed(0)}€`}
          mainColor="success"
          loading={statsLoading}
          trend={stats ? { current: stats.earned, previous: stats.prevEarned } : undefined}
        />

        {/* Action Alerts - "Potrebujem riešiť dnes" */}
        {stats && <AdminActionAlerts stats={stats} />}

        {/* Intelligent Stats Section */}
        <AdminStatsSection stats={stats} isLoading={statsLoading} />

        {/* Unconfirmed bookings section */}
        {unconfirmedBookings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4">
              <Bell className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-warning uppercase tracking-wide">
                Čaká na potvrdenie ({unconfirmedBookings.length})
              </h2>
            </div>
            <div className="space-y-3">
              {unconfirmedBookings.map((booking) => (
                <UnconfirmedBookingRow
                  key={booking.id}
                  booking={booking}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processingId === booking.id}
                />
              ))}
            </div>
          </div>
        )}

        {/* Today's trainings */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-4">
            Dnešné tréningy ({todayBookings.length})
          </h2>
          {todayBookings.length === 0 ? (
            <div className="ios-card">
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-muted-foreground">Dnes nemáš naplánované žiadne tréningy</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => (
                <ConfirmedBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  onNoShow={handleNoShow}
                  isCancelling={processingId === booking.id && processingAction === 'cancel'}
                  isCompleting={processingId === booking.id && processingAction === 'complete'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-4">
            Rýchle akcie
          </h2>
          <div className="ios-card overflow-hidden">
            <div className="divide-y divide-border/50">
              <Link 
                to={ROUTES.ADMIN.CALENDAR}
                className="flex items-center justify-between p-4 ios-press hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Pridať tréningový slot</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </Link>

              <Link 
                to={ROUTES.ADMIN.CLIENTS}
                className="flex items-center justify-between p-4 ios-press hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">Zobraziť klientov</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </Link>

              <Link 
                to={ROUTES.ADMIN.FINANCES}
                className="flex items-center justify-between p-4 ios-press hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10">
                    <CreditCard className="h-4 w-4 text-success" />
                  </div>
                  <span className="font-medium">Pridať vklad</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </Link>

              <Link 
                to={ROUTES.ADMIN.BROADCAST}
                className="flex items-center justify-between p-4 ios-press hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/10">
                    <Megaphone className="h-4 w-4 text-warning" />
                  </div>
                  <span className="font-medium">Poslať last-minute ponuku</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming confirmed trainings */}
        {confirmedBookings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Naplánované tréningy ({confirmedBookings.length})
              </h2>
            </div>
            <div className="space-y-3">
              {confirmedBookings.slice(0, 10).map((booking) => (
                <ConfirmedBookingCard
                  key={booking.id}
                  booking={booking}
                  onCancel={handleCancel}
                  onComplete={handleComplete}
                  onNoShow={handleNoShow}
                  isCancelling={processingId === booking.id && processingAction === 'cancel'}
                  isCompleting={processingId === booking.id && processingAction === 'complete'}
                />
              ))}
              {confirmedBookings.length > 10 && (
                <Button asChild variant="outline" className="w-full">
                  <Link to={ROUTES.ADMIN.CALENDAR}>
                    Zobraziť všetky ({confirmedBookings.length})
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Unconfirmed booking row with deadline countdown
function UnconfirmedBookingRow({ booking, onApprove, onReject, isProcessing }: {
  booking: AdminBookingWithDetails;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isProcessing: boolean;
}) {
  const startTime = new Date(booking.slot.start_time);
  const deadline = booking.confirmation_deadline ? new Date(booking.confirmation_deadline) : null;
  const hoursLeft = deadline ? differenceInHours(deadline, new Date()) : null;

  return (
    <div className="ios-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{booking.client?.full_name || 'Neznámy klient'}</span>
            <Badge variant="secondary" className="text-[10px]">
              {BOOKING_STATUS_LABELS[booking.status as keyof typeof BOOKING_STATUS_LABELS]}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(startTime, 'EEEE d. MMM, HH:mm', { locale: sk })}
          </p>
          {hoursLeft !== null && (
            <p className={`text-xs font-medium ${hoursLeft <= 2 ? 'text-destructive' : 'text-warning'}`}>
              {hoursLeft > 0 ? `Zostáva ${hoursLeft}h` : 'Deadline vypršal!'}
            </p>
          )}
        </div>
        {booking.status === 'pending' && (
          <div className="flex gap-2">
            <Button size="sm" disabled={isProcessing} onClick={() => onApprove(booking.id)} className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Potvrdiť
            </Button>
            <Button size="sm" variant="destructive" disabled={isProcessing} onClick={() => onReject(booking.id)} className="gap-1">
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
