import { Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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
}

const colorMap: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
  default: 'text-foreground',
};

export function KPICard({ icon, title, mainValue, mainColor = 'primary', subValues, badge, tooltip, loading, className = '' }: KPICardProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <div className={`ios-card p-4 flex flex-col justify-between min-h-[120px] ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
            {tooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[220px]">
                  <p className="text-xs leading-relaxed">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          {badge && (
            <Badge variant={badge.variant} className="text-[10px] px-1.5 py-0">
              {badge.label}
            </Badge>
          )}
        </div>
        
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <div>
            <p className={`text-2xl font-bold tabular-nums ${colorMap[mainColor] || ''}`}>
              {mainValue}
            </p>
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
