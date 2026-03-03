import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ArrowRight, UserCheck } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';
import WelcomeScreen from '@/components/landing/WelcomeScreen';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import AboutVeronika from '@/components/landing/AboutVeronika';
import TargetGroupsSection from '@/components/landing/TargetGroupsSection';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
import CTABanner from '@/components/landing/CTABanner';
import ContactSection from '@/components/landing/ContactSection';
import LandingFooter from '@/components/landing/LandingFooter';

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

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function PublicLandingPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { user, isAdmin } = useAuth();
  const contactRef = useRef<HTMLElement>(null);

  const scrollToContact = () => {
    contactRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <motion.div
          className="text-center space-y-6 max-w-sm"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div className="relative mx-auto" variants={scaleIn}>
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
            <img
              src={veronikaPhoto}
              alt="Veronika"
              className="relative h-32 w-32 rounded-full object-cover shadow-float ring-4 ring-white"
            />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground">Vitaj späť!</h1>
            <p className="text-muted-foreground mt-2 text-lg">Teší ma, že si tu.</p>
          </motion.div>
          <motion.div variants={fadeInUp}>
            <Button asChild size="lg" className="w-full btn-dark h-14 text-base ios-press">
              <Link to={dashboardRoute}>
                Pokračovať
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen onComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      <motion.div
        className="flex min-h-screen flex-col bg-background overflow-x-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: showWelcome ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        <LandingHeader />
        <LandingHero onScrollToContact={scrollToContact} />

        {/* Existing client card */}
        <motion.section
          className="px-5 pt-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
          transition={{ duration: 0.4 }}
        >
          <div className="mx-auto max-w-lg ios-card p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground leading-tight">Ste už môj klient?</h3>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5">Spravujte si tréningy online.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button asChild variant="outline" size="sm" className="rounded-2xl ios-press text-xs h-8 px-3">
                <Link to={ROUTES.LOGIN}>Prihlásiť sa</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-2xl ios-press text-xs h-8 px-3">
                <Link to={ROUTES.REGISTER}>Registrovať sa</Link>
              </Button>
            </div>
          </div>
        </motion.section>

        <AboutVeronika />
        <TargetGroupsSection />
        <HowItWorksSteps />
        <CTABanner onScrollToContact={scrollToContact} />
        <ContactSection ref={contactRef} />
        <LandingFooter />
      </motion.div>
    </>
  );
}
