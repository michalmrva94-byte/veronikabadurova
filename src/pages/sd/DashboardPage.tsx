import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES, formatTime, formatGap, getSwimmerCategory } from '@/lib/sd-constants';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, PersonalRecord, SzpsLimit, Discipline } from '@/types/swimdesk';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, Plus, ChevronRight, Sparkles, AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';

interface NearLimitEntry {
  swimmer: Swimmer;
  discipline: Discipline;
  prTime: number;
  limitTime: number;
  gap: number;
}

export default function SDDashboardPage() {
  const { profile, club } = useSDAuth();
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [limits, setLimits] = useState<SzpsLimit[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [aiInsights, setAiInsights] = useState<Array<{ type: string; message: string }>>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);

  useEffect(() => {
    if (!club?.id) return;

    const fetchStats = async () => {
      const [swRes, wkRes, recRes, limRes, discRes] = await Promise.all([
        supabase.from('swimmers').select('*').eq('club_id', club.id),
        supabase.from('workouts').select('*', { count: 'exact', head: true })
          .eq('club_id', club.id)
          .gte('workout_date', getMonday().toISOString().slice(0, 10))
          .lte('workout_date', getSunday().toISOString().slice(0, 10)),
        supabase.from('personal_records').select('*'),
        supabase.from('szps_limits').select('*'),
        supabase.from('disciplines').select('*'),
      ]);

      const sw = (swRes.data || []) as Swimmer[];
      setSwimmers(sw);
      setSwimmerCount(sw.length);
      setWorkoutCount(wkRes.count || 0);
      setRecords((recRes.data || []) as PersonalRecord[]);
      setLimits((limRes.data || []) as SzpsLimit[]);
      setDisciplines((discRes.data || []) as Discipline[]);
      setLoading(false);

      // Fetch AI insights (cached 4h)
      fetchInsights(club.id, session);
    };

    const fetchInsights = async (clubId: string, session: any) => {
      const cacheKey = `sd_insights_${clubId}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < 4 * 60 * 60 * 1000) {
            setAiInsights(data);
            return;
          }
        } catch {}
      }

      setInsightsLoading(true);
      try {
        const { data: { session: authSession } } = await supabase.auth.getSession();
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-insights`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authSession?.access_token}`,
            },
            body: JSON.stringify({
              club_id: clubId,
              near_limit_swimmers: [],
              recent_improvements: [],
              active_plans_count: 0,
            }),
            signal: AbortSignal.timeout(20000),
          }
        );
        const data = await res.json();
        const insights = Array.isArray(data.insights) ? data.insights : [];
        setAiInsights(insights);
        localStorage.setItem(cacheKey, JSON.stringify({ data: insights, ts: Date.now() }));
      } catch {
        // silently fail — insights are optional
      }
      setInsightsLoading(false);
    };

    fetchStats();
  }, [club?.id]);

  // Build near-limit entries
  const nearLimitEntries = useMemo((): NearLimitEntry[] => {
    const clubSwimmerIds = new Set(swimmers.map(s => s.id));
    const swimmerMap = new Map(swimmers.map(s => [s.id, s]));
    const discMap = new Map(disciplines.map(d => [d.id, d]));

    // Best PR per swimmer per discipline
    const prBest = new Map<string, { time: number; swimmerId: string; discId: string }>();
    for (const r of records) {
      if (!clubSwimmerIds.has(r.swimmer_id)) continue;
      const key = `${r.swimmer_id}|${r.discipline_id}`;
      const t = Number(r.time_seconds);
      const existing = prBest.get(key);
      if (!existing || t < existing.time) {
        prBest.set(key, { time: t, swimmerId: r.swimmer_id, discId: r.discipline_id });
      }
    }

    // Build limit lookup
    const limitLookup = new Map<string, number>();
    for (const l of limits) {
      const key = `${l.category}|${l.gender}|${l.discipline_id}`;
      const t = Number(l.time_seconds);
      const existing = limitLookup.get(key);
      if (!existing || t < existing) limitLookup.set(key, t);
    }

    const entries: NearLimitEntry[] = [];
    for (const [, pr] of prBest) {
      const sw = swimmerMap.get(pr.swimmerId);
      if (!sw?.birth_year || !sw?.gender) continue;
      const cat = getSwimmerCategory(sw.birth_year);
      const limitKey = `${cat}|${sw.gender}|${pr.discId}`;
      const limitTime = limitLookup.get(limitKey);
      if (limitTime == null) continue;
      const gap = pr.time - limitTime;
      // Within 0-4s but not yet achieved
      if (gap > 0 && gap <= 4) {
        const disc = discMap.get(pr.discId);
        if (disc) {
          entries.push({ swimmer: sw, discipline: disc, prTime: pr.time, limitTime, gap });
        }
      }
    }

    // Sort by smallest gap first, take top 3
    entries.sort((a, b) => a.gap - b.gap);
    return entries.slice(0, 3);
  }, [swimmers, records, limits, disciplines]);

  const nearLimitCount = useMemo(() => {
    const ids = new Set(nearLimitEntries.map(e => e.swimmer.id));
    // Also count all swimmers within 4s of any limit (not just top 3)
    const clubSwimmerIds = new Set(swimmers.map(s => s.id));
    const prBest = new Map<string, number>();
    for (const r of records) {
      if (!clubSwimmerIds.has(r.swimmer_id)) continue;
      const key = `${r.swimmer_id}|${r.discipline_id}`;
      const t = Number(r.time_seconds);
      const existing = prBest.get(key);
      if (!existing || t < existing) prBest.set(key, t);
    }
    const limitLookup = new Map<string, number>();
    for (const l of limits) {
      const key = `${l.category}|${l.gender}|${l.discipline_id}`;
      const t = Number(l.time_seconds);
      const existing = limitLookup.get(key);
      if (!existing || t < existing) limitLookup.set(key, t);
    }
    const nearIds = new Set<string>();
    for (const [compKey, prTime] of prBest) {
      const [swId, discId] = compKey.split('|');
      const sw = swimmers.find(s => s.id === swId);
      if (!sw?.birth_year || !sw?.gender) continue;
      const cat = getSwimmerCategory(sw.birth_year);
      const lk = `${cat}|${sw.gender}|${discId}`;
      const lt = limitLookup.get(lk);
      if (lt != null) {
        const gap = prTime - lt;
        if (gap > 0 && gap <= 4) nearIds.add(swId);
      }
    }
    return nearIds.size;
  }, [swimmers, records, limits]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobré ráno';
    if (hour < 18) return 'Dobrý deň';
    return 'Dobrý večer';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{greeting()}, {profile?.first_name}</h1>
        <p className="text-muted-foreground mt-1">Prehľad vášho plaveckého klubu</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Počet plavcov</p>
              <p className="text-2xl font-bold">{loading ? '—' : swimmerCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tréningy tento týždeň</p>
              <p className="text-2xl font-bold">{loading ? '—' : workoutCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-[#f4a300]/10">
              <Trophy className="w-6 h-6 text-[#f4a300]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plavci blízko limitu</p>
              <p className="text-2xl font-bold">{loading ? '—' : nearLimitCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Near limit swimmers detail */}
      {!loading && nearLimitEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Najbližšie k limitu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {nearLimitEntries.map((entry, i) => (
              <Link
                key={i}
                to={`/plavci/${entry.swimmer.id}`}
                className="flex items-center justify-between py-2.5 px-1 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div>
                  <span className="font-medium">{entry.swimmer.first_name} {entry.swimmer.last_name}</span>
                  <span className="text-sm text-muted-foreground ml-2">{entry.discipline.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-[#f4a300] font-medium">
                    {formatGap(entry.prTime, entry.limitTime)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              AI Odporúčanie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aiInsights.map((insight, i) => {
              const Icon = insight.type === 'upozornenie' ? AlertTriangle
                : insight.type === 'trend' ? TrendingUp
                : Lightbulb;
              const color = insight.type === 'upozornenie' ? 'text-[#f4a300]'
                : insight.type === 'trend' ? 'text-[#10b478]'
                : 'text-primary';
              return (
                <div key={i} className="flex items-start gap-3 py-2">
                  <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                  <p className="text-sm">{insight.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Empty states */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && swimmerCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Zatiaľ žiadni plavci</h3>
              <p className="text-sm text-muted-foreground mb-4">Začnite pridaním plavcov do vášho klubu</p>
              <Button asChild><Link to={SD_ROUTES.SWIMMERS}><Plus className="w-4 h-4 mr-2" />Pridať plavcov</Link></Button>
            </CardContent>
          </Card>
        )}
        {!loading && workoutCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Žiadne tréningy tento týždeň</h3>
              <p className="text-sm text-muted-foreground mb-4">Vytvorte tréning pre vašu skupinu</p>
              <Button asChild><Link to={SD_ROUTES.WORKOUTS}><Plus className="w-4 h-4 mr-2" />Vytvoriť tréning</Link></Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function getMonday() {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() - now.getDay() + 1);
  return d;
}

function getSunday() {
  const d = getMonday();
  d.setDate(d.getDate() + 6);
  return d;
}
