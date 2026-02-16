import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function HeroSection() {
  return (
    <motion.section 
      className="relative py-12 safe-top"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="container px-6">
        <div className="mx-auto max-w-sm text-center">
          <motion.div 
            className="mb-8 flex justify-center"
            variants={scaleIn}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/15 blur-3xl scale-150" />
              <img 
                src={veronikaPhoto} 
                alt="Veronika" 
                className="relative h-36 w-36 rounded-full object-cover shadow-float ring-4 ring-white"
              />
              <motion.div 
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-2.5 shadow-soft"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <span className="text-xl">🏊‍♀️</span>
              </motion.div>
            </div>
          </motion.div>
          
          <motion.h1 
            className="text-3xl font-bold text-foreground mb-2"
            variants={fadeInUp}
          >
            Ahoj, som Veronika 💙
          </motion.h1>
          
          <motion.p 
            className="text-lg text-primary font-semibold mb-4"
            variants={fadeInUp}
          >
            Tvoja osobná trénerka plávania
          </motion.p>
          
          <motion.div 
            className="text-muted-foreground mb-8 text-base leading-relaxed space-y-3"
            variants={fadeInUp}
          >
            <p>
              Aby som vám vedela ešte lepšie plánovať tréningy a mať prehľad o voľných termínoch, pripravila som jednoduchý rezervačný systém.
            </p>
            <p>
              Vďaka nemu si budete vedieť pohodlne vyberať termíny, dostávať pripomienky a mať prehľad o svojich tréningoch.
            </p>
            <p>
              Teším sa na vás vo vode 🏊‍♀️
            </p>
          </motion.div>

          <motion.div className="space-y-3" variants={fadeInUp}>
            <Button 
              asChild 
              size="lg" 
              className="w-full btn-dark h-14 text-base ios-press"
            >
              <Link to={ROUTES.REGISTER}>
                Začať plávať
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="ghost" 
              size="lg" 
              className="w-full rounded-2xl h-14 text-base font-medium ios-press text-muted-foreground"
            >
              <Link to={ROUTES.LOGIN}>
                Už mám účet
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
