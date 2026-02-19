import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { UserCheck, HeartHandshake, Phone, MessageCircle } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

interface DualPathSectionProps {
  onScrollToContact: () => void;
}

export default function DualPathSection({ onScrollToContact }: DualPathSectionProps) {
  return (
    <section className="px-5 py-8">
      <motion.div
        className="mx-auto max-w-lg space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        {/* Existing client */}
        <motion.div className="ios-card p-6 space-y-4" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Ste už môj klient?</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Zaregistrujte sa do systému a spravujte si tréningy pohodlne online.
          </p>
          <div className="flex gap-3">
            <Button asChild className="flex-1 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 ios-press">
              <Link to={ROUTES.REGISTER}>Registrovať sa</Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 rounded-2xl ios-press">
              <Link to={ROUTES.LOGIN}>Prihlásiť sa</Link>
            </Button>
          </div>
        </motion.div>

        {/* New prospect */}
        <motion.div className="ios-card p-6 space-y-4" variants={fadeInUp}>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-success/10">
              <HeartHandshake className="h-5 w-5 text-success" />
            </div>
            <h3 className="text-lg font-bold text-foreground">Máte záujem o tréning?</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Každého nového klienta si vyberám individuálne, aby som vedela zachovať kvalitu tréningov.
            Ak máte záujem, pokojne sa mi ozvite.
          </p>
          <div className="flex gap-3">
            <Button asChild className="flex-1 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 ios-press">
              <a href="tel:+421000000000">
                <Phone className="mr-1.5 h-4 w-4" />
                Zavolať
              </a>
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-2xl ios-press"
              onClick={onScrollToContact}
            >
              <MessageCircle className="mr-1.5 h-4 w-4" />
              Napísať
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
