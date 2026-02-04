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
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import veronikaPhoto from '@/assets/veronika-photo.png';

interface ClientLayoutProps {
  children: ReactNode;
}

const navItems = [
  { icon: Home, label: 'Prehľad', path: ROUTES.DASHBOARD },
  { icon: Calendar, label: 'Kalendár', path: ROUTES.CALENDAR },
  { icon: CreditCard, label: 'Financie', path: ROUTES.FINANCES },
  { icon: Gift, label: 'Odmeny', path: ROUTES.REFERRAL },
  { icon: User, label: 'Profil', path: ROUTES.PROFILE },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* iOS-style Header */}
      <header className="sticky top-0 z-50 glass-strong border-b border-border/50 safe-top">
        <div className="container flex h-14 items-center justify-between px-5">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
            />
            <span className="font-semibold">Veronika</span>
          </Link>
          
          <div className="flex items-center gap-1">
            <Link to={ROUTES.NOTIFICATIONS}>
              <Button variant="ghost" size="icon" className="rounded-full ios-press">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full ios-press">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-4 pb-24 px-5">
        {children}
      </main>

      {/* iOS-style Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-bottom">
        <div className="container flex h-20 items-start justify-around pt-2 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ios-press min-w-[60px]',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
              >
                <item.icon className={cn(
                  'h-6 w-6 transition-transform',
                  isActive && 'scale-110'
                )} 
                strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={cn(
                  'text-[10px]',
                  isActive ? 'font-semibold' : 'font-medium'
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
