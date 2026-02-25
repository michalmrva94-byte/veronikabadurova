import { Bell, Check, X, CalendarX2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { useAdminNotifications } from '@/hooks/useAdminNotifications';
import { cn } from '@/lib/utils';
import { Notification } from '@/types/database';

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'práve teraz';
  if (mins < 60) return `pred ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `pred ${hours} h`;
  const days = Math.floor(hours / 24);
  return `pred ${days} d`;
}

function getTypeIcon(type: string | null) {
  switch (type) {
    case 'proposal_confirmed':
      return <Check className="h-4 w-4 text-green-500" />;
    case 'proposal_rejected':
      return <X className="h-4 w-4 text-red-500" />;
    case 'booking_cancelled':
      return <CalendarX2 className="h-4 w-4 text-orange-500" />;
    case 'booking_request':
      return <Plus className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-muted-foreground" />;
  }
}

export function AdminNotificationBell() {
  const { notifications, unreadCount, readCount, markAsRead, markAllAsRead, deleteAllRead } = useAdminNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="ios-press rounded-xl h-9 w-9 relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 rounded-2xl">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <span className="font-semibold text-sm">Notifikácie</span>
          <div className="flex items-center gap-1">
            {readCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-destructive hover:text-destructive"
                onClick={() => deleteAllRead.mutate()}
                disabled={deleteAllRead.isPending}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Vymazať
              </Button>
            )}
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 text-primary"
                onClick={() => markAllAsRead.mutate()}
              >
                Označiť všetky
              </Button>
            )}
          </div>
        </div>
        <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <span className="text-sm">Žiadne notifikácie</span>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n: Notification) => (
                <button
                  key={n.id}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50',
                    !n.is_read && 'bg-primary/5'
                  )}
                  onClick={() => !n.is_read && markAsRead.mutate(n.id)}
                >
                  <div className="mt-0.5 shrink-0">{getTypeIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm leading-tight', !n.is_read && 'font-semibold')}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{getRelativeTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
