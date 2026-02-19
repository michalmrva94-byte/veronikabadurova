import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
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
    <section className="px-5 pt-10 pb-8">
      <motion.div
        className="mx-auto max-w-sm text-center space-y-5"
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
            className="relative h-44 w-44 rounded-full object-cover shadow-float ring-4 ring-primary/20"
          />
        </motion.div>

        <motion.h1
          className="text-2xl font-bold text-foreground leading-tight"
          variants={fadeInUp}
        >
          Plávanie s osobným prístupom v Pezinku
        </motion.h1>

        <motion.p
          className="text-base text-muted-foreground leading-relaxed"
          variants={fadeInUp}
        >
          Som Veronika a pomáham ľuďom cítiť sa vo vode istejšie.
        </motion.p>

        <motion.div variants={fadeInUp} className="pt-2">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 ios-press"
            onClick={onScrollToContact}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Mám záujem o osobný tréning
          </Button>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Nezáväzný kontakt. Ozvem sa vám osobne.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
