import { motion } from 'framer-motion';
import veronikaPhoto from '@/assets/veronika-photo.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1 }
};

interface LandingHeroProps {
  onScrollToContact: () => void;
}

export default function LandingHero({ onScrollToContact }: LandingHeroProps) {
  return (
    <section className="px-6 pt-20 pb-16">
      <motion.div
        className="mx-auto max-w-md text-center space-y-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div className="relative mx-auto w-fit" variants={scaleIn}>
          <img
            src={veronikaPhoto}
            alt="Veronika – trénerka plávania"
            className="h-48 w-48 rounded-full object-cover shadow-float"
          />
        </motion.div>

        <motion.div className="space-y-4" variants={fadeInUp}>
          <h1 className="text-4xl font-bold text-foreground leading-[1.1] tracking-tight">
            Plávanie s osobným prístupom v Pezinku
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Som Veronika a pomáham ľuďom cítiť sa vo vode istejšie.
          </p>
        </motion.div>

        <motion.div variants={fadeInUp} className="space-y-3">
          <button
            onClick={onScrollToContact}
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-semibold text-base px-7 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Chcem sa spojiť s Veronikou
          </button>
          <p className="text-sm text-muted-foreground">
            Nezáväzný kontakt. Ozvem sa vám osobne.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
