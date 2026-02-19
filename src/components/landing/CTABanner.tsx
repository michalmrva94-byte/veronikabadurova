import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface CTABannerProps {
  onScrollToContact: () => void;
}

export default function CTABanner({ onScrollToContact }: CTABannerProps) {
  return (
    <motion.section
      className="px-5 py-16"
      style={{ backgroundColor: '#0F0F0F' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-sm text-center space-y-6">
        <h2 className="text-2xl font-bold text-white leading-tight">
          Začnime spolu pracovať na&nbsp;vašom plávaní.
        </h2>
        <Button
          size="lg"
          className="w-full h-14 text-base rounded-2xl bg-white text-[#0F0F0F] hover:bg-white/90 ios-press"
          onClick={onScrollToContact}
        >
          Dohodnúť tréning
        </Button>
      </div>
    </motion.section>
  );
}
