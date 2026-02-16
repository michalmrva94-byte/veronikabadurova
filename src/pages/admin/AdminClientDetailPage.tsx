import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subWeeks } from 'date-fns';
import { sk } from 'date-fns/locale';
import {
  ArrowLeft, User, Mail, Phone, CreditCard, Calendar, Target,
  CalendarDays, Loader2, TrendingUp, AlertTriangle, Info
} from 'lucide-react';
import { CLIENT_TYPE_LABELS, BOOKING_STATUS_LABELS, ROUTES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ClientType, BookingStatus } from '@/types/database';

export default function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: client, isLoading } = useQuery({
    queryKey: ['client-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Training history
  const { data: bookings = [] } = useQuery({
    queryKey: ['client-bookings-admin', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, slot:training_slots(*)')
        .eq('client_id', id!)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Training frequency (last 4 weeks)
  const fourWeeksAgo = subWeeks(new Date(), 4).toISOString();
  const { data: recentBookings = [] } = useQuery({
    queryKey: ['client-frequency', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('client_id', id!)
        .in('status', ['booked', 'completed'])
        .gte('created_at', fourWeeksAgo);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleUpdateClientType = async (type: ClientType) => {
    const { error } = await supabase
      .from('profiles')
      .update({ client_type: type as any })
      .eq('id', id!);

    if (error) {
      toast.error('Nepodarilo sa zmeniť typ klienta');
    } else {
      toast.success(`Typ klienta zmenený na ${CLIENT_TYPE_LABELS[type]}`);
      queryClient.invalidateQueries({ queryKey: ['client-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    }
  };

  const weeklyFrequency = recentBookings.length / 4;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (!client) {
    return (
      <AdminLayout>
        <div className="text-center py-20 text-muted-foreground">Klient nenájdený</div>
      </AdminLayout>
    );
  }

  const balance = client.balance ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(ROUTES.ADMIN.CLIENTS)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{client.full_name}</h1>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>

        {/* Contact & Type */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.training_goal && (
              <div className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-primary" />
                <span>{client.training_goal}</span>
              </div>
            )}
            <div className="flex items-center gap-3 pt-2">
              <span className="text-sm text-muted-foreground">Typ klienta:</span>
              <Select
                value={client.client_type || 'flexible'}
                onValueChange={(v) => handleUpdateClientType(v as ClientType)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixný</SelectItem>
                  <SelectItem value="flexible">Flexibilný</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Zostatok</span>
              </div>
              <p className={`text-2xl font-bold ${balance < 0 ? 'text-destructive' : 'text-success'}`}>
                {balance.toFixed(2)}€
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Frekvencia / týždeň</span>
              </div>
              <p className="text-2xl font-bold">{weeklyFrequency.toFixed(1)}×</p>
            </CardContent>
          </Card>
        </div>

        {/* Recommendation */}
        {weeklyFrequency < 2 && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
            <Info className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Pre optimálny progres odporúčam aspoň 2 tréningy týždenne.
              Aktuálne: {weeklyFrequency.toFixed(1)}× za posledné 4 týždne.
            </p>
          </div>
        )}

        {/* Training history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              História tréningov
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">Žiadne tréningy</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((booking: any) => {
                  const status = booking.status as BookingStatus;
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">
                            {booking.slot ? format(new Date(booking.slot.start_time), 'EEEE d. MMM yyyy, HH:mm', { locale: sk }) : '—'}
                          </p>
                          <p className="text-xs text-muted-foreground">{booking.price}€</p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          status === 'completed' ? 'default' :
                          status === 'cancelled' || status === 'no_show' ? 'destructive' :
                          'secondary'
                        }
                        className="text-xs"
                      >
                        {BOOKING_STATUS_LABELS[status] || status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
