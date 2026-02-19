import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ArrowRight, Award, Users, Droplets, Heart, Target, Star, Calendar } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';
import WelcomeScreen from '@/components/landing/WelcomeScreen';
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
            <h1 className="text-3xl font-bold text-foreground">Vitaj späť! 👋</h1>
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

  const targetGroups = [
    { icon: Target, text: 'Zlepšenie techniky plávania' },
    { icon: Award, text: 'Príprava na skúšky a športové výzvy' },
    { icon: Droplets, text: 'Naučenie kraulu a nových štýlov' },
    { icon: Heart, text: 'Prekonanie strachu z vody' },
    { icon: Users, text: 'Zdravý pohyb pre deti aj dospelých' },
  ];

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
        {/* HERO */}
        <section className="relative px-5 pt-16 pb-10">
          <motion.div
            className="mx-auto max-w-sm text-center space-y-6"
            initial="hidden"
            animate={!showWelcome ? "visible" : "hidden"}
            variants={staggerContainer}
          >
            <motion.div className="relative mx-auto w-fit" variants={scaleIn}>
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <img
                src={veronikaPhoto}
                alt="Veronika – trénerka plávania"
                className="relative h-36 w-36 rounded-full object-cover shadow-float ring-4 ring-white"
              />
            </motion.div>

            <motion.div className="space-y-3" variants={fadeInUp}>
              <h1 className="text-3xl font-bold text-foreground leading-tight">
                Individuálne tréningy plávania v Pezinku
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed">
                Zlepši techniku, nauč sa nový štýl alebo sa priprav na skúšky – s profesionálnym vedením.
              </p>
            </motion.div>

            <motion.div className="space-y-3" variants={fadeInUp}>
              <Button asChild size="lg" className="w-full btn-dark h-14 text-base ios-press">
                <Link to={ROUTES.REGISTER}>
                  Rezervovať prvý tréning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="ghost" className="w-full text-muted-foreground">
                <Link to={ROUTES.LOGIN}>Už mám účet</Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>

        {/* O VERONIKE */}
        <motion.section
          className="py-10 px-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-sm space-y-5">
            <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeInUp}>
              O Veronike
            </motion.h2>
            <motion.div className="ios-card p-6 space-y-4" variants={fadeInUp}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: '14 rokov', sub: 'skúseností' },
                  { label: 'Certifikovaná', sub: 'trénerka' },
                  { label: 'PK Pezinok', sub: 'plavecký klub' },
                  { label: 'Individuálny', sub: 'prístup' },
                ].map((item) => (
                  <div key={item.label} className="text-center p-3 rounded-2xl bg-secondary">
                    <p className="font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* PRE KOHO JE TRÉNING */}
        <motion.section
          className="py-10 px-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <div className="mx-auto max-w-sm space-y-5">
            <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeInUp}>
              Pre koho je tréning
            </motion.h2>
            <motion.div className="space-y-3" variants={staggerContainer}>
              {targetGroups.map((item) => (
                <motion.div
                  key={item.text}
                  className="ios-card p-4 flex items-center gap-4"
                  variants={fadeInUp}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* REFERENCIE - placeholder */}
        <motion.section
          className="py-10 px-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <div className="mx-auto max-w-sm space-y-5">
            <h2 className="text-2xl font-bold text-foreground">Referencie</h2>
            <div className="ios-card p-8 text-center">
              <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Sekcia pre referencie bude čoskoro k dispozícii.
              </p>
            </div>
          </div>
        </motion.section>

        {/* AKO PREBIEHA REZERVÁCIA */}
        <motion.section
          className="py-10 px-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <div className="mx-auto max-w-sm space-y-5">
            <h2 className="text-2xl font-bold text-foreground">Ako prebieha rezervácia</h2>
            <div className="ios-card p-6 flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Rezervácia prebieha jednoducho cez online systém – vyberieš si termín a dostaneš pripomienku.
              </p>
            </div>
          </div>
        </motion.section>

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
              <h2 className="text-2xl font-bold mb-2">Začni trénovať</h2>
              <p className="text-muted-foreground mb-6">
                Registrácia trvá menej ako minútu.
              </p>
              <Button asChild size="lg" className="w-full btn-dark h-14 text-base ios-press">
                <Link to={ROUTES.REGISTER}>
                  Zaregistrovať sa
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        <LandingFooter />
      </motion.div>
    </>
  );
}
