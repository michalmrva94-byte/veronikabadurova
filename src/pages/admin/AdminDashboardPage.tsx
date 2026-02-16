import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES, BOOKING_STATUS_LABELS, CLIENT_TYPE_LABELS } from '@/lib/constants';
import { 
  Users, Calendar, CreditCard, TrendingUp, Clock,
  ChevronRight, Bell, Loader2, CalendarCheck,
  AlertTriangle, Euro, Megaphone, UserPlus, CheckCircle, XCircle
} from 'lucide-react';
import { useAdminBookings, AdminBookingWithDetails } from '@/hooks/useAdminBookings';
import { useAdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { useCompleteTraining } from '@/hooks/useCompleteTraining';
import { PendingBookingCard } from '@/components/admin/PendingBookingCard';
import { ConfirmedBookingCard } from '@/components/admin/ConfirmedBookingCard';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useState } from 'react';
import { format, differenceInHours } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function AdminDashboardPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<string | null>(null);
  
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

  const { data: stats, isLoading: statsLoading } = useAdminDashboardStats();
  const { completeTraining, markNoShow } = useCompleteTraining();

  // All unconfirmed bookings (pending + proposed + awaiting_confirmation)
  const unconfirmedBookings = (bookings || []).filter(
    (b) => b.status === 'pending' || b.status === 'proposed' || b.status === 'awaiting_confirmation'
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

  const handleCancel = async (bookingId: string, reason?: string) => {
    setProcessingId(bookingId);
    setProcessingAction('cancel');
    try {
      await cancelBooking.mutateAsync({ bookingId, reason });
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

        {/* KPI Cards - 5 metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <KPICard
            icon={<Users className="h-5 w-5 text-success" />}
            label="Aktívni klienti"
            value={stats?.activeClients ?? 0}
            loading={statsLoading}
            color="success"
          />
          <KPICard
            icon={<Calendar className="h-5 w-5 text-warning" />}
            label="Tréningy / týždeň"
            value={stats?.weekTrainings ?? 0}
            loading={statsLoading}
            color="warning"
          />
          <KPICard
            icon={<Clock className="h-5 w-5 text-primary" />}
            label="Nepotvrdené"
            value={stats?.unconfirmedBookings ?? 0}
            loading={statsLoading}
            color="primary"
          />
          <KPICard
            icon={<AlertTriangle className="h-5 w-5 text-destructive" />}
            label="Rizikové"
            value={stats?.clientsWithDebt ?? 0}
            loading={statsLoading}
            color="destructive"
          />
          <KPICard
            icon={<Euro className="h-5 w-5 text-success" />}
            label="Príjem / mesiac"
            value={`${(stats?.monthlyRevenue ?? 0).toFixed(0)}€`}
            loading={statsLoading}
            color="success"
            className="col-span-2 sm:col-span-1"
          />
        </div>

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

        {/* Today's trainings with new actions */}
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
                <p className="text-muted-foreground mb-4">Dnes nemáš naplánované žiadne tréningy</p>
                <Button asChild className="rounded-xl ios-press">
                  <Link to={ROUTES.ADMIN.CALENDAR}>Pridať tréning</Link>
                </Button>
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

// KPI Card component
function KPICard({ icon, label, value, loading, color, className = '' }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  loading?: boolean;
  color: string;
  className?: string;
}) {
  return (
    <div className={`ios-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
      </div>
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : (
        <p className="text-2xl font-bold tabular-nums">{value}</p>
      )}
      <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
    </div>
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
            <span className="font-semibold">{booking.client.full_name}</span>
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
