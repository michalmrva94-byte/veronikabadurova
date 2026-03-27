import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, Group, Discipline, PersonalRecord, SzpsLimit } from '@/types/swimdesk';
import {
  formatTime, formatGap, getGapStatus, getSwimmerCategory,
  COMPETITION_LABELS, CATEGORY_LABELS, CATEGORY_SHORT_LABELS,
  DEFAULT_LIMIT_DISCIPLINES, GAP_STATUS_COLORS,
} from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Trophy } from 'lucide-react';
import BulkPRImport from '@/components/sd/BulkPRImport';

export default function SDLimitsPage() {
  const { club } = useSDAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [allRecords, setAllRecords] = useState<PersonalRecord[]>([]);
  const [limits, setLimits] = useState<SzpsLimit[]>([]);
  const [competition, setCompetition] = useState('MSR_ziaci');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    if (!club?.id) return;

    const [grRes, swRes, discRes, recRes, limRes] = await Promise.all([
      supabase.from('groups').select('*').eq('club_id', club.id).order('name'),
      supabase.from('swimmers').select('*').eq('club_id', club.id).order('last_name'),
      supabase.from('disciplines').select('*').order('distance'),
      supabase.from('personal_records').select('*'),
      supabase.from('szps_limits').select('*'),
    ]);

    const gr = (grRes.data || []) as Group[];
    setGroups(gr);
    if (gr.length > 0 && !selectedGroupId) setSelectedGroupId(gr[0].id);
    setSwimmers((swRes.data || []) as Swimmer[]);
    setDisciplines((discRes.data || []) as Discipline[]);
    setAllRecords((recRes.data || []) as PersonalRecord[]);
    setLimits((limRes.data || []) as SzpsLimit[]);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [club?.id]);

  // Swimmers in selected group
  const groupSwimmers = useMemo(() => {
    if (!selectedGroupId) return swimmers;
    return swimmers.filter(s => s.group_id === selectedGroupId);
  }, [swimmers, selectedGroupId]);

  // Discipline columns to show (filtered by DEFAULT_LIMIT_DISCIPLINES codes)
  const discColumns = useMemo(() => {
    return disciplines.filter(d => DEFAULT_LIMIT_DISCIPLINES.includes(d.code));
  }, [disciplines]);

  // PR map: swimmer_id → discipline_id → best time
  const prMap = useMemo(() => {
    const map = new Map<string, Map<string, number>>();
    for (const r of allRecords) {
      if (!map.has(r.swimmer_id)) map.set(r.swimmer_id, new Map());
      const discMap = map.get(r.swimmer_id)!;
      const existing = discMap.get(r.discipline_id);
      const t = Number(r.time_seconds);
      if (!existing || t < existing) {
        discMap.set(r.discipline_id, t);
      }
    }
    return map;
  }, [allRecords]);

  // Limit map: category+gender+competition+discipline_id → limit time
  const limitLookup = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of limits) {
      if (l.competition !== competition) continue;
      const key = `${l.category}|${l.gender}|${l.discipline_id}`;
      const existing = map.get(key);
      const t = Number(l.time_seconds);
      if (!existing || t < existing) map.set(key, t);
    }
    return map;
  }, [limits, competition]);

  const getLimitForSwimmer = (swimmer: Swimmer, discId: string): number | null => {
    if (!swimmer.birth_year || !swimmer.gender) return null;
    const cat = getSwimmerCategory(swimmer.birth_year);
    const key = `${cat}|${swimmer.gender}|${discId}`;
    return limitLookup.get(key) ?? null;
  };

  // Summary stats
  const summaryStats = useMemo(() => {
    let swimmersWithLimit = 0;
    let totalDisciplinesMet = 0;
    for (const sw of groupSwimmers) {
      let hasAny = false;
      for (const d of discColumns) {
        const prTime = prMap.get(sw.id)?.get(d.id) ?? null;
        const limitTime = getLimitForSwimmer(sw, d.id);
        if (prTime != null && limitTime != null && prTime <= limitTime) {
          totalDisciplinesMet++;
          hasAny = true;
        }
      }
      if (hasAny) swimmersWithLimit++;
    }
    return { swimmersWithLimit, totalDisciplinesMet };
  }, [groupSwimmers, discColumns, prMap, limitLookup]);

  const handlePrint = () => window.print();

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Limity SZPS</h1>
          <p className="text-muted-foreground mt-1">Prehľad výkonov voči federačným limitom</p>
        </div>
        <div className="flex gap-2">
          <BulkPRImport swimmers={swimmers} disciplines={disciplines} onImported={fetchAll} />
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Exportovať PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Vyberte skupinu" />
          </SelectTrigger>
          <SelectContent>
            {groups.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={competition} onValueChange={setCompetition}>
          <TabsList>
            {Object.entries(COMPETITION_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Matrix table */}
      {groupSwimmers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadni plavci v skupine</h3>
            <p className="text-muted-foreground">Vyberte skupinu s plavcami</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-2 px-3 sticky left-0 bg-background z-10 min-w-[160px]">Meno</th>
                <th className="text-left py-2 px-2 min-w-[70px]">Kat.</th>
                {discColumns.map(d => {
                  // Show limit in header for context — use first swimmer's category as representative
                  const repSwimmer = groupSwimmers[0];
                  const limitTime = repSwimmer ? getLimitForSwimmer(repSwimmer, d.id) : null;
                  return (
                    <th key={d.id} className="text-center py-2 px-2 min-w-[90px]">
                      <div className="text-xs font-semibold">{d.name.replace('voľný štýl', 'VS').replace('polohový', 'PH')}</div>
                      {limitTime != null && (
                        <div className="text-[10px] text-muted-foreground font-normal">{formatTime(limitTime)}</div>
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {groupSwimmers.map(sw => {
                const cat = sw.birth_year ? getSwimmerCategory(sw.birth_year) : null;
                return (
                  <tr key={sw.id} className="border-b border-border hover:bg-muted/30">
                    <td className="py-2 px-3 sticky left-0 bg-background z-10 font-medium">
                      <Link to={`/plavci/${sw.id}`} className="text-primary hover:underline">
                        {sw.last_name} {sw.first_name}
                      </Link>
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground">
                      {cat ? (CATEGORY_SHORT_LABELS[cat] || cat) : '—'}
                    </td>
                    {discColumns.map(d => {
                      const prTime = prMap.get(sw.id)?.get(d.id) ?? null;
                      const limitTime = getLimitForSwimmer(sw, d.id);
                      const status = getGapStatus(prTime, limitTime);

                      let cellContent: React.ReactNode = '—';
                      let cellClass = 'text-muted-foreground/40';

                      if (status === 'splneny' && prTime != null && limitTime != null) {
                        cellContent = <span>✓ {formatGap(prTime, limitTime)}</span>;
                        cellClass = 'text-[#10b478] font-medium';
                      } else if (status === 'blizko' && prTime != null && limitTime != null) {
                        cellContent = formatGap(prTime, limitTime);
                        cellClass = 'text-[#f4a300] font-medium';
                      } else if (status === 'daleko' && prTime != null && limitTime != null) {
                        cellContent = formatGap(prTime, limitTime);
                        cellClass = 'text-muted-foreground';
                      }

                      return (
                        <td key={d.id} className={`py-2 px-2 text-center text-xs font-mono ${cellClass}`}>
                          <Link to={`/plavci/${sw.id}`} className="hover:underline">
                            {cellContent}
                          </Link>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary */}
      {groupSwimmers.length > 0 && (
        <div className="text-sm text-muted-foreground pt-2 border-t">
          <span className="font-medium text-foreground">{summaryStats.swimmersWithLimit}</span> plavcov splnilo aspoň 1 limit · <span className="font-medium text-foreground">{summaryStats.totalDisciplinesMet}</span> disciplín splnených celkom
        </div>
      )}
    </div>
  );
}
