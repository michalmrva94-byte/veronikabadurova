import { useEffect, useState, useMemo } from 'react';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, Discipline, PersonalRecord, SzpsLimit, SeasonPlan } from '@/types/swimdesk';
import {
  formatTime, parseTimeInput, getSwimmerCategory, STROKE_LABELS, CATEGORY_LABELS,
  PHASE_LABELS, INTENSITY_LABELS, WORKOUT_TYPE_LABELS,
} from '@/lib/sd-constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, Loader2, Printer, Trash2, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ImportPlanModal from '@/components/sd/ImportPlanModal';

interface AIPlan {
  analysis: {
    gap_seconds: number;
    weekly_improvement_needed: number;
    feasibility: string;
    key_focus: string;
  };
  periodization: {
    phase_1: { name: string; weeks: number; focus: string };
    phase_2: { name: string; weeks: number; focus: string };
    phase_3: { name: string; weeks: number; focus: string };
  };
  weekly_plans: Array<{
    week: number;
    phase: string;
    theme: string;
    total_meters: number;
    trainings: Array<{
      day: string;
      type: string;
      title: string;
      total_meters: number;
      sets: Array<{
        phase: string;
        description: string;
        meters: number;
        intensity: string;
      }>;
    }>;
  }>;
  coach_notes: string;
}

const LOADING_MESSAGES = [
  'Analyzujem výkonnostné dáta plavca...',
  'Zostavujem periodizačný plán...',
  'Generujem konkrétne tréningy...',
  'Finalizujem plán...',
];

const FEASIBILITY_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  realisticky: { label: 'Realisticky', color: 'text-[#10b478] bg-[#10b478]/10', icon: '✓' },
  narocne: { label: 'Náročne', color: 'text-[#f4a300] bg-[#f4a300]/10', icon: '⚡' },
  velmi_narocne: { label: 'Veľmi náročne', color: 'text-destructive bg-destructive/10', icon: '⚠' },
};

const PHASE_BORDER_COLORS: Record<string, string> = {
  rozcvicka: 'border-l-blue-400',
  hlavna: 'border-l-orange-400',
  upokojenie: 'border-l-green-400',
};

export default function SDPlansPage() {
  const { club, profile } = useSDAuth();
  const { toast } = useToast();

  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [limits, setLimits] = useState<SzpsLimit[]>([]);
  const [savedPlans, setSavedPlans] = useState<SeasonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [selSwimmerId, setSelSwimmerId] = useState('');
  const [selDiscId, setSelDiscId] = useState('');
  const [targetTime, setTargetTime] = useState('');
  const [competition, setCompetition] = useState('MSR žiakov 2026');
  const [weeks, setWeeks] = useState(6);
  const [trainingsPerWeek, setTrainingsPerWeek] = useState(4);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<AIPlan | null>(null);
  const [seasonPlanId, setSeasonPlanId] = useState<string | null>(null);

  // View saved plan
  const [viewingPlan, setViewingPlan] = useState<AIPlan | null>(null);
  const [viewingPlanMeta, setViewingPlanMeta] = useState<SeasonPlan | null>(null);

  // Import modal
  const [importOpen, setImportOpen] = useState(false);

  const fetchAll = async () => {
    if (!club?.id) return;
    const [swRes, discRes, recRes, limRes, planRes] = await Promise.all([
      supabase.from('swimmers').select('*').eq('club_id', club.id).order('last_name'),
      supabase.from('disciplines').select('*').order('stroke').order('distance'),
      supabase.from('personal_records').select('*'),
      supabase.from('szps_limits').select('*'),
      supabase.from('season_plans').select('*').order('created_at', { ascending: false }),
    ]);
    setSwimmers((swRes.data || []) as Swimmer[]);
    setDisciplines((discRes.data || []) as Discipline[]);
    setRecords((recRes.data || []) as PersonalRecord[]);
    setLimits((limRes.data || []) as SzpsLimit[]);

    // Filter plans to only those for club swimmers
    const clubSwimmerIds = new Set((swRes.data || []).map((s: any) => s.id));
    setSavedPlans(((planRes.data || []) as SeasonPlan[]).filter(p => clubSwimmerIds.has(p.swimmer_id)));
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [club?.id]);

  // Selected swimmer
  const selectedSwimmer = swimmers.find(s => s.id === selSwimmerId);

  // PRs for selected swimmer, grouped by discipline
  const swimmerPRs = useMemo(() => {
    if (!selSwimmerId) return new Map<string, number>();
    const map = new Map<string, number>();
    for (const r of records) {
      if (r.swimmer_id !== selSwimmerId) continue;
      const existing = map.get(r.discipline_id);
      const t = Number(r.time_seconds);
      if (!existing || t < existing) map.set(r.discipline_id, t);
    }
    return map;
  }, [records, selSwimmerId]);

  // Disciplines where swimmer has PR
  const availableDiscs = useMemo(() => {
    return disciplines.filter(d => swimmerPRs.has(d.id));
  }, [disciplines, swimmerPRs]);

  // Auto-fill target time from SZPS limit when discipline changes
  useEffect(() => {
    if (!selDiscId || !selectedSwimmer?.birth_year || !selectedSwimmer?.gender) return;
    const cat = getSwimmerCategory(selectedSwimmer.birth_year);
    const match = limits.find(l =>
      l.discipline_id === selDiscId && l.category === cat && l.gender === selectedSwimmer.gender
    );
    if (match) {
      setTargetTime(formatTime(Number(match.time_seconds)));
    }
  }, [selDiscId, selectedSwimmer, limits]);

  // Gap calculation
  const currentPR = selDiscId ? swimmerPRs.get(selDiscId) : null;
  const targetSeconds = parseTimeInput(targetTime);
  const gapSeconds = currentPR != null && targetSeconds != null ? currentPR - targetSeconds : null;

  const gapFeasibility = gapSeconds != null
    ? gapSeconds > 10 ? 'danger' : gapSeconds > 5 ? 'warning' : 'ok'
    : null;

  // Loading animation
  useEffect(() => {
    if (!generating) return;
    setLoadingMsgIdx(0);
    const intervals = [3000, 5000, 7000];
    const timers = intervals.map((delay, i) =>
      setTimeout(() => setLoadingMsgIdx(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [generating]);

  const handleGenerate = async () => {
    if (!selSwimmerId || !selDiscId || !targetSeconds || !selectedSwimmer) return;
    const disc = disciplines.find(d => d.id === selDiscId);
    if (!disc || currentPR == null) return;

    setGenerating(true);
    setGeneratedPlan(null);
    setViewingPlan(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-training-plan`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            swimmer_id: selSwimmerId,
            discipline_code: disc.code,
            discipline_name: disc.name,
            discipline_id: disc.id,
            current_pr_seconds: currentPR,
            target_time_seconds: targetSeconds,
            weeks,
            trainings_per_week: trainingsPerWeek,
            competition_name: competition,
            swimmer_age: selectedSwimmer.birth_year
              ? new Date().getFullYear() - selectedSwimmer.birth_year
              : 14,
            swimmer_gender: selectedSwimmer.gender || 'M',
          }),
          signal: AbortSignal.timeout(65000),
        }
      );

      const data = await res.json();
      if (data.error) {
        toast({ title: 'Chyba', description: data.error, variant: 'destructive' });
      } else {
        setGeneratedPlan(data.plan as AIPlan);
        setSeasonPlanId(data.season_plan_id);
        toast({ title: 'Plán vygenerovaný!' });
        fetchAll(); // refresh saved plans
      }
    } catch (err: any) {
      toast({
        title: 'Chyba',
        description: err?.name === 'TimeoutError'
          ? 'Časový limit vypršal (60s). Skúste znova.'
          : 'Generovanie zlyhalo, skúste znova',
        variant: 'destructive',
      });
    }
    setGenerating(false);
  };

  const handleDelete = async (planId: string) => {
    const { error } = await supabase.from('season_plans').delete().eq('id', planId);
    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa zmazať plán.', variant: 'destructive' });
    } else {
      toast({ title: 'Plán zmazaný' });
      fetchAll();
      if (viewingPlanMeta?.id === planId) {
        setViewingPlan(null);
        setViewingPlanMeta(null);
      }
    }
  };

  const activePlan = generatedPlan || viewingPlan;

  // Disc map for saved plans display
  const discMap = useMemo(() => new Map(disciplines.map(d => [d.id, d])), [disciplines]);
  const swimmerMap = useMemo(() => new Map(swimmers.map(s => [s.id, s])), [swimmers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">AI Plány</h1>
        <p className="text-muted-foreground mt-1">Generovanie tréningových plánov pomocou AI</p>
      </div>

      {/* ── Generate Form ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Vygenerovať nový plán
          </CardTitle>
          <CardDescription>Vyberte plavca, disciplínu a cieľ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Swimmer */}
            <div className="space-y-2">
              <Label>Plavec</Label>
              <Select value={selSwimmerId} onValueChange={(v) => { setSelSwimmerId(v); setSelDiscId(''); setTargetTime(''); }}>
                <SelectTrigger><SelectValue placeholder="Vyberte plavca" /></SelectTrigger>
                <SelectContent>
                  {swimmers.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.last_name} {s.first_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Discipline */}
            <div className="space-y-2">
              <Label>Disciplína</Label>
              <Select value={selDiscId} onValueChange={setSelDiscId} disabled={!selSwimmerId}>
                <SelectTrigger><SelectValue placeholder={selSwimmerId ? 'Vyberte disciplínu' : 'Najprv vyberte plavca'} /></SelectTrigger>
                <SelectContent>
                  {['volny', 'znak', 'prsia', 'motylik', 'polohovy'].map(stroke => {
                    const sDiscs = availableDiscs.filter(d => d.stroke === stroke);
                    if (sDiscs.length === 0) return null;
                    return (
                      <div key={stroke}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{STROKE_LABELS[stroke]}</div>
                        {sDiscs.map(d => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name} — {formatTime(swimmerPRs.get(d.id)!)}
                          </SelectItem>
                        ))}
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Target time */}
            <div className="space-y-2">
              <Label>Cieľový čas</Label>
              <Input
                value={targetTime}
                onChange={e => setTargetTime(e.target.value)}
                placeholder="1:09.00"
                disabled={!selDiscId}
              />
              {gapSeconds != null && (
                <p className={`text-xs font-medium ${gapFeasibility === 'ok' ? 'text-[#10b478]' : gapFeasibility === 'warning' ? 'text-[#f4a300]' : 'text-destructive'}`}>
                  Gap: −{gapSeconds.toFixed(2)}s
                  {gapFeasibility === 'warning' && ' (náročné)'}
                  {gapFeasibility === 'danger' && ' (veľmi náročné)'}
                </p>
              )}
            </div>

            {/* Competition */}
            <div className="space-y-2">
              <Label>Preteky</Label>
              <Input value={competition} onChange={e => setCompetition(e.target.value)} />
            </div>

            {/* Current PR display */}
            {currentPR != null && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Aktuálny PR</Label>
                <p className="text-lg font-mono font-semibold pt-1">{formatTime(currentPR)}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Weeks */}
            <div className="space-y-2">
              <Label>Počet týždňov</Label>
              <div className="flex gap-2">
                {[4, 6, 8].map(w => (
                  <Button
                    key={w}
                    type="button"
                    variant={weeks === w ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setWeeks(w)}
                  >
                    {w}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trainings per week */}
            <div className="space-y-2">
              <Label>Tréningy za týždeň</Label>
              <div className="flex gap-2">
                {[3, 4, 5].map(t => (
                  <Button
                    key={t}
                    type="button"
                    variant={trainingsPerWeek === t ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrainingsPerWeek(t)}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !selSwimmerId || !selDiscId || targetSeconds == null}
            className="w-full md:w-auto"
            size="lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {LOADING_MESSAGES[Math.min(loadingMsgIdx, LOADING_MESSAGES.length - 1)]}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Vygenerovať plán
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* ── Generated / Viewed Plan Display ── */}
      {activePlan && <PlanDisplay plan={activePlan} onImport={() => setImportOpen(true)} onRegenerate={handleGenerate} generating={generating} />}

      {/* Import modal */}
      {activePlan && (
        <ImportPlanModal
          open={importOpen}
          onOpenChange={setImportOpen}
          plan={activePlan}
          swimmer={selectedSwimmer || (viewingPlanMeta ? swimmerMap.get(viewingPlanMeta.swimmer_id) : undefined) || null}
          clubId={club?.id || ''}
          profileId={profile?.id || ''}
        />
      )}

      {/* ── Saved Plans ── */}
      {savedPlans.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Uložené plány</h2>
          {savedPlans.map(plan => {
            const sw = swimmerMap.get(plan.swimmer_id);
            const disc = discMap.get(plan.discipline_id);
            return (
              <Card key={plan.id}>
                <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="font-medium">{sw ? `${sw.first_name} ${sw.last_name}` : '—'}</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span>{disc?.name || '—'}</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="font-mono text-sm">→ {formatTime(Number(plan.target_time_seconds))}</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="text-sm text-muted-foreground">{plan.weeks} týž.</span>
                    <span className="text-muted-foreground mx-2">·</span>
                    <span className="text-xs text-muted-foreground">{new Date(plan.created_at).toLocaleDateString('sk-SK')}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (plan.ai_plan_json) {
                          setViewingPlan(plan.ai_plan_json as unknown as AIPlan);
                          setViewingPlanMeta(plan);
                          setGeneratedPlan(null);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      disabled={!plan.ai_plan_json}
                    >
                      <Eye className="w-4 h-4 mr-1" />Zobraziť
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(plan.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Plan Display Component ──
function PlanDisplay({ plan, onImport, onRegenerate, generating }: {
  plan: AIPlan;
  onImport: () => void;
  onRegenerate: () => void;
  generating: boolean;
}) {
  const { analysis, periodization, weekly_plans, coach_notes } = plan;
  const feasCfg = FEASIBILITY_CONFIG[analysis.feasibility] || FEASIBILITY_CONFIG.narocne;

  return (
    <div className="space-y-4">
      {/* Analysis card */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-sm text-muted-foreground">Gap</span>
              <p className="font-mono font-bold text-lg">{analysis.gap_seconds?.toFixed(1)}s</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Zlepšenie / týždeň</span>
              <p className="font-mono font-bold text-lg">{analysis.weekly_improvement_needed?.toFixed(2)}s</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${feasCfg.color}`}>
              {feasCfg.icon} {feasCfg.label}
            </span>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Kľúčový fokus</span>
            <p className="font-medium">{analysis.key_focus}</p>
          </div>
          {coach_notes && (
            <div className="pt-2 border-t">
              <span className="text-sm text-muted-foreground">Poznámky trénera</span>
              <p className="text-sm mt-1">{coach_notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Periodization */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[periodization.phase_1, periodization.phase_2, periodization.phase_3].map((phase, i) => (
          <Card key={i} className={i === 0 ? 'border-l-4 border-l-blue-400' : i === 1 ? 'border-l-4 border-l-orange-400' : 'border-l-4 border-l-green-400'}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Fáza {i + 1}</p>
              <p className="font-semibold">{phase.name}</p>
              <p className="text-sm text-muted-foreground">{phase.weeks} týž. — {phase.focus}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly plans */}
      <Accordion type="multiple" className="space-y-2">
        {weekly_plans.map(week => (
          <AccordionItem key={week.week} value={`week-${week.week}`} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <span className="font-semibold">Týždeň {week.week}</span>
                <span className="text-sm text-muted-foreground">— {week.theme}</span>
                <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{week.total_meters}m</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              {week.trainings.map((t, ti) => (
                <div key={ti} className="bg-muted/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{t.day}</span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {WORKOUT_TYPE_LABELS[t.type] || t.type}
                    </span>
                    <span className="text-sm text-muted-foreground">{t.title}</span>
                    <span className="text-xs font-mono ml-auto">{t.total_meters}m</span>
                  </div>
                  <div className="space-y-1">
                    {t.sets.map((set, si) => (
                      <div key={si} className={`pl-3 py-1 border-l-2 ${PHASE_BORDER_COLORS[set.phase] || 'border-l-gray-300'} text-sm`}>
                        <span className="text-muted-foreground text-xs mr-2">{PHASE_LABELS[set.phase] || set.phase}</span>
                        <span>{set.description}</span>
                        <span className="text-xs text-muted-foreground ml-2">({set.meters}m, {INTENSITY_LABELS[set.intensity] || set.intensity})</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap sticky bottom-4 bg-background/90 backdrop-blur py-3 px-1 -mx-1 rounded-lg">
        <Button onClick={onImport}>
          <Download className="w-4 h-4 mr-1" />
          Importovať do tréningov
        </Button>
        <Button variant="outline" onClick={onRegenerate} disabled={generating}>
          <Sparkles className="w-4 h-4 mr-1" />
          Vygenerovať znova
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 mr-1" />
          Exportovať PDF
        </Button>
      </div>
    </div>
  );
}
