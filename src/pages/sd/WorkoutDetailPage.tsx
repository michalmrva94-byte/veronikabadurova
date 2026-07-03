import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Workout, WorkoutSet, Group } from '@/types/swimdesk';
import { WORKOUT_TYPE_LABELS, PHASE_LABELS, INTENSITY_LABELS } from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, Pencil, Trash2, Dumbbell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

const PHASE_COLORS: Record<string, string> = {
  rozcvicka: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  hlavna: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  upokojenie: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const INTENSITY_COLORS: Record<string, string> = {
  nizka: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  stredna: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  vysoka: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function SDWorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { club, profile } = useSDAuth();
  const { toast } = useToast();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit workout dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [eDate, setEDate] = useState('');
  const [eType, setEType] = useState('zmiesany');
  const [eGroupId, setEGroupId] = useState('');
  const [eMeters, setEMeters] = useState('');
  const [eNotes, setENotes] = useState('');

  // Add set dialog
  const [addSetOpen, setAddSetOpen] = useState(false);
  const [addSetSaving, setAddSetSaving] = useState(false);
  const [sPhase, setSPhase] = useState<string>('hlavna');
  const [sDescription, setSDescription] = useState('');
  const [sMeters, setSMeters] = useState('');
  const [sIntensity, setSIntensity] = useState<string>('stredna');

  // Delete workout
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    if (!id) return;

    const [wRes, sRes, gRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('id', id).single(),
      supabase.from('workout_sets').select('*').eq('workout_id', id).order('set_order'),
      club?.id
        ? supabase.from('groups').select('*').eq('club_id', club.id).order('name')
        : Promise.resolve({ data: [] }),
    ]);

    if (wRes.data) {
      const w = wRes.data as Workout;
      // Fetch group name if group_id exists
      if (w.group_id) {
        const { data: gData } = await supabase.from('groups').select('*').eq('id', w.group_id).single();
        if (gData) w.group = gData as Group;
      }
      setWorkout(w);
    }

    setSets((sRes.data || []) as WorkoutSet[]);
    setGroups(((gRes as any).data || []) as Group[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id, club?.id]);

  const openEditDialog = () => {
    if (!workout) return;
    setETitle(workout.title);
    setEDate(workout.workout_date);
    setEType(workout.type);
    setEGroupId(workout.group_id || '');
    setEMeters(workout.total_meters ? String(workout.total_meters) : '');
    setENotes(workout.notes || '');
    setEditOpen(true);
  };

  const handleEditWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;
    setEditSaving(true);

    const { error } = await supabase.from('workouts').update({
      title: eTitle,
      workout_date: eDate,
      type: eType,
      group_id: eGroupId || null,
      total_meters: eMeters ? parseInt(eMeters) : 0,
      notes: eNotes || null,
    }).eq('id', workout.id);

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa upraviť tréning.', variant: 'destructive' });
    } else {
      toast({ title: 'Tréning upravený' });
      setEditOpen(false);
      fetchData();
    }
    setEditSaving(false);
  };

  const handleDeleteWorkout = async () => {
    if (!workout) return;
    setDeleting(true);

    // Delete sets first, then workout
    await supabase.from('workout_sets').delete().eq('workout_id', workout.id);
    const { error } = await supabase.from('workouts').delete().eq('id', workout.id);

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa vymazať tréning.', variant: 'destructive' });
      setDeleting(false);
    } else {
      toast({ title: 'Tréning vymazaný' });
      navigate('/treningy');
    }
  };

  const handleAddSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workout) return;
    setAddSetSaving(true);

    const nextOrder = sets.length > 0 ? Math.max(...sets.map((s) => s.set_order)) + 1 : 1;

    const { error } = await supabase.from('workout_sets').insert({
      workout_id: workout.id,
      set_order: nextOrder,
      phase: sPhase,
      description: sDescription,
      meters: sMeters ? parseInt(sMeters) : 0,
      intensity: sIntensity,
    });

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa pridať set.', variant: 'destructive' });
    } else {
      toast({ title: 'Set pridaný' });
      setSPhase('hlavna');
      setSDescription('');
      setSMeters('');
      setSIntensity('stredna');
      setAddSetOpen(false);
      fetchData();
    }
    setAddSetSaving(false);
  };

  const handleDeleteSet = async (setId: string) => {
    const { error } = await supabase.from('workout_sets').delete().eq('id', setId);

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa vymazať set.', variant: 'destructive' });
    } else {
      toast({ title: 'Set vymazaný' });
      fetchData();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!workout) {
    return <p className="text-center py-12 text-muted-foreground">Tréning nenájdený</p>;
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/treningy"><ArrowLeft className="w-4 h-4 mr-1" /> Späť</Link>
        </Button>
      </div>

      {/* Workout info */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{workout.title || 'Bez názvu'}</h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground flex-wrap">
            <span>{format(new Date(workout.workout_date), 'd. MMMM yyyy', { locale: sk })}</span>
            <span className="text-border">|</span>
            <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {WORKOUT_TYPE_LABELS[workout.type] || workout.type}
            </span>
            {workout.group && (
              <>
                <span className="text-border">|</span>
                <span>{workout.group.name}</span>
              </>
            )}
            {workout.total_meters > 0 && (
              <>
                <span className="text-border">|</span>
                <span className="font-semibold text-primary">{workout.total_meters}m</span>
              </>
            )}
          </div>
          {workout.notes && (
            <p className="text-sm text-muted-foreground mt-2">{workout.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEditDialog}>
            <Pencil className="w-4 h-4 mr-1" /> Upraviť
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={deleting}>
                <Trash2 className="w-4 h-4 mr-1" /> Vymazať
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Vymazať tréning</AlertDialogTitle>
                <AlertDialogDescription>
                  Naozaj chcete vymazať tento tréning? Táto akcia sa nedá vrátiť.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteWorkout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Vymazať
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Sets section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sety</h2>
          <Button size="sm" onClick={() => setAddSetOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Pridať set
          </Button>
        </div>

        {sets.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Dumbbell className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Žiadne sety</h3>
              <p className="text-muted-foreground mb-4">
                Pridajte sety do tohto tréningu
              </p>
              <Button onClick={() => setAddSetOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Pridať set
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Fáza</TableHead>
                  <TableHead>Popis</TableHead>
                  <TableHead className="text-right">Metre</TableHead>
                  <TableHead>Intenzita</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sets.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.set_order}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${PHASE_COLORS[s.phase] || ''}`}>
                        {PHASE_LABELS[s.phase] || s.phase}
                      </span>
                    </TableCell>
                    <TableCell>{s.description || '—'}</TableCell>
                    <TableCell className="text-right">{s.meters > 0 ? `${s.meters}m` : '—'}</TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${INTENSITY_COLORS[s.intensity] || ''}`}>
                        {INTENSITY_LABELS[s.intensity] || s.intensity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Vymazať set</AlertDialogTitle>
                            <AlertDialogDescription>
                              Naozaj chcete vymazať tento set?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteSet(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Vymazať
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Edit workout dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upraviť tréning</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditWorkout} className="space-y-4">
            <div className="space-y-2">
              <Label>Názov tréningu</Label>
              <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="Napr. Ranný tréning" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Dátum</Label>
                <Input type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={eType} onValueChange={setEType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORKOUT_TYPE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Skupina</Label>
                <Select value={eGroupId} onValueChange={setEGroupId}>
                  <SelectTrigger><SelectValue placeholder="Voliteľné" /></SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Celkové metre</Label>
                <Input type="number" value={eMeters} onChange={(e) => setEMeters(e.target.value)} placeholder="3000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámky</Label>
              <Textarea value={eNotes} onChange={(e) => setENotes(e.target.value)} placeholder="Voliteľné poznámky..." />
            </div>
            <Button type="submit" className="w-full" disabled={editSaving}>
              {editSaving ? 'Ukladanie...' : 'Uložiť zmeny'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add set dialog */}
      <Dialog open={addSetOpen} onOpenChange={setAddSetOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pridať set</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSet} className="space-y-4">
            <div className="space-y-2">
              <Label>Fáza</Label>
              <Select value={sPhase} onValueChange={setSPhase}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PHASE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Popis</Label>
              <Textarea value={sDescription} onChange={(e) => setSDescription(e.target.value)} placeholder="Napr. 4x100m voľný štýl" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Metre</Label>
                <Input type="number" value={sMeters} onChange={(e) => setSMeters(e.target.value)} placeholder="400" />
              </div>
              <div className="space-y-2">
                <Label>Intenzita</Label>
                <Select value={sIntensity} onValueChange={setSIntensity}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(INTENSITY_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={addSetSaving}>
              {addSetSaving ? 'Ukladanie...' : 'Pridať set'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
