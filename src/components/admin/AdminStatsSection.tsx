import { AdminDashboardStats } from '@/hooks/useAdminDashboardStats';
import { Loader2, ChevronDown, TrendingUp, BarChart3, Target, Wallet } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useState } from 'react';

interface AdminStatsSectionProps {
  stats: AdminDashboardStats | undefined;
  isLoading: boolean;
}

type InsightLevel = 'success' | 'warning' | 'destructive';

interface Insight {
  level: InsightLevel;
  text: string;
}

function getStornoInsight(rate: number): Insight {
  if (rate < 15) return { level: 'success', text: 'Výborná stabilita tréningov.' };
  if (rate <= 25) return { level: 'warning', text: 'Sleduj potvrdenia tréningov.' };
  return { level: 'destructive', text: 'Zváž sprísnenie potvrdzovania alebo úpravu kapacity.' };
}

function getAvgTrainingsInsight(avg: number): Insight {
  if (avg >= 2) return { level: 'success', text: 'Klienti trénujú optimálne.' };
  if (avg >= 1) return { level: 'warning', text: 'Podpor pravidelnosť tréningov.' };
  return { level: 'destructive', text: 'Nízka pravidelnosť klientov.' };
}

function getOccupancyInsight(pct: number): Insight {
  if (pct > 95) return { level: 'destructive', text: 'Riziko preťaženia.' };
  if (pct >= 70) return { level: 'success', text: 'Ideálna vyťaženosť.' };
  return { level: 'warning', text: 'Kapacita nie je efektívne využitá.' };
}

const dotColors: Record<InsightLevel, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

const textColors: Record<InsightLevel, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
};

function getClvBenchmark(clv: number): { text: string; dotColor: string; textColor: string } {
  if (clv > 1000) return { text: 'Dlhodobí klienti – vysoká hodnota.', dotColor: 'bg-success', textColor: 'text-success' };
  if (clv >= 300) return { text: 'Stabilní klienti – dobrá hodnota.', dotColor: 'bg-success', textColor: 'text-success' };
  if (clv > 0) return { text: 'Krátkodobí klienti – sleduj retenciu.', dotColor: 'bg-warning', textColor: 'text-warning' };
  return { text: 'Sleduj pravidelnosť nových klientov.', dotColor: 'bg-warning', textColor: 'text-warning' };
}

function InsightText({ insight }: { insight: Insight }) {
  return (
    <div className="flex items-start gap-1.5 mt-1.5">
      <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${dotColors[insight.level]}`} />
      <p className={`text-[10px] leading-tight ${textColors[insight.level]}`}>
        {insight.text}
      </p>
    </div>
  );
}

function StatCard({ 
  icon, label, value, insight, loading, className = '' 
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  insight: Insight;
  loading?: boolean;
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
      {!loading && <InsightText insight={insight} />}
    </div>
  );
}

export function AdminStatsSection({ stats, isLoading }: AdminStatsSectionProps) {
  const [open, setOpen] = useState(false);

  const stornoInsight = getStornoInsight(stats?.stornoRate ?? 0);
  const avgInsight = getAvgTrainingsInsight(stats?.avgTrainingsPerClient ?? 0);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 px-4 w-full group">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Štatistiky
        </h2>
        <ChevronDown className={`h-4 w-4 text-muted-foreground/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </CollapsibleTrigger>

      <CollapsibleContent className="space-y-3 mt-3">
        {/* Operational KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Target className="h-5 w-5 text-primary" />}
            label="Miera storna"
            value={`${(stats?.stornoRate ?? 0).toFixed(0)}%`}
            insight={stornoInsight}
            loading={isLoading}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-success" />}
            label="Ø tréningy / klient / týždeň"
            value={(stats?.avgTrainingsPerClient ?? 0).toFixed(1)}
            insight={avgInsight}
            loading={isLoading}
          />
        </div>

        {/* CLV Panel */}
        <TooltipProvider>
          <div className="ios-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold">Hodnota klientov (CLV)</h3>
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5 cursor-help">?</button>
                </PopoverTrigger>
                <PopoverContent side="top" className="max-w-[250px] p-3 z-50">
                  <p className="text-xs">
                    CLV = priemerná dĺžka spolupráce × priemerný mesačný príjem na klienta.
                    Orientačný ukazovateľ dlhodobej hodnoty klientov.
                  </p>
                </PopoverContent>
              </Popover>
            </div>
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xl font-bold tabular-nums">
                    {(stats?.avgCooperationMonths ?? 0).toFixed(1)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Ø mesiacov</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums">
                    {(stats?.avgMonthlyRevenuePerClient ?? 0).toFixed(0)}€
                  </p>
                  <p className="text-[10px] text-muted-foreground">Ø mesačne/klient</p>
                </div>
                <div>
                  <p className="text-xl font-bold tabular-nums text-primary">
                    {(stats?.clv ?? 0).toFixed(0)}€
                  </p>
                  <p className="text-[10px] text-muted-foreground">CLV</p>
                </div>
              </div>
            )}
            {!isLoading && (
              <div className="flex items-start gap-1.5 mt-3">
                <span className={`mt-1 h-1.5 w-1.5 rounded-full shrink-0 ${getClvBenchmark(stats?.clv ?? 0).dotColor}`} />
                <p className={`text-[10px] leading-tight ${getClvBenchmark(stats?.clv ?? 0).textColor}`}>
                  {getClvBenchmark(stats?.clv ?? 0).text}
                </p>
              </div>
            )}
          </div>
        </TooltipProvider>
      </CollapsibleContent>
    </Collapsible>
  );
}
