import { ClientLayout } from '@/components/layout/ClientLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Megaphone, Calendar, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  // Placeholder - no notifications yet
  const notifications: any[] = [];

  return (
    <ClientLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Notifikácie</h1>
            <p className="text-muted-foreground">
              Vaše upozornenia a správy
            </p>
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm">
              <Check className="mr-2 h-4 w-4" />
              Označiť všetky
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">
                Nemáte žiadne nové notifikácie
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Notifications will be rendered here */}
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
