import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar, Trophy, Plus } from 'lucide-react';

export default function SDDashboardPage() {
  const { profile, club } = useSDAuth();
  const [swimmerCount, setSwimmerCount] = useState(0);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [nearLimitCount, setNearLimitCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!club?.id) return;

    const fetchStats = async () => {
      // Count swimmers
      const { count: sc } = await supabase
        .from('swimmers')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', club.id);
      setSwimmerCount(sc || 0);

      // Count workouts this week
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { count: wc } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('club_id', club.id)
        .gte('workout_date', startOfWeek.toISOString().slice(0, 10))
        .lte('workout_date', endOfWeek.toISOString().slice(0, 10));
      setWorkoutCount(wc || 0);

      // Count swimmers near limit (within 2 seconds)
      // This is a simplified check - count personal records that are within 2s of any SZPS limit
      const { data: records } = await supabase
        .from('personal_records')
        .select('swimmer_id, discipline_id, time_seconds')
        .in('swimmer_id', (await supabase
          .from('swimmers')
          .select('id')
          .eq('club_id', club.id)).data?.map(s => s.id) || []);

      if (records && records.length > 0) {
        const { data: limits } = await supabase
          .from('szps_limits')
          .select('discipline_id, time_seconds');

        if (limits) {
          const limitMap = new Map<string, number>();
          limits.forEach(l => {
            const existing = limitMap.get(l.discipline_id);
            if (!existing || l.time_seconds < existing) {
              limitMap.set(l.discipline_id, Number(l.time_seconds));
            }
          });

          const nearSwimmers = new Set<string>();
          records.forEach(r => {
            const limitTime = limitMap.get(r.discipline_id);
            if (limitTime && Number(r.time_seconds) - limitTime < 2 && Number(r.time_seconds) >= limitTime) {
              nearSwimmers.add(r.swimmer_id);
            }
          });
          setNearLimitCount(nearSwimmers.size);
        }
      }

      setLoading(false);
    };

    fetchStats();
  }, [club?.id]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dobré ráno';
    if (hour < 18) return 'Dobrý deň';
    return 'Dobrý večer';
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          {greeting()}, {profile?.first_name}
        </h1>
        <p className="text-muted-foreground mt-1">
          Prehľad vášho plaveckého klubu
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Počet plavcov</p>
              <p className="text-2xl font-bold">{loading ? '—' : swimmerCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tréningy tento týždeň</p>
              <p className="text-2xl font-bold">{loading ? '—' : workoutCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="p-3 rounded-xl bg-warning/10">
              <Trophy className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plavci blízko limitu</p>
              <p className="text-2xl font-bold">{loading ? '—' : nearLimitCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions / Empty states */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {swimmerCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Zatiaľ žiadni plavci</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Začnite pridaním plavcov do vášho klubu
              </p>
              <Button asChild>
                <Link to={SD_ROUTES.SWIMMERS}>
                  <Plus className="w-4 h-4 mr-2" />
                  Pridať plavcov
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {workoutCount === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="w-10 h-10 text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">Žiadne tréningy tento týždeň</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Vytvorte tréning pre vašu skupinu
              </p>
              <Button asChild>
                <Link to={SD_ROUTES.WORKOUTS}>
                  <Plus className="w-4 h-4 mr-2" />
                  Vytvoriť tréning
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
