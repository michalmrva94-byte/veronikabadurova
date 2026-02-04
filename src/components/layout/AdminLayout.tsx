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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <div>
              <span className="font-semibold text-foreground">Veronika Swim</span>
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                Admin
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to={ROUTES.ADMIN.SETTINGS}>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-4 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-bottom">
        <div className="container flex h-16 items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path === ROUTES.ADMIN.CLIENTS && location.pathname.startsWith('/admin/klienti'));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
