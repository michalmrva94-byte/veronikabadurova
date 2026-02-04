import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Megaphone, Send, Clock, Users, AlertTriangle } from 'lucide-react';

export default function AdminBroadcastPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Placeholder - no available slots
  const availableSlots: any[] = [];

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Last-minute broadcast</h1>
          <p className="text-muted-foreground">
            Ponúknite voľné termíny všetkým klientom
          </p>
        </div>

        {/* Info card */}
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex gap-3 p-4">
            <Megaphone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Ako to funguje?</p>
              <p className="text-muted-foreground">
                Keď klient zruší tréning menej ako 24 hodín vopred, môžete ponúknuť 
                uvoľnený termín ostatným klientom. Prvý, kto si rezervuje, pláva!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Available slots for broadcast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Voľné termíny na ponuku
            </CardTitle>
            <CardDescription>
              Termíny, ktoré boli uvoľnené menej ako 24h vopred
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Momentálne nie sú žiadne last-minute termíny
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Slots will be rendered here */}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Broadcast form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Send className="h-5 w-5" />
              Odoslať broadcast
            </CardTitle>
            <CardDescription>
              Správa bude odoslaná všetkým klientom s povolenými notifikáciami
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nadpis</Label>
              <Input
                placeholder="Voľný termín dnes o 18:00!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Správa</Label>
              <Textarea
                placeholder="Uvoľnil sa termín na dnes o 18:00. Prvý, kto si rezervuje, pláva! 🏊‍♀️"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Odošle sa 0 klientom</span>
            </div>

            <Button className="w-full" disabled={!title || !message}>
              <Send className="mr-2 h-4 w-4" />
              Odoslať broadcast
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Upozornenie</p>
              <p className="text-muted-foreground">
                Broadcast odošle notifikáciu všetkým klientom naraz. 
                Používajte ho len pre skutočne last-minute ponuky.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
