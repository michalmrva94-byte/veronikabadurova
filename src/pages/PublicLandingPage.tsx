import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';
import WelcomeScreen from '@/components/landing/WelcomeScreen';
import LandingHeader from '@/components/landing/LandingHeader';
import LandingHero from '@/components/landing/LandingHero';
import DualPathSection from '@/components/landing/DualPathSection';
import AboutVeronika from '@/components/landing/AboutVeronika';
import TargetGroupsSection from '@/components/landing/TargetGroupsSection';
import HowItWorksSteps from '@/components/landing/HowItWorksSteps';
import ContactSection from '@/components/landing/ContactSection';
import LandingFooter from '@/components/landing/LandingFooter';

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={veronikaPhoto}
            alt="Veronika"
            className="mx-auto h-28 w-28 rounded-full object-cover shadow-float"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Vitaj späť! 👋</h1>
            <p className="text-muted-foreground mt-2 text-lg">Teší ma, že si tu.</p>
          </div>
          <Link
            to={dashboardRoute}
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-semibold text-base px-7 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Pokračovať
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
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
        <DualPathSection />
        <AboutVeronika />
        <TargetGroupsSection />
        <HowItWorksSteps />
        <ContactSection ref={contactRef} />
        <LandingFooter />
      </motion.div>
    </>
  );
}
