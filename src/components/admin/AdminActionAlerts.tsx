import { AlertTriangle, Clock, CreditCard, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { AdminDashboardStats } from '@/hooks/useAdminDashboardStats';

interface AdminActionAlertsProps {
  stats: AdminDashboardStats;
}

interface AlertItem {
  icon: React.ReactNode;
  text: string;
  to: string;
  color: string;
}

export function AdminActionAlerts({ stats }: AdminActionAlertsProps) {
  const alerts: AlertItem[] = [];

  if (stats.criticalBookings > 0) {
    alerts.push({
      icon: <Clock className="h-4 w-4 text-destructive shrink-0" />,
      text: `${stats.criticalBookings} ${stats.criticalBookings === 1 ? 'tréning čaká' : 'tréningy čakajú'} na potvrdenie <6h`,
      to: ROUTES.ADMIN.DASHBOARD,
      color: 'text-destructive',
    });
  }

  if (stats.debtClients > 0) {
    alerts.push({
      icon: <CreditCard className="h-4 w-4 text-destructive shrink-0" />,
      text: `${stats.debtClients} ${stats.debtClients === 1 ? 'klient má' : 'klienti majú'} negatívny zostatok (${stats.totalDebt.toFixed(0)}€)`,
      to: ROUTES.ADMIN.FINANCES,
      color: 'text-destructive',
    });
  }

  if (stats.insufficientCreditClients.length > 0) {
    alerts.push({
      icon: <AlertTriangle className="h-4 w-4 text-warning shrink-0" />,
      text: `${stats.insufficientCreditClients.length} ${stats.insufficientCreditClients.length === 1 ? 'klient nemá' : 'klienti nemajú'} dostatok kreditu na najbližší tréning`,
      to: ROUTES.ADMIN.FINANCES,
      color: 'text-warning',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide px-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Potrebujem riešiť dnes
      </h2>
      <div className="ios-card overflow-hidden divide-y divide-border/50">
        {alerts.map((alert, i) => (
          <Link
            key={i}
            to={alert.to}
            className="flex items-center gap-3 p-4 ios-press hover:bg-muted/50 transition-colors"
          >
            {alert.icon}
            <span className={`text-sm font-medium ${alert.color}`}>{alert.text}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
