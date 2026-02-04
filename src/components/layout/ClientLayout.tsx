import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Home, 
  User, 
  CreditCard, 
  Gift, 
  Bell,
  LogOut,
  Waves
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Prehľad', path: ROUTES.DASHBOARD },
  { icon: Calendar, label: 'Kalendár', path: ROUTES.CALENDAR },
  { icon: CreditCard, label: 'Financie', path: ROUTES.FINANCES },
  { icon: Gift, label: 'Odporúčanie', path: ROUTES.REFERRAL },
  { icon: User, label: 'Profil', path: ROUTES.PROFILE },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 safe-top">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Waves className="h-5 w-5" />
            </div>
            <span className="font-semibold text-foreground">Veronika Swim</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Link to={ROUTES.NOTIFICATIONS}>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {/* Notification badge - placeholder */}
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
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 transition-colors',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className={cn('h-5 w-5', isActive && 'scale-110')} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
