import { useState, useMemo } from 'react';
import { Discipline, PersonalRecord } from '@/types/swimdesk';
import { formatTime, linearRegression } from '@/lib/sd-constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Dot,
} from 'recharts';

interface Props {
  disciplines: Discipline[];
  recordsByDisc: Map<string, PersonalRecord[]>;
  limitMap: Map<string, number>;
}

export default function ProgressChart({ disciplines, recordsByDisc, limitMap }: Props) {
  const [selectedDiscId, setSelectedDiscId] = useState(disciplines[0]?.id || '');

  const selectedDisc = disciplines.find(d => d.id === selectedDiscId);
  const allRecords = useMemo(() => {
    return (recordsByDisc.get(selectedDiscId) || [])
      .slice()
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  }, [recordsByDisc, selectedDiscId]);

  const limitTime = limitMap.get(selectedDiscId) ?? null;

  const chartData = useMemo(() => {
    return allRecords.map(r => ({
      date: r.recorded_at,
      time: Number(r.time_seconds),
      label: formatTime(Number(r.time_seconds)),
    }));
  }, [allRecords]);

  // Find best PR
  const bestPR = useMemo(() => {
    if (chartData.length === 0) return null;
    return chartData.reduce((best, d) => d.time < best.time ? d : best, chartData[0]);
  }, [chartData]);

  // Domain for inverted Y axis (lower time = better, show higher on chart)
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 100];
    const times = chartData.map(d => d.time);
    if (limitTime != null) times.push(limitTime);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const padding = (max - min) * 0.15 || 2;
    return [max + padding, Math.max(min - padding, 0)]; // inverted: max first
  }, [chartData, limitTime]);

  // Linear regression
  const trendData = useMemo(() => {
    if (chartData.length < 2) return null;
    const points = chartData.map(d => ({
      x: new Date(d.date).getTime(),
      y: d.time,
    }));
    const reg = linearRegression(points);
    if (!reg) return null;

    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return {
      regression: reg,
      line: [
        { date: chartData[0].date, trend: reg.slope * firstX + reg.intercept },
        { date: chartData[chartData.length - 1].date, trend: reg.slope * lastX + reg.intercept },
      ],
    };
  }, [chartData]);

  // Stats
  const stats = useMemo(() => {
    if (chartData.length < 2) return null;
    const first = chartData[0];
    const last = chartData[chartData.length - 1];
    const totalImprovement = first.time - last.time;
    const daysDiff = (new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24);
    const monthsDiff = daysDiff / 30.44;
    const perMonth = monthsDiff > 0 ? totalImprovement / monthsDiff : 0;

    let projectedDate: string | null = null;
    if (limitTime != null && trendData?.regression && trendData.regression.slope < 0) {
      const { slope, intercept } = trendData.regression;
      const targetTimestamp = (limitTime - intercept) / slope;
      if (targetTimestamp > Date.now()) {
        const d = new Date(targetTimestamp);
        const months = ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'];
        projectedDate = `~${months[d.getMonth()]} ${d.getFullYear()}`;
      }
    }

    return {
      totalImprovement,
      monthsDiff,
      perMonth,
      projectedDate,
    };
  }, [chartData, limitTime, trendData]);

  // Merge trend into chart data
  const mergedData = useMemo(() => {
    if (!trendData) return chartData;
    const trendMap = new Map<string, number>();
    trendData.line.forEach(t => trendMap.set(t.date, t.trend));

    return chartData.map(d => ({
      ...d,
      trend: trendMap.get(d.date) ?? undefined,
    }));
  }, [chartData, trendData]);

  // If trendData only has start/end, add them both
  const finalData = useMemo(() => {
    if (!trendData) return mergedData;
    // Ensure trend values exist on first and last points
    const result = [...mergedData];
    if (result.length > 0 && result[0].trend == null) {
      result[0] = { ...result[0], trend: trendData.line[0].trend };
    }
    if (result.length > 1 && result[result.length - 1].trend == null) {
      result[result.length - 1] = { ...result[result.length - 1], trend: trendData.line[1].trend };
    }
    return result;
  }, [mergedData, trendData]);

  const formatYTick = (val: number) => formatTime(val);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Vývoj výkonu</CardTitle>
          <Select value={selectedDiscId} onValueChange={setSelectedDiscId}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              {disciplines.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name} ({d.pool_size}m)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {chartData.length < 2 ? (
          <p className="text-muted-foreground text-center py-8">Nedostatok údajov pre graf (potrebné min. 2 záznamy)</p>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={finalData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(d: string) => {
                    const dt = new Date(d);
                    return `${dt.getDate()}.${dt.getMonth() + 1}`;
                  }}
                />
                <YAxis
                  domain={yDomain}
                  tickFormatter={formatYTick}
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  formatter={(val: number) => [formatTime(val), 'Čas']}
                  labelFormatter={(d: string) => new Date(d).toLocaleDateString('sk-SK')}
                />
                {/* Limit reference line */}
                {limitTime != null && (
                  <ReferenceLine
                    y={limitTime}
                    stroke="#10b478"
                    strokeDasharray="6 3"
                    label={{ value: `Limit ${formatTime(limitTime)}`, position: 'right', fontSize: 11, fill: '#10b478' }}
                  />
                )}
                {/* Trend line */}
                {trendData && (
                  <Line
                    type="linear"
                    dataKey="trend"
                    stroke="#a0a0a0"
                    strokeDasharray="4 4"
                    dot={false}
                    strokeWidth={1}
                    connectNulls
                  />
                )}
                {/* Main data line */}
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="#1A56E8"
                  strokeWidth={2}
                  dot={(props: any) => {
                    const isBest = bestPR && props.payload.date === bestPR.date && props.payload.time === bestPR.time;
                    return (
                      <Dot
                        {...props}
                        r={isBest ? 6 : 4}
                        fill={isBest ? '#1A56E8' : '#fff'}
                        stroke="#1A56E8"
                        strokeWidth={2}
                      />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* Stats below chart */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Celkové zlepšenie</p>
                  <p className="font-semibold text-[#10b478]">
                    −{stats.totalImprovement.toFixed(2)}s za {Math.round(stats.monthsDiff)} {stats.monthsDiff === 1 ? 'mesiac' : stats.monthsDiff < 5 ? 'mesiace' : 'mesiacov'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Priemerné zlepšenie</p>
                  <p className="font-semibold">−{stats.perMonth.toFixed(2)}s / mesiac</p>
                </div>
                {stats.projectedDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Ak trend vydrží</p>
                    <p className="font-semibold">Limit dosiahne {stats.projectedDate}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
