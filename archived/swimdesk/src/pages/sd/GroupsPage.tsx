import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Group } from '@/types/swimdesk';
import { CATEGORY_LABELS } from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SDGroupsPage() {
  const { club, profile } = useSDAuth();
  const [groups, setGroups] = useState<(Group & { swimmers_count: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchGroups = async () => {
    if (!club?.id) return;

    const { data: groupsData, error } = await supabase
      .from('groups')
      .select('*')
      .eq('club_id', club.id)
      .order('name');

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    // Get swimmer counts per group
    const groupsWithCounts = await Promise.all(
      (groupsData || []).map(async (g) => {
        const { count } = await supabase
          .from('swimmers')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', g.id);
        return { ...g, swimmers_count: count || 0 } as Group & { swimmers_count: number };
      })
    );

    setGroups(groupsWithCounts);
    setLoading(false);
  };

  useEffect(() => {
    fetchGroups();
  }, [club?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club?.id || !profile?.id) return;
    setSaving(true);

    const { error } = await supabase.from('groups').insert({
      club_id: club.id,
      name: newName,
      category: newCategory || null,
      coach_id: profile.id,
    });

    if (error) {
      toast({ title: 'Chyba', description: 'Nepodarilo sa vytvoriť skupinu.', variant: 'destructive' });
    } else {
      toast({ title: 'Skupina vytvorená' });
      setNewName('');
      setNewCategory('');
      setDialogOpen(false);
      fetchGroups();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skupiny</h1>
          <p className="text-muted-foreground mt-1">Správa tréningových skupín</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nová skupina
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nová skupina</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupName">Názov skupiny</Label>
                <Input
                  id="groupName"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Napr. Skupina A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Kategória</Label>
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte kategóriu" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? 'Vytváranie...' : 'Vytvoriť skupinu'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : groups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadne skupiny</h3>
            <p className="text-muted-foreground mb-4">
              Začnite vytvorením prvej tréningovej skupiny
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Vytvoriť skupinu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Link key={group.id} to={`/skupiny/${group.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      {group.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                          {CATEGORY_LABELS[group.category] || group.category}
                        </span>
                      )}
                      <p className="text-sm text-muted-foreground mt-2">
                        {group.swimmers_count} {group.swimmers_count === 1 ? 'plavec' : group.swimmers_count < 5 ? 'plavci' : 'plavcov'}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
