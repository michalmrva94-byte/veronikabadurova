import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Group, Swimmer } from '@/types/swimdesk';
import { CATEGORY_LABELS, GENDER_LABELS } from '@/lib/sd-constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SDGroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [swimmers, setSwimmers] = useState<Swimmer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      const { data: groupData } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      setGroup(groupData as Group | null);

      const { data: swimmerData } = await supabase
        .from('swimmers')
        .select('*')
        .eq('group_id', id)
        .order('last_name');

      setSwimmers((swimmerData || []) as Swimmer[]);
      setLoading(false);
    };

    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!group) {
    return <p className="text-center py-12 text-muted-foreground">Skupina nenájdená</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/skupiny"><ArrowLeft className="w-4 h-4 mr-1" /> Späť</Link>
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">{group.name}</h1>
        {group.category && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {CATEGORY_LABELS[group.category] || group.category}
          </span>
        )}
      </div>

      {swimmers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadni plavci v tejto skupine</h3>
            <p className="text-muted-foreground mb-4">
              Pridajte plavcov cez sekciu Plavci
            </p>
            <Button asChild>
              <Link to="/plavci">Prejsť na Plavcov</Link>
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
                <TableHead>Pohlavie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {swimmers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">
                    <Link to={`/plavci/${s.id}`} className="text-primary hover:underline">
                      {s.last_name} {s.first_name}
                    </Link>
                  </TableCell>
                  <TableCell>{s.birth_year || '—'}</TableCell>
                  <TableCell>{s.gender ? GENDER_LABELS[s.gender] : '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
