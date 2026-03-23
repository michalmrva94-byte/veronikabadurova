import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SzpsLimit, Discipline } from '@/types/swimdesk';
import { STROKE_LABELS, COMPETITION_LABELS, CATEGORY_LABELS, GENDER_LABELS, formatTime } from '@/lib/sd-constants';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy } from 'lucide-react';

export default function SDLimitsPage() {
  const [limits, setLimits] = useState<(SzpsLimit & { discipline: Discipline })[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterGender, setFilterGender] = useState<string>('M');
  const [filterCompetition, setFilterCompetition] = useState<string>('MSR_ziaci');

  useEffect(() => {
    const fetchLimits = async () => {
      const { data: limitsData } = await supabase
        .from('szps_limits')
        .select('*');

      const { data: discData } = await supabase
        .from('disciplines')
        .select('*');

      if (!limitsData || !discData) {
        setLoading(false);
        return;
      }

      const discMap = new Map<string, Discipline>();
      discData.forEach((d) => discMap.set(d.id, d as Discipline));

      const combined = limitsData.map((l) => ({
        ...l,
        discipline: discMap.get(l.discipline_id)!,
      })) as (SzpsLimit & { discipline: Discipline })[];

      setLimits(combined);
      setLoading(false);
    };

    fetchLimits();
  }, []);

  const filtered = limits.filter(
    (l) => l.gender === filterGender && l.competition === filterCompetition
  );

  // Group by stroke
  const byStroke = new Map<string, typeof filtered>();
  filtered.forEach((l) => {
    if (!l.discipline) return;
    const stroke = l.discipline.stroke;
    if (!byStroke.has(stroke)) byStroke.set(stroke, []);
    byStroke.get(stroke)!.push(l);
  });

  // Sort within each stroke by distance
  byStroke.forEach((arr) => arr.sort((a, b) => a.discipline.distance - b.discipline.distance));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Limity SZPS</h1>
        <p className="text-muted-foreground mt-1">Federačné limity Slovenského zväzu plávania</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={filterGender} onValueChange={setFilterGender}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="M">Chlapci</SelectItem>
            <SelectItem value="F">Dievčatá</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCompetition} onValueChange={setFilterCompetition}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(COMPETITION_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Žiadne limity</h3>
            <p className="text-muted-foreground">
              Pre zvolenú kombináciu nie sú dostupné limity
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(byStroke.entries()).map(([stroke, items]) => (
            <div key={stroke}>
              <h3 className="font-semibold text-lg mb-2">{STROKE_LABELS[stroke] || stroke}</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Disciplína</TableHead>
                      <TableHead>Bazén</TableHead>
                      <TableHead>Kategória</TableHead>
                      <TableHead className="text-right">Limit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">{l.discipline.name}</TableCell>
                        <TableCell>{l.discipline.pool_size}m</TableCell>
                        <TableCell>{CATEGORY_LABELS[l.category] || l.category}</TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          {formatTime(Number(l.time_seconds))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
