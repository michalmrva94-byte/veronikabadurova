import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import veronikaPhoto from '@/assets/veronika-photo.png';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-top">
      <div className="mx-auto max-w-2xl flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={veronikaPhoto}
            alt="Veronika"
            className="h-9 w-9 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight tracking-tight">Veronika</p>
            <p className="text-[11px] text-muted-foreground tracking-wide uppercase">Swim Coach</p>
          </div>
        </div>
        <nav className="flex items-center gap-5">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Prihlásiť sa
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors"
          >
            Registrovať sa
          </Link>
        </nav>
      </div>
    </header>
  );
}
