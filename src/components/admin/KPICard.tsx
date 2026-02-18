import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

export function KPICard({ icon, title, mainValue, mainColor = 'primary', subValues, badge, loading, className = '' }: KPICardProps) {
  return (
    <div className={`ios-card p-4 flex flex-col justify-between min-h-[120px] ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
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
  );
}
