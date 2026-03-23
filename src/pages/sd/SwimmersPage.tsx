import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, Group } from '@/types/swimdesk';
import { GENDER_LABELS } from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, User, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SDSwimmersPage() {
  const { club } = useSDAuth();
  const [swimmers, setSwimmers] = useState<(Swimmer & { group?: Group })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Form state
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formBirthYear, setFormBirthYear] = useState('');
  const [formGender, setFormGender] = useState('');
  const [formGroupId, setFormGroupId] = useState('');

  const fetchData = async () => {
    if (!club?.id) return;

    const [swRes, grRes] = await Promise.all([
      supabase.from('swimmers').select('*').eq('club_id', club.id).order('last_name'),
      supabase.from('groups').select('*').eq('club_id', club.id).order('name'),
    ]);

    const groupMap = new Map<string, Group>();
    (grRes.data || []).forEach((g) => groupMap.set(g.id, g as Group));

    setGroups((grRes.data || []) as Group[]);
    setSwimmers(
      (swRes.data || []).map((s) => ({
        ...s,
        group: s.group_id ? groupMap.get(s.group_id) : undefined,
      })) as (Swimmer & { group?: Group })[]
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [club?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club?.id) return;
    setSaving(true);

    const { error } = await supabase.from('swimmers').insert({
      club_id: club.id,
      first_name: formFirstName,
      last_name: formLastName,
      birth_year: formBirthYear ? parseInt(formBirthYear) : null,
      gender: formGender || null,
      group_id: formGroupId || null,
    });

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa pridať plavca.', variant: 'destructive' });
    } else {
      toast({ title: 'Plavec pridaný' });
      setFormFirstName('');
      setFormLastName('');
      setFormBirthYear('');
      setFormGender('');
      setFormGroupId('');
      setDialogOpen(false);
      fetchData();
    }
    setSaving(false);
  };

  const filtered = swimmers.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.group?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plavci</h1>
          <p className="text-muted-foreground mt-1">Zoznam všetkých plavcov v klube</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Pridať plavca
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nový plavec</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meno</Label>
                  <Input value={formFirstName} onChange={(e) => setFormFirstName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Priezvisko</Label>
                  <Input value={formLastName} onChange={(e) => setFormLastName(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ročník narodenia</Label>
                  <Input
                    type="number"
                    value={formBirthYear}
                    onChange={(e) => setFormBirthYear(e.target.value)}
                    placeholder="2012"
                    min={2000}
                    max={2025}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pohlavie</Label>
                  <Select value={formGender} onValueChange={setFormGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Chlapec</SelectItem>
                      <SelectItem value="F">Dievča</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Skupina</Label>
                <Select value={formGroupId} onValueChange={setFormGroupId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte skupinu (voliteľné)" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Ukladanie...' : 'Pridať plavca'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Hľadať plavca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : swimmers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadni plavci</h3>
            <p className="text-muted-foreground mb-4">
              Pridajte prvého plavca do klubu
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Pridať plavca
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Meno</TableHead>
                <TableHead>Ročník</TableHead>
                <TableHead>Skupina</TableHead>
                <TableHead>Pohlavie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.last_name} {s.first_name}</TableCell>
                  <TableCell>{s.birth_year || '—'}</TableCell>
                  <TableCell>
                    {s.group ? (
                      <Link to={`/skupiny/${s.group_id}`} className="text-primary hover:underline">
                        {s.group.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{s.gender ? GENDER_LABELS[s.gender] : '—'}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Žiadne výsledky pre "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
