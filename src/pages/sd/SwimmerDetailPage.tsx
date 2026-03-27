import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, Group, Discipline, PersonalRecord, SzpsLimit } from '@/types/swimdesk';
import {
  formatTime, parseTimeInput, formatGap, getGapStatus, getSwimmerCategory,
  CATEGORY_LABELS, CATEGORY_SHORT_LABELS, GENDER_LABELS, STROKE_LABELS,
  GAP_STATUS_LABELS, GAP_STATUS_COLORS,
} from '@/lib/sd-constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, ChevronDown, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProgressChart from '@/components/sd/ProgressChart';

export default function SDSwimmerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  const [swimmer, setSwimmer] = useState<Swimmer | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [limits, setLimits] = useState<SzpsLimit[]>([]);
  const [loading, setLoading] = useState(true);

  // Add PR modal
  const [addOpen, setAddOpen] = useState(false);
  const [prDiscId, setPrDiscId] = useState('');
  const [prTime, setPrTime] = useState('');
  const [prDate, setPrDate] = useState(new Date().toISOString().slice(0, 10));
  const [prPool, setPrPool] = useState('25');
  const [prComp, setPrComp] = useState('');
  const [prSaving, setPrSaving] = useState(false);

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editGroupId, setEditGroupId] = useState('');

  // Expanded discipline rows
  const [expandedDisc, setExpandedDisc] = useState<Set<string>>(new Set());

  const fetchAll = async () => {
    if (!id) return;

    const [swRes, discRes, recRes, limRes, grRes] = await Promise.all([
      supabase.from('swimmers').select('*').eq('id', id).single(),
      supabase.from('disciplines').select('*').order('stroke').order('distance'),
      supabase.from('personal_records').select('*').eq('swimmer_id', id).order('recorded_at', { ascending: false }),
      supabase.from('szps_limits').select('*'),
      supabase.from('groups').select('*'),
    ]);

    const sw = swRes.data as Swimmer | null;
    setSwimmer(sw);
    setDisciplines((discRes.data || []) as Discipline[]);
    setRecords((recRes.data || []) as PersonalRecord[]);
    setLimits((limRes.data || []) as SzpsLimit[]);
    setGroups((grRes.data || []) as Group[]);

    if (sw?.group_id) {
      const g = (grRes.data || []).find((g: any) => g.id === sw.group_id);
      setGroup(g as Group || null);
    }

    if (sw) {
      setEditFirstName(sw.first_name);
      setEditLastName(sw.last_name);
      setEditBirthYear(sw.birth_year?.toString() || '');
      setEditGroupId(sw.group_id || '');
    }

    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [id]);

  const category = useMemo(() => {
    if (!swimmer?.birth_year) return null;
    return getSwimmerCategory(swimmer.birth_year);
  }, [swimmer?.birth_year]);

  // Build PR map: discipline_id → best record
  const prMap = useMemo(() => {
    const map = new Map<string, PersonalRecord>();
    for (const r of records) {
      const existing = map.get(r.discipline_id);
      if (!existing || Number(r.time_seconds) < Number(existing.time_seconds)) {
        map.set(r.discipline_id, r);
      }
    }
    return map;
  }, [records]);

  // Build limit map: discipline_id → limit time for this swimmer's category+gender
  const limitMap = useMemo(() => {
    if (!category || !swimmer?.gender) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const l of limits) {
      if (l.category === category && l.gender === swimmer.gender) {
        const existing = map.get(l.discipline_id);
        if (!existing || Number(l.time_seconds) < existing) {
          map.set(l.discipline_id, Number(l.time_seconds));
        }
      }
    }
    return map;
  }, [limits, category, swimmer?.gender]);

  // Group disciplines by stroke (only those with PRs or limits)
  const discByStroke = useMemo(() => {
    const strokeOrder = ['volny', 'znak', 'prsia', 'motylik', 'polohovy'];
    const map = new Map<string, Discipline[]>();
    for (const d of disciplines) {
      const hasPR = prMap.has(d.id);
      const hasLimit = limitMap.has(d.id);
      if (hasPR || hasLimit) {
        if (!map.has(d.stroke)) map.set(d.stroke, []);
        map.get(d.stroke)!.push(d);
      }
    }
    // Sort by stroke order, then by distance within
    const sorted = new Map<string, Discipline[]>();
    for (const s of strokeOrder) {
      if (map.has(s)) {
        sorted.set(s, map.get(s)!.sort((a, b) => a.distance - b.distance));
      }
    }
    return sorted;
  }, [disciplines, prMap, limitMap]);

  // Records per discipline for history expansion
  const recordsByDisc = useMemo(() => {
    const map = new Map<string, PersonalRecord[]>();
    for (const r of records) {
      if (!map.has(r.discipline_id)) map.set(r.discipline_id, []);
      map.get(r.discipline_id)!.push(r);
    }
    return map;
  }, [records]);

  // Disciplines with ≥2 records (for chart)
  const chartDisciplines = useMemo(() => {
    return disciplines.filter(d => (recordsByDisc.get(d.id)?.length || 0) >= 2);
  }, [disciplines, recordsByDisc]);

  const handleAddPR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const seconds = parseTimeInput(prTime);
    if (seconds == null) {
      toast({ title: 'Chyba', description: 'Neplatný formát času. Použite M:SS.ss alebo SS.ss', variant: 'destructive' });
      return;
    }
    setPrSaving(true);

    const { error } = await supabase.from('personal_records').insert({
      swimmer_id: id,
      discipline_id: prDiscId,
      time_seconds: seconds,
      recorded_at: prDate,
      pool_size: parseInt(prPool),
      competition_name: prComp || null,
    });

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa uložiť výsledok.', variant: 'destructive' });
    } else {
      toast({ title: 'Výsledok pridaný' });
      setPrDiscId('');
      setPrTime('');
      setPrDate(new Date().toISOString().slice(0, 10));
      setPrPool('25');
      setPrComp('');
      setAddOpen(false);
      fetchAll();
    }
    setPrSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!swimmer) return;
    const { error } = await supabase.from('swimmers').update({
      first_name: editFirstName,
      last_name: editLastName,
      birth_year: editBirthYear ? parseInt(editBirthYear) : null,
      group_id: editGroupId || null,
    }).eq('id', swimmer.id);

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa uložiť zmeny.', variant: 'destructive' });
    } else {
      toast({ title: 'Zmeny uložené' });
      setEditing(false);
      fetchAll();
    }
  };

  const toggleExpand = (discId: string) => {
    setExpandedDisc(prev => {
      const next = new Set(prev);
      if (next.has(discId)) next.delete(discId);
      else next.add(discId);
      return next;
    });
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }
  if (!swimmer) {
    return <p className="text-center py-12 text-muted-foreground">Plavec nenájdený</p>;
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/plavci"><ArrowLeft className="w-4 h-4 mr-1" /> Späť</Link>
      </Button>

      {/* ── Swimmer info card ── */}
      <Card>
        <CardContent className="p-5">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Meno</Label>
                  <Input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Priezvisko</Label>
                  <Input value={editLastName} onChange={e => setEditLastName(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Ročník</Label>
                  <Input type="number" value={editBirthYear} onChange={e => setEditBirthYear(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Skupina</Label>
                  <Select value={editGroupId} onValueChange={setEditGroupId}>
                    <SelectTrigger><SelectValue placeholder="Žiadna" /></SelectTrigger>
                    <SelectContent>
                      {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit}><Check className="w-4 h-4 mr-1" />Uložiť</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-4 h-4 mr-1" />Zrušiť</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold">{swimmer.first_name} {swimmer.last_name}</h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {swimmer.birth_year && <span className="text-sm text-muted-foreground">Ročník {swimmer.birth_year}</span>}
                  {swimmer.gender && <span className="text-sm text-muted-foreground">· {GENDER_LABELS[swimmer.gender]}</span>}
                  {group && <span className="text-sm text-muted-foreground">· {group.name}</span>}
                </div>
                {category && (
                  <span className="inline-block mt-2 px-2.5 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                    {CATEGORY_LABELS[category]} {CATEGORY_SHORT_LABELS[category]}
                  </span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Personal Records Section ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Osobné rekordy</h2>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="w-4 h-4 mr-1" />Pridať výsledok</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nový výsledok</DialogTitle></DialogHeader>
            <form onSubmit={handleAddPR} className="space-y-4">
              <div className="space-y-2">
                <Label>Disciplína</Label>
                <Select value={prDiscId} onValueChange={setPrDiscId}>
                  <SelectTrigger><SelectValue placeholder="Vyberte disciplínu" /></SelectTrigger>
                  <SelectContent>
                    {['volny', 'znak', 'prsia', 'motylik', 'polohovy'].map(stroke => {
                      const strokeDiscs = disciplines.filter(d => d.stroke === stroke);
                      if (strokeDiscs.length === 0) return null;
                      return (
                        <div key={stroke}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{STROKE_LABELS[stroke]}</div>
                          {strokeDiscs.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name} ({d.pool_size}m)</SelectItem>
                          ))}
                        </div>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Čas</Label>
                  <Input value={prTime} onChange={e => setPrTime(e.target.value)} placeholder="1:12.34 alebo 32.04" required />
                </div>
                <div className="space-y-2">
                  <Label>Dátum</Label>
                  <Input type="date" value={prDate} onChange={e => setPrDate(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Bazén</Label>
                  <Select value={prPool} onValueChange={setPrPool}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="25">25m</SelectItem>
                      <SelectItem value="50">50m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preteky / poznámka</Label>
                  <Input value={prComp} onChange={e => setPrComp(e.target.value)} placeholder="Voliteľné" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={prSaving || !prDiscId}>
                {prSaving ? 'Ukladanie...' : 'Uložiť výsledok'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* PR Table by stroke */}
      {discByStroke.size === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-3">Zatiaľ žiadne osobné rekordy</p>
            <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="w-4 h-4 mr-1" />Pridať prvý výsledok</Button>
          </CardContent>
        </Card>
      ) : (
        Array.from(discByStroke.entries()).map(([stroke, discs]) => (
          <div key={stroke}>
            <h3 className="font-semibold mb-2">{STROKE_LABELS[stroke]}</h3>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Disciplína</TableHead>
                    <TableHead>PR</TableHead>
                    <TableHead className="hidden sm:table-cell">Dátum</TableHead>
                    <TableHead className="hidden sm:table-cell">Bazén</TableHead>
                    <TableHead className="hidden sm:table-cell">Preteky</TableHead>
                    <TableHead className="text-right">Gap</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discs.map(d => {
                    const pr = prMap.get(d.id);
                    const limitTime = limitMap.get(d.id) ?? null;
                    const prTime = pr ? Number(pr.time_seconds) : null;
                    const status = getGapStatus(prTime, limitTime);
                    const isExpanded = expandedDisc.has(d.id);
                    const history = recordsByDisc.get(d.id) || [];

                    return (
                      <>
                        <TableRow
                          key={d.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => history.length > 1 && toggleExpand(d.id)}
                        >
                          <TableCell className="w-8 px-2">
                            {history.length > 1 && (
                              isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </TableCell>
                          <TableCell className="font-medium">{d.name}</TableCell>
                          <TableCell className="font-mono font-semibold">
                            {prTime != null ? formatTime(prTime) : '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {pr?.recorded_at || '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground">
                            {pr ? `${pr.pool_size}m` : '—'}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                            {pr?.competition_name || '—'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">
                            {prTime != null && limitTime != null ? (
                              <span className={prTime <= limitTime ? 'text-[#10b478]' : prTime - limitTime <= 3 ? 'text-[#f4a300]' : 'text-muted-foreground'}>
                                {formatGap(prTime, limitTime)}
                              </span>
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${GAP_STATUS_COLORS[status]}`}>
                              {status === 'splneny' ? '✓' : status === 'blizko' ? '⚡' : status === 'daleko' ? '→' : '—'} {GAP_STATUS_LABELS[status]}
                            </span>
                          </TableCell>
                        </TableRow>
                        {/* Expanded history rows */}
                        {isExpanded && history.map((r, i) => (
                          <TableRow key={r.id} className="bg-muted/30">
                            <TableCell></TableCell>
                            <TableCell className="text-sm text-muted-foreground pl-6">#{i + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{formatTime(Number(r.time_seconds))}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.recorded_at}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.pool_size}m</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{r.competition_name || '—'}</TableCell>
                            <TableCell></TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))}
                      </>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          </div>
        ))
      )}

      {/* ── Progress Chart ── */}
      {chartDisciplines.length > 0 && (
        <ProgressChart
          disciplines={chartDisciplines}
          recordsByDisc={recordsByDisc}
          limitMap={limitMap}
        />
      )}
    </div>
  );
}
