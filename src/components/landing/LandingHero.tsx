import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import veronikaPhoto from '@/assets/veronika-photo.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

interface LandingHeroProps {
  onScrollToContact: () => void;
}

export default function LandingHero({ onScrollToContact }: LandingHeroProps) {
  return (
    <section className="px-5 pt-14 pb-10">
      <motion.div
        className="mx-auto max-w-sm text-center space-y-8"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Dominant photo */}
        <motion.div className="relative mx-auto w-fit" variants={scaleIn}>
          <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl scale-150" />
          <img
            src={veronikaPhoto}
            alt="Veronika – trénerka plávania"
            className="relative h-56 w-56 rounded-full object-cover shadow-float ring-4 ring-primary/20"
          />
        </motion.div>

        <motion.h1
          className="text-3xl font-bold text-foreground leading-tight"
          variants={fadeInUp}
        >
          Ahoj, som Veronika.
          <br />
          Osobná trénerka plávania v&nbsp;Pezinku.
        </motion.h1>

        <motion.p
          className="text-lg text-muted-foreground leading-relaxed"
          variants={fadeInUp}
        >
          Pomáham deťom aj dospelým zlepšiť techniku, prekonať strach a&nbsp;cítiť sa vo vode sebavedomo.
        </motion.p>

        <motion.div variants={fadeInUp} className="pt-2">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl bg-foreground text-background hover:bg-foreground/90 ios-press"
            onClick={onScrollToContact}
          >
            Dohodnúť tréning
          </Button>
          <p className="text-sm text-muted-foreground/70 mt-3">
            Nezáväzný kontakt. Ozvem sa vám osobne.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
