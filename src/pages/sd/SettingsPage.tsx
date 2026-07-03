import { useState, useEffect } from 'react';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Pencil, Save, X, Shield, User, Lock, Users } from 'lucide-react';
import { SDProfile } from '@/types/swimdesk';

export default function SDSettingsPage() {
  const { user, club, profile, isAdmin, refreshProfile } = useSDAuth();
  const { toast } = useToast();

  // Invite link
  const [copied, setCopied] = useState(false);

  // Club name editing
  const [editingClubName, setEditingClubName] = useState(false);
  const [clubNameValue, setClubNameValue] = useState('');
  const [savingClubName, setSavingClubName] = useState(false);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password change
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Club coaches
  const [coaches, setCoaches] = useState<SDProfile[]>([]);
  const [coachEmails, setCoachEmails] = useState<Record<string, string>>({});
  const [loadingCoaches, setLoadingCoaches] = useState(false);

  // Sync local state when context data changes
  useEffect(() => {
    if (club) setClubNameValue(club.name);
  }, [club]);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name);
      setLastName(profile.last_name);
    }
  }, [profile]);

  // Fetch club coaches when admin
  useEffect(() => {
    if (isAdmin && club?.id) {
      fetchCoaches();
    }
  }, [isAdmin, club?.id]);

  const fetchCoaches = async () => {
    if (!club?.id) return;
    setLoadingCoaches(true);
    try {
      const { data, error } = await supabase
        .from('sd_profiles')
        .select('*')
        .eq('club_id', club.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      const profiles = (data || []) as SDProfile[];
      setCoaches(profiles);

      // Fetch emails for each coach via their user_id
      // We use the admin API indirectly - fetch from auth.users isn't available client-side
      // Instead, we'll show email from the current user if it matches
      const emails: Record<string, string> = {};
      if (user) {
        emails[user.id] = user.email || '';
      }
      setCoachEmails(emails);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoadingCoaches(false);
    }
  };

  // -- Handlers --

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      toast({ title: 'Odkaz skopírovaný' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Chyba', description: 'Nepodarilo sa skopírovať odkaz.', variant: 'destructive' });
    }
  };

  const handleSaveClubName = async () => {
    if (!club?.id || !clubNameValue.trim()) return;
    setSavingClubName(true);
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ name: clubNameValue.trim() })
        .eq('id', club.id);

      if (error) throw error;

      toast({ title: 'Názov klubu bol aktualizovaný' });
      setEditingClubName(false);
      await refreshProfile();
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť názov klubu.',
        variant: 'destructive',
      });
    } finally {
      setSavingClubName(false);
    }
  };

  const handleCancelClubName = () => {
    setClubNameValue(club?.name || '');
    setEditingClubName(false);
  };

  const handleSaveProfile = async () => {
    if (!profile?.id || !firstName.trim() || !lastName.trim()) return;
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('sd_profiles')
        .update({ first_name: firstName.trim(), last_name: lastName.trim() })
        .eq('id', profile.id);

      if (error) throw error;

      toast({ title: 'Profil bol aktualizovaný' });
      setEditingProfile(false);
      await refreshProfile();
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa uložiť profil.',
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    setFirstName(profile?.first_name || '');
    setLastName(profile?.last_name || '');
    setEditingProfile(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({
        title: 'Chyba',
        description: 'Heslo musí mať aspoň 6 znakov.',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Chyba',
        description: 'Heslá sa nezhodujú.',
        variant: 'destructive',
      });
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: 'Heslo bolo zmenené' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa zmeniť heslo.',
        variant: 'destructive',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const inviteLink = club?.id
    ? `${window.location.origin}/registracia?club=${club.id}`
    : '';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Nastavenia</h1>
        <p className="text-muted-foreground mt-1">Nastavenia klubu a účtu</p>
      </div>

      {/* Edit Club Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Názov klubu
          </CardTitle>
          <CardDescription>Názov vášho plaveckého klubu</CardDescription>
        </CardHeader>
        <CardContent>
          {editingClubName ? (
            <div className="flex gap-2">
              <Input
                value={clubNameValue}
                onChange={(e) => setClubNameValue(e.target.value)}
                placeholder="Názov klubu"
                autoFocus
              />
              <Button
                size="sm"
                onClick={handleSaveClubName}
                disabled={savingClubName || !clubNameValue.trim()}
              >
                <Save className="w-4 h-4 mr-1" />
                Uložiť
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelClubName}>
                <X className="w-4 h-4 mr-1" />
                Zrušiť
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{club?.name || '—'}</span>
              {isAdmin && (
                <Button size="sm" variant="outline" onClick={() => setEditingClubName(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Upraviť
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profil trénera
          </CardTitle>
          <CardDescription>Vaše osobné údaje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingProfile ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meno</Label>
                  <Input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Meno"
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priezvisko</Label>
                  <Input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Priezvisko"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rola</Label>
                <Input
                  value={profile?.role === 'admin' ? 'Administrátor' : 'Tréner'}
                  disabled
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveProfile}
                  disabled={savingProfile || !firstName.trim() || !lastName.trim()}
                >
                  <Save className="w-4 h-4 mr-1" />
                  Uložiť
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelProfile}>
                  <X className="w-4 h-4 mr-1" />
                  Zrušiť
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Meno</Label>
                  <Input value={profile?.first_name || ''} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Priezvisko</Label>
                  <Input value={profile?.last_name || ''} disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rola</Label>
                <Input
                  value={profile?.role === 'admin' ? 'Administrátor' : 'Tréner'}
                  disabled
                />
              </div>
              <div>
                <Button size="sm" variant="outline" onClick={() => setEditingProfile(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Upraviť
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Zmena hesla
          </CardTitle>
          <CardDescription>Nastavte si nové prihlasovacie heslo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nové heslo</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimálne 6 znakov"
            />
          </div>
          <div className="space-y-2">
            <Label>Potvrdiť heslo</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Zadajte heslo znova"
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={savingPassword || !newPassword || !confirmPassword}
          >
            {savingPassword ? 'Ukladám...' : 'Zmeniť heslo'}
          </Button>
        </CardContent>
      </Card>

      {/* Club Coaches (admin only) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tréneri klubu
            </CardTitle>
            <CardDescription>Zoznam všetkých trénerov vo vašom klube</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCoaches ? (
              <p className="text-sm text-muted-foreground">Načítavam...</p>
            ) : coaches.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žiadni tréneri</p>
            ) : (
              <div className="space-y-3">
                {coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {coach.first_name} {coach.last_name}
                        </p>
                        {coachEmails[coach.user_id] && (
                          <p className="text-xs text-muted-foreground">
                            {coachEmails[coach.user_id]}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant={coach.role === 'admin' ? 'default' : 'secondary'}
                      className={
                        coach.role === 'admin'
                          ? 'bg-blue-600 hover:bg-blue-600/80'
                          : ''
                      }
                    >
                      {coach.role === 'admin' ? 'Admin' : 'Tréner'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite coaches */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Pozvať trénerov
            </CardTitle>
            <CardDescription>
              Zdieľajte tento odkaz s trénermi, aby sa mohli pripojiť ku klubu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={handleCopy} className="flex-shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Tréneri sa po registrácii automaticky pridajú do vášho klubu
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
