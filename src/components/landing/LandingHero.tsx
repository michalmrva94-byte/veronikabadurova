import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface LandingHeroProps {
  onScrollToContact: () => void;
}

export default function LandingHero({ onScrollToContact }: LandingHeroProps) {
  return (
    <section className="px-5 pt-12 pb-8">
      <motion.div
        className="mx-auto max-w-sm text-center space-y-5"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.h1
          className="text-3xl font-bold text-foreground leading-tight"
          variants={fadeInUp}
        >
          Individuálne tréningy plávania v Pezinku
        </motion.h1>

        <motion.p
          className="text-base text-muted-foreground leading-relaxed"
          variants={fadeInUp}
        >
          Zlepši techniku, nauč sa nový štýl alebo sa priprav na skúšky – s profesionálnym a osobným vedením.
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/80 italic"
          variants={fadeInUp}
        >
          Ak vás plávanie láka, rada sa s vami spojím a preberieme možnosti. 💙
        </motion.p>

        <motion.div variants={fadeInUp} className="pt-2">
          <Button
            size="lg"
            className="w-full h-14 text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 ios-press"
            onClick={onScrollToContact}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Mám záujem o tréning
          </Button>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Nezáväzná správa. Ozvem sa vám osobne.
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
