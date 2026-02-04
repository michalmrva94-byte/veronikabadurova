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
  { icon: Home, label: 'Domov', path: ROUTES.DASHBOARD },
  { icon: Calendar, label: 'Rezervácie', path: ROUTES.CALENDAR },
  { icon: CreditCard, label: 'Platby', path: ROUTES.FINANCES },
  { icon: Gift, label: 'Odmeny', path: ROUTES.REFERRAL },
  { icon: User, label: 'Profil', path: ROUTES.PROFILE },
];

export function ClientLayout({ children }: ClientLayoutProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/30 safe-top">
        <div className="container flex h-16 items-center justify-between px-5">
          <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-10 w-10 rounded-full object-cover ring-2 ring-white shadow-soft"
            />
            <div>
              <span className="font-semibold text-foreground">Veronika</span>
              <span className="text-xs text-muted-foreground block">Swim Coach</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link to={ROUTES.NOTIFICATIONS}>
              <Button variant="ghost" size="icon" className="rounded-full ios-press h-10 w-10">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={signOut} className="rounded-full ios-press h-10 w-10">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container flex-1 py-6 pb-28 px-5">
        {children}
      </main>

      {/* Modern Black Tab Bar - matching reference */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <div className="mx-4 mb-4">
          <div className="bg-accent rounded-[2rem] px-4 py-3 shadow-float">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all ios-press min-w-[50px]',
                      isActive 
                        ? 'text-accent-foreground' 
                        : 'text-accent-foreground/50'
                    )}
                  >
                    <item.icon 
                      className={cn(
                        'h-5 w-5 transition-all',
                        isActive && 'scale-110'
                      )} 
                      strokeWidth={isActive ? 2.5 : 1.5}
                    />
                    <span className={cn(
                      'text-[10px]',
                      isActive ? 'font-semibold' : 'font-normal'
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
