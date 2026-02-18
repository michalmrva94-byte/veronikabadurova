import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings,
  Megaphone,
  LogOut,
  Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AdminNotificationBell } from '@/components/admin/AdminNotificationBell';
import veronikaPhoto from '@/assets/veronika-photo.png';

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: ROUTES.ADMIN.DASHBOARD },
  { icon: Calendar, label: 'Kalendár', path: ROUTES.ADMIN.CALENDAR },
  { icon: Users, label: 'Klienti', path: ROUTES.ADMIN.CLIENTS },
  { icon: CreditCard, label: 'Financie', path: ROUTES.ADMIN.FINANCES },
  { icon: Megaphone, label: 'Broadcast', path: ROUTES.ADMIN.BROADCAST },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* iOS-style Header with glassmorphism */}
      <header className="sticky top-0 z-50 glass safe-top">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
              <AvatarImage src={veronikaPhoto} alt="Veronika" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">V</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-sm">Veronika</span>
              <span className="text-[10px] text-primary font-medium">Admin Panel</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <AdminNotificationBell />
            <Link to={ROUTES.ADMIN.SETTINGS}>
              <Button variant="ghost" size="icon" className="ios-press rounded-xl h-9 w-9">
                <Settings className="h-5 w-5 text-muted-foreground" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="ios-press rounded-xl h-9 w-9">
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with iOS padding */}
      <main className="container flex-1 px-4 py-4 pb-24">
        {children}
      </main>

      {/* iOS-style Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom">
        <div className="container flex h-20 items-start justify-around pt-2 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === ROUTES.ADMIN.CLIENTS && location.pathname.startsWith('/admin/klienti'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 transition-all ios-press rounded-2xl min-w-[60px]',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                  isActive && 'bg-primary/10'
                )}>
                  <item.icon className={cn(
                    'h-5 w-5 transition-transform',
                    isActive && 'scale-110'
                  )} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium',
                  isActive && 'font-semibold'
                )}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
