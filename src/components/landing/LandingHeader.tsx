import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import veronikaPhoto from '@/assets/veronika-photo.png';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 glass-strong border-b border-border/30 safe-top">
      <div className="mx-auto max-w-2xl flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-3">
          <img
            src={veronikaPhoto}
            alt="Veronika"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />

          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">Veronika</p>
            <p className="text-xs text-muted-foreground">Trénerka Plávania</p>
          </div>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to={ROUTES.LOGIN}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">

            Prihlásiť sa
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">

            Registrovať sa
          </Link>
        </nav>
      </div>
    </header>);

}