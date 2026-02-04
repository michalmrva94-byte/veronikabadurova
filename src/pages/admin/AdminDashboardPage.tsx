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
  Megaphone
} from 'lucide-react';

export default function AdminDashboardPage() {
  // Placeholder stats - will be replaced with real data
  const stats = {
    totalClients: 0,
    todayTrainings: 0,
    weekTrainings: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    completedThisMonth: 0,
    cancelledThisMonth: 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Prehľad vašich tréningov a klientov
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Klienti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.totalClients}</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Dnes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.todayTrainings}</span>
              <span className="text-sm text-muted-foreground ml-1">tréningov</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Clock className="h-4 w-4" />
                Tento týždeň
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.weekTrainings}</span>
              <span className="text-sm text-muted-foreground ml-1">tréningov</span>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Príjem (mesiac)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">{stats.totalRevenue.toFixed(0)}</span>
              <span className="text-sm text-muted-foreground ml-1">€</span>
            </CardContent>
          </Card>
        </div>

        {/* Monthly stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-success/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedThisMonth}</p>
                <p className="text-xs text-muted-foreground">Dokončené tento mesiac</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/30">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.cancelledThisMonth}</p>
                <p className="text-xs text-muted-foreground">Zrušené tento mesiac</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Rýchle akcie</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link to={ROUTES.ADMIN.CALENDAR}>
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Pridať slot</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link to={ROUTES.ADMIN.CLIENTS}>
                <Users className="h-5 w-5" />
                <span className="text-xs">Klienti</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link to={ROUTES.ADMIN.FINANCES}>
                <CreditCard className="h-5 w-5" />
                <span className="text-xs">Pridať vklad</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col gap-2 py-4">
              <Link to={ROUTES.ADMIN.BROADCAST}>
                <Megaphone className="h-5 w-5" />
                <span className="text-xs">Last-minute</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Today's trainings placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dnešné tréningy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Dnes nemáte naplánované žiadne tréningy</p>
              <Button asChild className="mt-4">
                <Link to={ROUTES.ADMIN.CALENDAR}>Pridať tréning</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
