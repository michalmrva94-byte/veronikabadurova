import { Link } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

export default function LandingFooter() {
  return (
    <footer className="py-12 px-6 safe-bottom">
      <div className="mx-auto max-w-md text-center">
        <Link
          to={ROUTES.LOGIN}
          className="text-sm text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          © 2026 Veronika Swim
        </Link>
      </div>
    </footer>
  );
}
