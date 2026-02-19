import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { UserCheck } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DualPathSection() {
  return (
    <section className="px-5 py-6">
      <motion.div
        className="mx-auto max-w-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="ios-card p-5 flex items-center gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <UserCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Ste už môj klient?</p>
            <p className="text-xs text-muted-foreground mt-0.5">Spravujte si tréningy online.</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs ios-press">
              <Link to={ROUTES.LOGIN}>Prihlásiť sa</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs ios-press">
              <Link to={ROUTES.REGISTER}>Registrovať sa</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
