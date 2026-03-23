import { useEffect, useState } from 'react';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Workout, Group } from '@/types/swimdesk';
import { WORKOUT_TYPE_LABELS } from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { sk } from 'date-fns/locale';

export default function SDWorkoutsPage() {
  const { club, profile } = useSDAuth();
  const [workouts, setWorkouts] = useState<(Workout & { group?: Group })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form
  const [fTitle, setFTitle] = useState('');
  const [fDate, setFDate] = useState(new Date().toISOString().slice(0, 10));
  const [fType, setFType] = useState('zmiesany');
  const [fGroupId, setFGroupId] = useState('');
  const [fMeters, setFMeters] = useState('');
  const [fNotes, setFNotes] = useState('');

  const fetchData = async () => {
    if (!club?.id) return;

    const [wRes, gRes] = await Promise.all([
      supabase.from('workouts').select('*').eq('club_id', club.id).order('workout_date', { ascending: false }).limit(50),
      supabase.from('groups').select('*').eq('club_id', club.id).order('name'),
    ]);

    const groupMap = new Map<string, Group>();
    (gRes.data || []).forEach((g) => groupMap.set(g.id, g as Group));
    setGroups((gRes.data || []) as Group[]);

    setWorkouts(
      (wRes.data || []).map((w) => ({
        ...w,
        group: w.group_id ? groupMap.get(w.group_id) : undefined,
      })) as (Workout & { group?: Group })[]
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [club?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club?.id || !profile?.id) return;
    setSaving(true);

    const { error } = await supabase.from('workouts').insert({
      club_id: club.id,
      coach_id: profile.id,
      title: fTitle,
      workout_date: fDate,
      type: fType,
      group_id: fGroupId || null,
      total_meters: fMeters ? parseInt(fMeters) : 0,
      notes: fNotes || null,
    });

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa vytvoriť tréning.', variant: 'destructive' });
    } else {
      toast({ title: 'Tréning vytvorený' });
      setFTitle('');
      setFDate(new Date().toISOString().slice(0, 10));
      setFType('zmiesany');
      setFGroupId('');
      setFMeters('');
      setFNotes('');
      setDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tréningy</h1>
          <p className="text-muted-foreground mt-1">Prehľad a tvorba tréningov</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nový tréning
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Nový tréning</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Názov tréningu</Label>
                <Input value={fTitle} onChange={(e) => setFTitle(e.target.value)} placeholder="Napr. Ranný tréning" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Dátum</Label>
                  <Input type="date" value={fDate} onChange={(e) => setFDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Typ</Label>
                  <Select value={fType} onValueChange={setFType}>
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
                  <Select value={fGroupId} onValueChange={setFGroupId}>
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
                  <Input type="number" value={fMeters} onChange={(e) => setFMeters(e.target.value)} placeholder="3000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Poznámky</Label>
                <Textarea value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Voliteľné poznámky..." />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Ukladanie...' : 'Vytvoriť tréning'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : workouts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadne tréningy</h3>
            <p className="text-muted-foreground mb-4">
              Vytvorte prvý tréning pre váš klub
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Vytvoriť tréning
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {workouts.map((w) => (
            <Card key={w.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{w.title || 'Bez názvu'}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <span>{format(new Date(w.workout_date), 'd. MMMM yyyy', { locale: sk })}</span>
                      <span className="text-border">|</span>
                      <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {WORKOUT_TYPE_LABELS[w.type] || w.type}
                      </span>
                      {w.group && (
                        <>
                          <span className="text-border">|</span>
                          <span>{w.group.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {w.total_meters > 0 && (
                    <span className="text-sm font-semibold text-primary">{w.total_meters}m</span>
                  )}
                </div>
                {w.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{w.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
