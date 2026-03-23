import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { Swimmer, Group } from '@/types/swimdesk';
import { SD_ROUTES } from '@/lib/sd-constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface AIPlan {
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
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: AIPlan;
  swimmer: Swimmer | null;
  clubId: string;
  profileId: string;
}

const DAY_OFFSETS: Record<string, number> = {
  'pondelok': 0, 'utorok': 1, 'streda': 2, 'štvrtok': 3, 'stvrtok': 3,
  'piatok': 4, 'sobota': 5, 'nedeľa': 6, 'nedela': 6,
};

function getNextMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 1 : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

export default function ImportPlanModal({ open, onOpenChange, plan, swimmer, clubId, profileId }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(getNextMonday());
  const [groupId, setGroupId] = useState(swimmer?.group_id || '');
  const [groups, setGroups] = useState<Group[]>([]);
  const [phases, setPhases] = useState({ phase_1: true, phase_2: true, phase_3: true });
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (!clubId) return;
    supabase.from('groups').select('*').eq('club_id', clubId).order('name')
      .then(({ data }) => {
        setGroups((data || []) as Group[]);
        if (swimmer?.group_id) setGroupId(swimmer.group_id);
      });
  }, [clubId, swimmer?.group_id]);

  // Calculate which weeks are included based on phases
  const phaseWeekRanges = useMemo(() => {
    const p = plan.periodization;
    const p1End = p.phase_1.weeks;
    const p2End = p1End + p.phase_2.weeks;
    const p3End = p2End + p.phase_3.weeks;
    return {
      phase_1: { start: 1, end: p1End },
      phase_2: { start: p1End + 1, end: p2End },
      phase_3: { start: p2End + 1, end: p3End },
    };
  }, [plan.periodization]);

  const selectedWeeks = useMemo(() => {
    const weeks = new Set<number>();
    if (phases.phase_1) for (let w = phaseWeekRanges.phase_1.start; w <= phaseWeekRanges.phase_1.end; w++) weeks.add(w);
    if (phases.phase_2) for (let w = phaseWeekRanges.phase_2.start; w <= phaseWeekRanges.phase_2.end; w++) weeks.add(w);
    if (phases.phase_3) for (let w = phaseWeekRanges.phase_3.start; w <= phaseWeekRanges.phase_3.end; w++) weeks.add(w);
    return weeks;
  }, [phases, phaseWeekRanges]);

  const totalTrainings = useMemo(() => {
    return plan.weekly_plans
      .filter(w => selectedWeeks.has(w.week))
      .reduce((sum, w) => sum + w.trainings.length, 0);
  }, [plan.weekly_plans, selectedWeeks]);

  const handleImport = async () => {
    setImporting(true);
    setProgress({ current: 0, total: totalTrainings });
    let imported = 0;

    const startDateObj = new Date(startDate);

    for (const week of plan.weekly_plans) {
      if (!selectedWeeks.has(week.week)) continue;
      const weekOffset = (week.week - 1) * 7;

      for (const training of week.trainings) {
        const dayName = training.day.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const dayOffset = DAY_OFFSETS[dayName] ?? 0;

        const trainingDate = new Date(startDateObj);
        trainingDate.setDate(startDateObj.getDate() + weekOffset + dayOffset);

        // Create workout
        const { data: workout, error: wErr } = await supabase.from('workouts').insert({
          club_id: clubId,
          group_id: groupId || null,
          coach_id: profileId || null,
          workout_date: trainingDate.toISOString().slice(0, 10),
          type: training.type || 'zmiesany',
          title: training.title || `Týždeň ${week.week} — ${training.day}`,
          total_meters: training.total_meters || 0,
          notes: `AI plán: ${week.theme}`,
        }).select().single();

        if (wErr || !workout) {
          console.error('Workout insert error:', wErr);
          continue;
        }

        // Create sets
        if (training.sets && training.sets.length > 0) {
          const setInserts = training.sets.map((s, i) => ({
            workout_id: workout.id,
            set_order: i,
            phase: s.phase || 'hlavna',
            description: s.description || '',
            meters: s.meters || 0,
            intensity: s.intensity || 'stredna',
            duration_min: null,
          }));

          await supabase.from('workout_sets').insert(setInserts);
        }

        imported++;
        setProgress({ current: imported, total: totalTrainings });
      }
    }

    toast({ title: `Importovaných ${imported} tréningov do kalendára` });
    setImporting(false);
    onOpenChange(false);
    navigate(SD_ROUTES.WORKOUTS);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Importovať plán do tréningového kalendára</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Začiatok</Label>
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Skupina</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger><SelectValue placeholder="Vyberte skupinu" /></SelectTrigger>
              <SelectContent>
                {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Importovať fázy</Label>
            <div className="space-y-2">
              {(['phase_1', 'phase_2', 'phase_3'] as const).map((key, i) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={phases[key]}
                    onCheckedChange={(checked) => setPhases(prev => ({ ...prev, [key]: !!checked }))}
                  />
                  <span className="text-sm">
                    Fáza {i + 1}: {plan.periodization[key].name} ({plan.periodization[key].weeks} týž.)
                  </span>
                </label>
              ))}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Celkom: <span className="font-medium text-foreground">{totalTrainings}</span> tréningov
          </p>

          {importing && (
            <div className="text-sm text-muted-foreground">
              Vytváram tréningy... {progress.current}/{progress.total}
            </div>
          )}

          <Button onClick={handleImport} disabled={importing || totalTrainings === 0} className="w-full">
            {importing ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Importujem...</>
            ) : (
              `Potvrdiť import (${totalTrainings} tréningov)`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
