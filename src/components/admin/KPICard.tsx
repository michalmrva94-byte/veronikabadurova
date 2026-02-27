import { Loader2, Info, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface KPISubValue {
  label: string;
  value: string | number;
  color?: 'default' | 'success' | 'warning' | 'destructive' | 'muted';
}

interface KPICardProps {
  icon: React.ReactNode;
  title: string;
  mainValue: string | number;
  mainColor?: 'success' | 'warning' | 'destructive' | 'primary' | 'muted';
  subValues?: KPISubValue[];
  badge?: { label: string; variant: 'destructive' | 'secondary' | 'default' };
  tooltip?: string;
  loading?: boolean;
  className?: string;
  trend?: { current: number; previous: number };
  insightText?: string;
  insightColor?: 'success' | 'warning' | 'destructive' | 'muted';
}

const colorMap: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  default: 'text-foreground',
};

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  if (previous === 0) return null;
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change);

  let icon: React.ReactNode;
  let colorClass: string;
  let prefix: string;

  if (change > 5) {
    icon = <TrendingUp className="h-3 w-3" />;
    colorClass = 'text-success';
    prefix = '+';
  } else if (change < -5) {
    icon = <TrendingDown className="h-3 w-3" />;
    colorClass = 'text-destructive';
    prefix = '';
  } else {
    icon = <ArrowRight className="h-3 w-3" />;
    colorClass = 'text-muted-foreground';
    prefix = rounded > 0 ? '+' : '';
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={`inline-flex items-center gap-0.5 text-[10px] font-medium ${colorClass}`}>
          {icon} {prefix}{rounded}%
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[200px]">
        <p className="text-xs">Porovnanie s predchádzajúcim obdobím</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function KPICard({ icon, title, mainValue, mainColor = 'primary', subValues, badge, tooltip, loading, className = '', trend, insightText, insightColor }: KPICardProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={`ios-card p-4 flex flex-col justify-between min-h-[120px] ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
            {tooltip && (
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="max-w-[220px] p-3 z-50">
                  <p className="text-xs leading-relaxed">{tooltip}</p>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
        
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div>
            <div className="flex items-baseline gap-2">
              <p className={`text-2xl font-bold tabular-nums ${colorMap[mainColor] || ''}`}>
                {mainValue}
              </p>
              {trend && <TrendArrow current={trend.current} previous={trend.previous} />}
              {badge && (
                <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0.5">
                  {badge.label}
                </Badge>
              )}
            </div>
            {insightText && (
              <p className={`text-[10px] mt-0.5 ${colorMap[insightColor || 'muted']}`}>
                {insightText}
              </p>
            )}
            {subValues && subValues.length > 0 && (
              <div className="mt-1.5 space-y-0.5">
                {subValues.map((sv, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">{sv.label}</span>
                    <span className={`font-medium tabular-nums ${colorMap[sv.color || 'default']}`}>
                      {sv.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
