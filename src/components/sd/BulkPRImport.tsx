import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Swimmer, Discipline } from '@/types/swimdesk';
import { parseTimeInput, formatTime, IMPORT_CODE_MAP } from '@/lib/sd-constants';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Props {
  swimmers: Swimmer[];
  disciplines: Discipline[];
  onImported: () => void;
}

interface ParsedRow {
  raw: string;
  swimmerName: string;
  discCode: string;
  timeStr: string;
  dateStr: string;
  poolStr: string;
  // resolved
  swimmer: Swimmer | null;
  discipline: Discipline | null;
  timeSeconds: number | null;
  poolSize: number | null;
  valid: boolean;
  error?: string;
}

function fuzzyMatchSwimmer(name: string, swimmers: Swimmer[]): Swimmer | null {
  const normalized = name.trim().toLowerCase();
  // Try exact first+last or last+first
  for (const s of swimmers) {
    const fl = `${s.first_name} ${s.last_name}`.toLowerCase();
    const lf = `${s.last_name} ${s.first_name}`.toLowerCase();
    if (normalized === fl || normalized === lf) return s;
  }
  // Try partial match
  for (const s of swimmers) {
    const fl = `${s.first_name} ${s.last_name}`.toLowerCase();
    const lf = `${s.last_name} ${s.first_name}`.toLowerCase();
    if (fl.includes(normalized) || lf.includes(normalized) || normalized.includes(fl) || normalized.includes(lf)) return s;
  }
  return null;
}

export default function BulkPRImport({ swimmers, disciplines, onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const discByCode = useMemo(() => {
    const map = new Map<string, Discipline>();
    disciplines.forEach(d => map.set(d.code.toLowerCase(), d));
    return map;
  }, [disciplines]);

  const parsed = useMemo((): ParsedRow[] => {
    if (!text.trim()) return [];
    return text.trim().split('\n').map(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) {
        return { raw: line, swimmerName: '', discCode: '', timeStr: '', dateStr: '', poolStr: '', swimmer: null, discipline: null, timeSeconds: null, poolSize: null, valid: false, error: 'Neplatný formát riadku' };
      }

      const [swimmerName, discCodeRaw, timeStr, dateStr = '', poolStr = ''] = parts;

      // Match swimmer
      const swimmer = fuzzyMatchSwimmer(swimmerName, swimmers);

      // Match discipline
      const codeNormalized = discCodeRaw.toLowerCase().replace(/\s/g, '');
      const mappedCode = IMPORT_CODE_MAP[codeNormalized];
      const discipline = mappedCode
        ? discByCode.get(mappedCode.toLowerCase()) || null
        : discByCode.get(codeNormalized) || null;

      // Parse time
      const timeSeconds = parseTimeInput(timeStr);

      // Parse pool
      const poolMatch = poolStr.match(/(\d+)/);
      const poolSize = poolMatch ? parseInt(poolMatch[1]) : (discipline?.pool_size || 25);

      // Parse date
      const finalDate = dateStr || new Date().toISOString().slice(0, 10);

      const valid = !!swimmer && !!discipline && timeSeconds != null;
      const error = !swimmer ? 'Plavec nenájdený' : !discipline ? 'Disciplína nenájdená' : timeSeconds == null ? 'Neplatný čas' : undefined;

      return {
        raw: line,
        swimmerName,
        discCode: discCodeRaw,
        timeStr,
        dateStr: finalDate,
        poolStr,
        swimmer,
        discipline,
        timeSeconds,
        poolSize,
        valid,
        error,
      };
    });
  }, [text, swimmers, discByCode]);

  const validRows = parsed.filter(r => r.valid);
  const invalidRows = parsed.filter(r => !r.valid);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setSaving(true);

    const inserts = validRows.map(r => ({
      swimmer_id: r.swimmer!.id,
      discipline_id: r.discipline!.id,
      time_seconds: r.timeSeconds!,
      recorded_at: r.dateStr,
      pool_size: r.poolSize!,
      competition_name: null,
    }));

    const { error } = await supabase.from('personal_records').insert(inserts);

    if (error) {
      toast({ title: 'Chyba', description: 'Import sa nepodaril.', variant: 'destructive' });
    } else {
      toast({ title: `Importovaných ${validRows.length} výsledkov`, description: invalidRows.length > 0 ? `${invalidRows.length} nezhodných riadkov` : undefined });
      setText('');
      setStep('input');
      setOpen(false);
      onImported();
    }
    setSaving(false);
  };

  const handleReset = () => {
    setText('');
    setStep('input');
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleReset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="w-4 h-4 mr-1" />
          Importovať výsledky
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Hromadný import výsledkov</DialogTitle>
        </DialogHeader>

        {step === 'input' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vložte výsledky vo formáte: <code className="bg-muted px-1 rounded">Meno Priezvisko | kód disciplíny | čas | dátum | bazén</code>
            </p>
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Hugo Babiak | 100z25 | 1:12.34 | 2026-03-01 | 25m\nAlexandra Štefušová | 50vs25 | 32.04 | 2026-03-01 | 25m`}
              rows={8}
              className="font-mono text-sm"
            />
            <Button onClick={() => setStep('preview')} disabled={!text.trim()}>
              Náhľad importu
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-3 text-sm">
              <span className="text-[#10b478] font-medium"><Check className="w-4 h-4 inline mr-1" />{validRows.length} platných</span>
              {invalidRows.length > 0 && (
                <span className="text-destructive font-medium"><AlertCircle className="w-4 h-4 inline mr-1" />{invalidRows.length} chybných</span>
              )}
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Plavec</TableHead>
                    <TableHead>Disciplína</TableHead>
                    <TableHead>Čas</TableHead>
                    <TableHead>Dátum</TableHead>
                    <TableHead>Bazén</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parsed.map((r, i) => (
                    <TableRow key={i} className={r.valid ? '' : 'bg-destructive/5'}>
                      <TableCell>
                        {r.valid ? <Check className="w-4 h-4 text-[#10b478]" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.swimmer ? `${r.swimmer.first_name} ${r.swimmer.last_name}` : <span className="text-destructive">{r.swimmerName} ({r.error})</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.discipline ? r.discipline.name : <span className="text-destructive">{r.discCode}</span>}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {r.timeSeconds != null ? formatTime(r.timeSeconds) : <span className="text-destructive">{r.timeStr}</span>}
                      </TableCell>
                      <TableCell className="text-sm">{r.dateStr}</TableCell>
                      <TableCell className="text-sm">{r.poolSize ? `${r.poolSize}m` : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleImport} disabled={saving || validRows.length === 0}>
                {saving ? 'Importujem...' : `Importovať ${validRows.length} výsledkov`}
              </Button>
              <Button variant="ghost" onClick={() => setStep('input')}>Späť</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
