import { useState } from 'react';
import SDLayout from '@/components/layout/SDLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Users, Trophy, TrendingUp, Plus, Printer, ChevronRight, Sparkles,
  Calendar, Activity, Brain, Lightbulb, AlertTriangle, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  CATEGORY_LABELS, COMPETITION_LABELS, CATEGORY_SHORT_LABELS,
  formatTime, formatGap,
} from '@/lib/sd-constants';

// Mock data
const mockSwimmers = [
  { id: '1', first_name: 'Tomáš', last_name: 'Kováč', birth_year: 2012, gender: 'M', group_name: 'Skupina A' },
  { id: '2', first_name: 'Laura', last_name: 'Nováková', birth_year: 2013, gender: 'F', group_name: 'Skupina A' },
  { id: '3', first_name: 'Marek', last_name: 'Horváth', birth_year: 2012, gender: 'M', group_name: 'Skupina B' },
  { id: '4', first_name: 'Nina', last_name: 'Svobodová', birth_year: 2013, gender: 'F', group_name: 'Skupina A' },
  { id: '5', first_name: 'Jakub', last_name: 'Varga', birth_year: 2011, gender: 'M', group_name: 'Skupina B' },
];

const mockDiscs = ['50 VS', '100 VS', '200 VS', '50 Znak', '100 Prsia', '200 PH'];
const mockLimitMatrix = [
  ['✓ −0.3s', '−1.2s', '−3.8s', '✓ −0.1s', '—', '−5.2s'],
  ['−0.8s', '✓ −0.5s', '—', '−2.1s', '−1.0s', '—'],
  ['✓ −1.1s', '−0.4s', '−2.5s', '—', '✓ −0.2s', '−4.1s'],
  ['—', '−1.8s', '✓ −0.6s', '−3.2s', '—', '−6.0s'],
  ['✓ −0.2s', '✓ −0.9s', '−1.3s', '−0.7s', '−2.4s', '−3.5s'],
];

const mockPRs = [
  { disc: '50m voľný štýl', time: 28.45, date: '2026-04-15', pool: '25m', comp: 'Veľká cena BA', limit: 28.10, status: 'blizko' },
  { disc: '100m voľný štýl', time: 62.30, date: '2026-03-22', pool: '25m', comp: 'MSR žiakov', limit: 61.50, status: 'blizko' },
  { disc: '200m voľný štýl', time: 138.92, date: '2026-02-10', pool: '50m', comp: 'Zimné MSR', limit: 135.00, status: 'daleko' },
  { disc: '50m znak', time: 33.10, date: '2026-04-20', pool: '25m', comp: 'Veľká cena BA', limit: 33.20, status: 'splneny' },
  { disc: '100m prsia', time: 78.44, date: '2026-01-18', pool: '25m', comp: 'Zimné MSR', limit: null, status: 'none' },
];

const mockWeeklyPlan = {
  analysis: { gap_seconds: 0.8, feasibility: 'realisticky', key_focus: 'Zlepšenie obrátky a techniky záverečného úseku' },
  periodization: [
    { name: 'Základná príprava', weeks: 3, focus: 'Aeróbna kapacita a technika' },
    { name: 'Špecifická príprava', weeks: 3, focus: 'Rýchlostná vytrvalosť a preteková rýchlosť' },
    { name: 'Záverečná fáza', weeks: 2, focus: 'Pretekový tréning a tapering' },
  ],
  weekly_plans: [
    {
      week: 1, phase: 'Základná príprava', theme: 'Budovanie aeróbnej základne', total_meters: 12000,
      trainings: [
        {
          day: 'Pondelok', type: 'vytrvalost', title: 'Aeróbna vytrvalosť VS', total_meters: 3000,
          sets: [
            { phase: 'rozcvicka', description: '4×100 VS striedavo kraul/znak, pauza 15s', meters: 400, intensity: 'nizka' },
            { phase: 'hlavna', description: '8×200 VS na 3:00, tempo 75%, dýchanie na 3', meters: 1600, intensity: 'stredna' },
            { phase: 'hlavna', description: '4×100 nohy VS s doskou, pauza 20s', meters: 400, intensity: 'stredna' },
            { phase: 'upokojenie', description: '6×100 ľubovoľný, voľné tempo', meters: 600, intensity: 'nizka' },
          ],
        },
        {
          day: 'Streda', type: 'technika', title: 'Technika obrátok a štartov', total_meters: 2800,
          sets: [
            { phase: 'rozcvicka', description: '300 VS + 200 Znak voľné tempo', meters: 500, intensity: 'nizka' },
            { phase: 'hlavna', description: '12×50 VS s dôrazom na obrátku, pauza 30s', meters: 600, intensity: 'vysoka' },
            { phase: 'hlavna', description: '6×150 VS — posledných 50m sprint', meters: 900, intensity: 'stredna' },
            { phase: 'upokojenie', description: '4×200 polohový, voľné tempo', meters: 800, intensity: 'nizka' },
          ],
        },
      ],
    },
  ],
};

const phaseColors = ['border-blue-500', 'border-orange-500', 'border-green-500'];
const phaseBg = ['bg-blue-500/10', 'bg-orange-500/10', 'bg-green-500/10'];
const intensityColors: Record<string, string> = { nizka: 'text-green-500', stredna: 'text-yellow-500', vysoka: 'text-red-500' };
const statusConfig: Record<string, { color: string; label: string }> = {
  splneny: { color: 'bg-green-100 text-green-700', label: '✓ Splnený' },
  blizko: { color: 'bg-yellow-100 text-yellow-700', label: '⚡ Blízko' },
  daleko: { color: 'bg-gray-100 text-gray-600', label: '→ Ďaleko' },
  none: { color: 'bg-gray-50 text-gray-400', label: '— Bez limitu' },
};

type DemoPage = 'dashboard' | 'swimmers' | 'swimmer-detail' | 'groups' | 'limits' | 'workouts' | 'plans' | 'settings';

export default function DemoShowcase() {
  const [page, setPage] = useState<DemoPage>('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DemoDashboard />;
      case 'swimmers': return <DemoSwimmers onSwimmerClick={() => setPage('swimmer-detail')} />;
      case 'swimmer-detail': return <DemoSwimmerDetail />;
      case 'groups': return <DemoGroups />;
      case 'limits': return <DemoLimits />;
      case 'workouts': return <DemoWorkouts />;
      case 'plans': return <DemoPlans />;
      case 'settings': return <DemoSettings />;
      default: return <DemoDashboard />;
    }
  };

  return (
    <SDLayout demoPageSetter={setPage}>
      {renderPage()}
    </SDLayout>
  );
}

function DemoDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dobré popoludnie, Michal!</h1>
        <p className="text-muted-foreground mt-1">Prehľad vášho klubu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Počet plavcov</p>
                <p className="text-3xl font-bold mt-1">24</p>
              </div>
              <Users className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tréningy tento týždeň</p>
                <p className="text-3xl font-bold mt-1">8</p>
              </div>
              <Calendar className="w-8 h-8 text-primary/60" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plavci blízko limitu</p>
                <p className="text-3xl font-bold mt-1 text-yellow-500">5</p>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Najbližšie k limitu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Jakub Varga', disc: '50m VS', gap: '−0.2s' },
              { name: 'Tomáš Kováč', disc: '50m Znak', gap: '−0.3s' },
              { name: 'Marek Horváth', disc: '100m Prsia', gap: '−0.4s' },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.disc}</p>
                </div>
                <span className="text-sm font-mono text-yellow-500 font-medium">{s.gap}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI Odporúčanie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { type: 'upozornenie', icon: AlertTriangle, color: 'text-yellow-500', msg: 'Jakub Varga (50m VS) je len 0.2s od limitu MSR — zvážte zaradenie rýchlostných sérií do tréningov.' },
              { type: 'odporucanie', icon: Lightbulb, color: 'text-blue-500', msg: 'Laura Nováková vykazuje stabilný progres v 100m VS. Odporúčam udržať aktuálny tréningový plán.' },
              { type: 'trend', icon: TrendingUp, color: 'text-green-500', msg: '3 plavci zlepšili osobné rekordy za posledných 30 dní — klub je v dobrej forme.' },
            ].map((insight, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-muted/30 rounded-lg">
                <insight.icon className={`w-5 h-5 ${insight.color} mt-0.5 shrink-0`} />
                <p className="text-sm">{insight.msg}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoSwimmers({ onSwimmerClick }: { onSwimmerClick?: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Plavci</h1>
          <p className="text-muted-foreground mt-1">Zoznam všetkých plavcov v klube</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Pridať plavca</Button>
      </div>

      <Input placeholder="Hľadať podľa mena..." className="max-w-sm" />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-3 px-4">Meno</th>
              <th className="text-left py-3 px-4">Ročník</th>
              <th className="text-left py-3 px-4">Skupina</th>
              <th className="text-left py-3 px-4">Pohlavie</th>
            </tr>
          </thead>
          <tbody>
            {mockSwimmers.map(s => (
              <tr key={s.id} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={onSwimmerClick}>
                <td className="py-3 px-4 font-medium text-primary hover:underline">{s.last_name} {s.first_name}</td>
                <td className="py-3 px-4">{s.birth_year}</td>
                <td className="py-3 px-4">{s.group_name}</td>
                <td className="py-3 px-4">{s.gender === 'M' ? 'Chlapec' : 'Dievča'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DemoSwimmerDetail() {
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground mb-1">← Späť na plavcov</p>
        <h1 className="text-2xl font-bold">Tomáš Kováč</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="p-5 space-y-3">
            <div><span className="text-sm text-muted-foreground">Ročník</span><p className="font-medium">2012</p></div>
            <div><span className="text-sm text-muted-foreground">Kategória</span>
              <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">Starší žiaci U14</span>
            </div>
            <div><span className="text-sm text-muted-foreground">Skupina</span><p className="font-medium">Skupina A</p></div>
            <div><span className="text-sm text-muted-foreground">Pohlavie</span><p className="font-medium">Chlapec</p></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Osobné rekordy</CardTitle>
              <Button size="sm"><Plus className="w-4 h-4 mr-1" />Pridať PR</Button>
            </div>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left py-2 px-3">Disciplína</th>
                  <th className="text-left py-2 px-3">PR</th>
                  <th className="text-left py-2 px-3">Dátum</th>
                  <th className="text-left py-2 px-3">Bazén</th>
                  <th className="text-left py-2 px-3">Gap</th>
                  <th className="text-left py-2 px-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockPRs.map((pr, i) => (
                  <tr key={i} className="border-b border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
                    <td className="py-2 px-3 font-medium flex items-center gap-1">
                      {expanded === i ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {pr.disc}
                    </td>
                    <td className="py-2 px-3 font-mono">{formatTime(pr.time)}</td>
                    <td className="py-2 px-3">{pr.date}</td>
                    <td className="py-2 px-3">{pr.pool}</td>
                    <td className="py-2 px-3 font-mono">
                      {pr.limit ? (pr.time <= pr.limit ? `✓ ${(pr.limit - pr.time).toFixed(2)}s` : `−${(pr.time - pr.limit).toFixed(2)}s`) : '—'}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[pr.status].color}`}>
                        {statusConfig[pr.status].label}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DemoGroups() {
  const groups = [
    { name: 'Skupina A', category: 'starsiziaci', count: 12 },
    { name: 'Skupina B', category: 'mladsizaci', count: 8 },
    { name: 'Pretekári', category: 'dorast', count: 4 },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Skupiny</h1>
          <p className="text-muted-foreground mt-1">Správa tréningových skupín</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nová skupina</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map((g, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{g.name}</h3>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {CATEGORY_LABELS[g.category]}
                  </span>
                  <p className="text-sm text-muted-foreground mt-2">
                    {g.count} {g.count < 5 ? 'plavci' : 'plavcov'}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoLimits() {
  const gapColor = (cell: string) => {
    if (cell.startsWith('✓')) return 'text-[#10b478] font-medium';
    if (cell === '—') return 'text-muted-foreground/40';
    const num = parseFloat(cell.replace('−', '').replace('s', ''));
    if (num <= 1.0) return 'text-[#f4a300] font-medium';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Limity SZPS</h1>
          <p className="text-muted-foreground mt-1">Prehľad výkonov voči federačným limitom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Plus className="w-4 h-4 mr-1" />Hromadný import</Button>
          <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" />Exportovať PDF</Button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <Select defaultValue="a">
          <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="a">Skupina A</SelectItem>
            <SelectItem value="b">Skupina B</SelectItem>
          </SelectContent>
        </Select>
        <Tabs defaultValue="MSR_ziaci">
          <TabsList>
            {Object.entries(COMPETITION_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">{label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-2 px-3 sticky left-0 bg-background z-10 min-w-[160px]">Meno</th>
              <th className="text-left py-2 px-2 min-w-[70px]">Kat.</th>
              {mockDiscs.map(d => (
                <th key={d} className="text-center py-2 px-2 min-w-[90px]">
                  <div className="text-xs font-semibold">{d}</div>
                  <div className="text-[10px] text-muted-foreground font-normal">{formatTime(28 + Math.random() * 10)}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSwimmers.map((sw, si) => (
              <tr key={sw.id} className="border-b border-border hover:bg-muted/30">
                <td className="py-2 px-3 sticky left-0 bg-background z-10 font-medium text-primary">{sw.last_name} {sw.first_name}</td>
                <td className="py-2 px-2 text-xs text-muted-foreground">SŽ U14</td>
                {mockLimitMatrix[si].map((cell, ci) => (
                  <td key={ci} className={`py-2 px-2 text-center text-xs font-mono ${gapColor(cell)}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-muted-foreground pt-2 border-t">
        <span className="font-medium text-foreground">3</span> plavcov splnilo aspoň 1 limit · <span className="font-medium text-foreground">7</span> disciplín splnených celkom
      </div>
    </div>
  );
}

function DemoWorkouts() {
  const workouts = [
    { title: 'Aeróbna vytrvalosť VS', date: '2026-05-05', type: 'vytrvalost', group: 'Skupina A', meters: 3200 },
    { title: 'Rýchlostné série', date: '2026-05-03', type: 'rychlost', group: 'Skupina A', meters: 2800 },
    { title: 'Technika obrátok', date: '2026-05-01', type: 'technika', group: 'Skupina B', meters: 2400 },
    { title: 'Príprava na preteky', date: '2026-04-28', type: 'zavod', group: 'Pretekári', meters: 3600 },
  ];
  const typeColors: Record<string, string> = { vytrvalost: 'bg-blue-100 text-blue-700', rychlost: 'bg-red-100 text-red-700', technika: 'bg-green-100 text-green-700', zavod: 'bg-purple-100 text-purple-700' };
  const typeLabels: Record<string, string> = { vytrvalost: 'Vytrvalosť', rychlost: 'Rýchlosť', technika: 'Technika', zavod: 'Závod' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tréningy</h1>
          <p className="text-muted-foreground mt-1">Prehľad tréningov</p>
        </div>
        <Button><Plus className="w-4 h-4 mr-2" />Nový tréning</Button>
      </div>
      <div className="space-y-3">
        {workouts.map((w, i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow cursor-pointer">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[50px]">
                  <p className="text-xs text-muted-foreground">{new Date(w.date).toLocaleDateString('sk', { month: 'short' })}</p>
                  <p className="text-lg font-bold">{new Date(w.date).getDate()}</p>
                </div>
                <div>
                  <h3 className="font-medium">{w.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[w.type]}`}>{typeLabels[w.type]}</span>
                    <span className="text-xs text-muted-foreground">{w.group}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono font-medium">{w.meters.toLocaleString()}m</p>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function DemoPlans() {
  const plan = mockWeeklyPlan;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Tréningový plán
        </h1>
        <p className="text-muted-foreground mt-1">Generovanie periodizovaných plánov pomocou AI</p>
      </div>

      {/* Analysis */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Analýza</h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Realistický cieľ</span>
          </div>
          <p className="text-sm">Gap: <span className="font-mono font-medium">0.80s</span> · {plan.analysis.key_focus}</p>
        </CardContent>
      </Card>

      {/* Periodization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plan.periodization.map((phase, i) => (
          <Card key={i} className={`border-l-4 ${phaseColors[i]}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">Fáza {i + 1} · {phase.weeks} týždne</p>
              <h4 className="font-semibold">{phase.name}</h4>
              <p className="text-sm text-muted-foreground mt-1">{phase.focus}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly plan */}
      {plan.weekly_plans.map((week) => (
        <Card key={week.week}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Týždeň {week.week}: {week.theme}
              </CardTitle>
              <span className="text-sm font-mono text-muted-foreground">{week.total_meters.toLocaleString()}m</span>
            </div>
            <p className="text-xs text-muted-foreground">{week.phase}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {week.trainings.map((training, ti) => (
              <div key={ti} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-xs font-medium text-primary">{training.day}</span>
                    <h4 className="font-medium">{training.title}</h4>
                  </div>
                  <span className="text-sm font-mono">{training.total_meters}m</span>
                </div>
                <div className="space-y-2">
                  {training.sets.map((set, si) => (
                    <div key={si} className={`flex items-start gap-3 p-2 rounded text-sm ${
                      set.phase === 'rozcvicka' ? 'bg-blue-50/50' : set.phase === 'hlavna' ? 'bg-orange-50/50' : 'bg-green-50/50'
                    }`}>
                      <span className={`text-xs font-medium mt-0.5 ${intensityColors[set.intensity]}`}>
                        {set.meters}m
                      </span>
                      <span>{set.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function DemoSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nastavenia</h1>
        <p className="text-muted-foreground mt-1">Nastavenia klubu a účtu</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Informácie o klube</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm text-muted-foreground">Názov klubu</Label>
            <p className="font-medium text-lg">PK Bratislava</p>
          </div>
          <div>
            <Label className="text-sm text-muted-foreground">Pozvánka pre trénerov</Label>
            <div className="flex gap-2 mt-1">
              <Input readOnly value="https://swimdesk.app/invite/abc123" className="font-mono text-sm" />
              <Button variant="outline" size="sm">Kopírovať</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
