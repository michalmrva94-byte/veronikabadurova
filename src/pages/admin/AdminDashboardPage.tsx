import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Megaphone,
  ChevronRight,
  Bell,
  Loader2,
  CalendarCheck
} from 'lucide-react';
import { useAdminBookings } from '@/hooks/useAdminBookings';
import { PendingBookingCard } from '@/components/admin/PendingBookingCard';
import { ConfirmedBookingCard } from '@/components/admin/ConfirmedBookingCard';
import { toast } from 'sonner';
import { useState } from 'react';

export default function AdminDashboardPage() {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'approve' | 'reject' | 'cancel' | null>(null);
  
  const { 
    pendingBookings, 
    confirmedBookings, 
    todayBookings, 
    isLoading, 
    approveBooking, 
    rejectBooking,
    cancelBooking 
  } = useAdminBookings();

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

  // Placeholder stats - will be replaced with real data
  const stats = {
    totalClients: 0,
    todayTrainings: todayBookings.length,
    weekTrainings: confirmedBookings.length,
    totalRevenue: 0,
    pendingPayments: 0,
    completedThisMonth: 0,
    cancelledThisMonth: 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* iOS-style Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Prehľad tréningov a klientov
          </p>
        </div>

        {/* Pending Bookings Section */}
        {pendingBookings.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-4">
              <Bell className="h-4 w-4 text-warning" />
              <h2 className="text-sm font-semibold text-warning uppercase tracking-wide">
                Čakajúce rezervácie ({pendingBookings.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingBookings.map((booking) => (
                <PendingBookingCard
                  key={booking.id}
                  booking={booking}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isApproving={processingId === booking.id && processingAction === 'approve'}
                  isRejecting={processingId === booking.id && processingAction === 'reject'}
                />
              ))}
            </div>
          </div>
        )}

        {/* iOS Inset Grouped Stats */}
        <div className="ios-card overflow-hidden">
          <div className="divide-y divide-border/50">
            {/* Clients Row */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Klienti</span>
              </div>
              <span className="text-xl font-bold tabular-nums">{stats.totalClients}</span>
            </div>

            {/* Today Row */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Dnes</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold tabular-nums">{stats.todayTrainings}</span>
                <span className="text-sm text-muted-foreground ml-1">tréningov</span>
              </div>
            </div>

            {/* Week Row */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <span className="font-medium">Tento týždeň</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold tabular-nums">{stats.weekTrainings}</span>
                <span className="text-sm text-muted-foreground ml-1">tréningov</span>
              </div>
            </div>

            {/* Revenue Row */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <span className="font-medium">Príjem (mesiac)</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold tabular-nums text-success">{stats.totalRevenue.toFixed(0)}</span>
                <span className="text-sm text-muted-foreground ml-1">€</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="ios-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.completedThisMonth}</p>
                <p className="text-[11px] text-muted-foreground">Dokončené</p>
              </div>
            </div>
          </div>

          <div className="ios-card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{stats.cancelledThisMonth}</p>
                <p className="text-[11px] text-muted-foreground">Zrušené</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - iOS List Style */}
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
                  isCancelling={processingId === booking.id && processingAction === 'cancel'}
                />
              ))}
            </div>
          )}
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
                  isCancelling={processingId === booking.id && processingAction === 'cancel'}
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
