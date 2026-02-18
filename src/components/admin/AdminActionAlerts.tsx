import { useState, useCallback } from 'react';
import { AlertTriangle, Clock, CreditCard, TrendingDown, CalendarX, ChevronRight, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { AdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AdminActionAlertsProps {
  stats: AdminDashboardStats;
}

type AlertPriority = 'high' | 'medium' | 'low';

interface AlertItem {
  key: string;
  priority: AlertPriority;
  icon: React.ReactNode;
  text: string;
  subtitle?: string;
  count: number;
  to: string;
}

const PRIORITY_ORDER: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };

const PRIORITY_STYLES: Record<AlertPriority, { border: string; icon: string; badge: string }> = {
  high: {
    border: 'border-l-destructive',
    icon: 'text-destructive',
    badge: 'bg-destructive/10 text-destructive',
  },
  medium: {
    border: 'border-l-warning',
    icon: 'text-warning',
    badge: 'bg-warning/10 text-warning',
  },
  low: {
    border: 'border-l-muted-foreground/30',
    icon: 'text-muted-foreground',
    badge: 'bg-muted text-muted-foreground',
  },
};

const STORAGE_KEY = 'dismissed-alerts';

function getDismissedAlerts(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function isDismissedToday(key: string): boolean {
  const dismissed = getDismissedAlerts();
  if (!dismissed[key]) return false;
  const today = new Date().toDateString();
  return dismissed[key] === today;
}

function dismissAlert(key: string) {
  const dismissed = getDismissedAlerts();
  dismissed[key] = new Date().toDateString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
}

export function AdminActionAlerts({ stats }: AdminActionAlertsProps) {
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(() => {
    const dismissed = getDismissedAlerts();
    const today = new Date().toDateString();
    return new Set(Object.entries(dismissed).filter(([, d]) => d === today).map(([k]) => k));
  });

  const handleDismiss = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dismissAlert(key);
    setLocalDismissed(prev => new Set(prev).add(key));
  }, []);

  const alerts: AlertItem[] = [];

  if (stats.creditRiskClients > 0) {
    alerts.push({
      key: 'credit_risk',
      priority: 'high',
      icon: <CreditCard className="h-4 w-4" />,
      text: 'Kreditový problém',
      subtitle: stats.creditRiskClientNames.join(', '),
      count: stats.creditRiskClients,
      to: ROUTES.ADMIN.FINANCES,
    });
  }

  if (stats.todayUnconfirmed > 0) {
    alerts.push({
      key: 'today_unconfirmed',
      priority: 'high',
      icon: <Clock className="h-4 w-4" />,
      text: 'Dnes bez potvrdenia',
      count: stats.todayUnconfirmed,
      to: ROUTES.ADMIN.CALENDAR,
    });
  }

  if (stats.expiredProposals > 0) {
    alerts.push({
      key: 'expired_proposals',
      priority: 'medium',
      icon: <CalendarX className="h-4 w-4" />,
      text: 'Expirované návrhy',
      count: stats.expiredProposals,
      to: ROUTES.ADMIN.DASHBOARD,
    });
  }

  if (stats.weeklyStornoRate7d > 30 && stats.weeklyTrainingCount7d >= 5) {
    alerts.push({
      key: 'high_storno',
      priority: 'low',
      icon: <TrendingDown className="h-4 w-4" />,
      text: `Storno ${stats.weeklyStornoRate7d.toFixed(0)}% / 7d`,
      count: stats.weeklyTrainingCount7d,
      to: ROUTES.ADMIN.CLIENTS,
    });
  }

  if (stats.weeklySlotOccupancy < 50 && stats.weeklyOpenSlots > 5) {
    alerts.push({
      key: 'low_occupancy',
      priority: 'low',
      icon: <AlertTriangle className="h-4 w-4" />,
      text: `Obsadenosť ${stats.weeklySlotOccupancy.toFixed(0)}%`,
      count: stats.weeklyOpenSlots,
      to: ROUTES.ADMIN.CALENDAR,
    });
  }

  const sorted = alerts
    .filter(a => !localDismissed.has(a.key))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 3);

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-destructive uppercase tracking-wide px-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Potrebujem riešiť dnes
        <Popover>
          <PopoverTrigger asChild>
            <button className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
              <Info className="h-4 w-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-xs space-y-3" side="bottom" align="end">
            <p className="font-semibold text-sm text-foreground">Typy upozornení</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <CreditCard className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div><span className="font-medium text-destructive">Kreditový problém</span> — klient má tréning do 24h, ale nedostatočný zostatok.</div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <div><span className="font-medium text-destructive">Dnes bez potvrdenia</span> — tréning začína dnes a ešte nie je potvrdený.</div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarX className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                <div><span className="font-medium text-warning">Expirované návrhy</span> — navrhnuté tréningy s vypršaným deadlinom.</div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div><span className="font-medium">Vysoké storno</span> — miera storna &gt;30% za posledných 7 dní.</div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <div><span className="font-medium">Nízka obsadenosť</span> — obsadenosť &lt;50% pri &gt;5 voľných slotoch.</div>
              </div>
            </div>
            <p className="text-muted-foreground">Zobrazujú sa max. 3 najdôležitejšie. Odstránené upozornenia sa vrátia nasledujúci deň.</p>
          </PopoverContent>
        </Popover>
      </h2>
      <div className="ios-card overflow-hidden divide-y divide-border/50">
        {sorted.map((alert) => {
          const styles = PRIORITY_STYLES[alert.priority];
          return (
            <div key={alert.key} className={`flex items-center gap-3 p-4 transition-colors border-l-[3px] ${styles.border}`}>
              <Link
                to={alert.to}
                className="flex items-center gap-3 flex-1 min-w-0 ios-press hover:bg-muted/50 -m-4 p-4 pr-0"
              >
                <span className={styles.icon}>{alert.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">{alert.text}</span>
                  {alert.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{alert.subtitle}</p>
                  )}
                </div>
                <Badge className={`text-[10px] px-1.5 py-0 h-5 border-0 ${styles.badge}`}>
                  {alert.count}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
              </Link>
              <button
                onClick={(e) => handleDismiss(alert.key, e)}
                className="p-1.5 rounded-full text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors shrink-0"
                aria-label="Odstrániť upozornenie"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
