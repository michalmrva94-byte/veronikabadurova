import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';
import { ROUTES } from '@/lib/constants';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function DualPathSection() {
  return (
    <section className="px-6 py-8">
      <motion.div
        className="mx-auto max-w-md space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.div className="ios-card p-6 space-y-4" variants={fadeInUp}>
          <p className="text-base font-semibold text-card-foreground">Ste už môj klient?</p>
          <p className="text-sm text-muted-foreground">Spravujte si tréningy online.</p>
          <div className="flex gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Prihlásiť sa
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              Registrovať sa
            </Link>
          </div>
        </motion.div>

        <motion.div className="ios-card p-6 space-y-4" variants={fadeInUp}>
          <p className="text-base font-semibold text-card-foreground">Máte záujem o tréning?</p>
          <p className="text-sm text-muted-foreground">Ozvite sa mi a dohodneme sa.</p>
          <div className="flex gap-3">
            <a
              href="tel:+421000000000"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Phone className="h-4 w-4" />
              Zavolať
            </a>
            <button
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Napísať
            </button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
