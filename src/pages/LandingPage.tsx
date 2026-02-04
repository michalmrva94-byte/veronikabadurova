import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { Calendar, Shield, CreditCard, Users, ArrowRight, Heart, ChevronRight } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function LandingPage() {
  const { user, isAdmin } = useAuth();

  // If user is logged in, show welcome back screen
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
          {/* Photo with soft glow */}
          <motion.div className="relative mx-auto" variants={scaleIn}>
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="relative h-32 w-32 rounded-full object-cover shadow-float ring-4 ring-white"
            />
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground">Vitaj späť! 👋</h1>
            <p className="text-muted-foreground mt-2 text-lg">Teší ma, že si tu.</p>
          </motion.div>
          
          <motion.div variants={fadeInUp}>
            <Button 
              asChild 
              size="lg" 
              className="w-full btn-dark h-14 text-base ios-press"
            >
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
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* Hero section */}
      <motion.section 
        className="relative py-12 safe-top"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <div className="container px-6">
          <div className="mx-auto max-w-sm text-center">
            {/* Photo with elegant presentation */}
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
              Ahoj, som Veronika!
            </motion.h1>
            
            <motion.p 
              className="text-lg text-primary font-semibold mb-3"
              variants={fadeInUp}
            >
              Tvoja osobná trénerka plávania
            </motion.p>
            
            <motion.p 
              className="text-muted-foreground mb-8 text-base leading-relaxed"
              variants={fadeInUp}
            >
              Rada ťa naučím plávať alebo zdokonalím tvoju techniku. 
              Teším sa na teba v bazéne! 💙
            </motion.p>

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

      {/* About Card - Floating style */}
      <motion.section 
        className="py-4 px-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
      >
        <div className="ios-card-elevated p-5 mx-auto max-w-sm">
          <div className="flex items-start gap-4">
            <img 
              src={veronikaPhoto} 
              alt="Veronika" 
              className="h-14 w-14 rounded-2xl object-cover shadow-soft"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Heart className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">O mne</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plávaniu sa venujem od malička. Moja misia je ukázať, aké môže byť plávanie krásne.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features - Clean cards */}
      <section className="py-6 px-5">
        <div className="mx-auto max-w-sm">
          <motion.h2 
            className="text-xl font-bold mb-4 px-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            Ako to funguje
          </motion.h2>
          
          <motion.div 
            className="space-y-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div className="ios-card p-4 card-hover" variants={fadeInUp}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Vyber si termín</p>
                  <p className="text-sm text-muted-foreground">Jednoduchá online rezervácia</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link to={ROUTES.CANCELLATION_POLICY} className="ios-card p-4 card-hover block">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Férové pravidlá</p>
                    <p className="text-sm text-muted-foreground">Flexibilné storno podmienky</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
                </div>
              </Link>
            </motion.div>

            <motion.div className="ios-card p-4 card-hover" variants={fadeInUp}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Kreditový systém</p>
                  <p className="text-sm text-muted-foreground">Plávaj bez starostí</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </motion.div>

            <motion.div className="ios-card p-4 card-hover" variants={fadeInUp}>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">Pozvi kamarátov</p>
                  <p className="text-sm text-muted-foreground">Získaj tréning zadarmo 🎁</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <motion.section 
        className="py-10 px-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={scaleIn}
        transition={{ duration: 0.5 }}
      >
        <div className="mx-auto max-w-sm text-center">
          <div className="ios-card-elevated p-8">
            <h2 className="text-2xl font-bold mb-2">Pripravená?</h2>
            <p className="text-muted-foreground mb-6">
              Registrácia trvá len minútku
            </p>
            <Button 
              asChild 
              size="lg" 
              className="w-full btn-dark h-14 text-base ios-press"
            >
              <Link to={ROUTES.REGISTER}>
                Zaregistrovať sa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="py-6 px-5 safe-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            S 💙 vytvorené pre teba
          </p>
          <Link 
            to={ROUTES.ADMIN.LOGIN}
            className="text-xs text-muted-foreground/50 mt-2 block hover:text-muted-foreground transition-colors"
          >
            © 2024 Veronika Swim
          </Link>
        </div>
      </motion.footer>
    </div>
  );
}
