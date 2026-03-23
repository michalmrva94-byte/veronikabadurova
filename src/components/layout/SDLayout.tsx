import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSDAuth } from '@/contexts/SDAuthContext';
import { SD_ROUTES } from '@/lib/sd-constants';
import {
  LayoutDashboard,
  Calendar,
  Users,
  User,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: SD_ROUTES.DASHBOARD },
  { label: 'Tréningy', icon: Calendar, path: SD_ROUTES.WORKOUTS },
  { label: 'Skupiny', icon: Users, path: SD_ROUTES.GROUPS },
  { label: 'Plavci', icon: User, path: SD_ROUTES.SWIMMERS },
  { label: 'Limity SZPS', icon: Trophy, path: SD_ROUTES.LIMITS },
  { label: 'Nastavenia', icon: Settings, path: SD_ROUTES.SETTINGS },
];

export default function SDLayout({ children }: { children: React.ReactNode }) {
  const { profile, club, signOut } = useSDAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate(SD_ROUTES.LOGIN);
  };

  const fullName = profile ? `${profile.first_name} ${profile.last_name}` : '';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-[#0A1628] text-white
          flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div>
            <h1 className="text-lg font-bold text-white">SwimDesk Coach</h1>
            <p className="text-xs text-blue-300/70 mt-0.5">{club?.name || 'Načítava sa...'}</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== SD_ROUTES.DASHBOARD && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${isActive
                    ? 'bg-[#1A56E8] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#1A56E8] flex items-center justify-center text-sm font-semibold">
              {profile?.first_name?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{fullName}</p>
              <p className="text-xs text-white/40 capitalize">{profile?.role || ''}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 mt-1 w-full rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Odhlásiť sa
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-sm font-semibold text-foreground">{club?.name || 'SwimDesk Coach'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">{fullName}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
