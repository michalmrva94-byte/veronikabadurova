import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { supabase } from '@/integrations/supabase/client';
import { ArrowRight, Gift, Target, Award, Droplets, Heart, Users } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';
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

export default function ReferralLandingPage() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code') || '';
  const [referrerName, setReferrerName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    async function fetchReferrer() {
      if (!code) {
        setLoading(false);
        return;
      }
      const { data } = await supabase.rpc('get_referrer_name', { code });
      setReferrerName(data as string | null);
      setLoading(false);
    }
    fetchReferrer();
  }, [code]);

  if (user) {
    const dashboardRoute = isAdmin ? ROUTES.ADMIN.DASHBOARD : ROUTES.DASHBOARD;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <motion.div className="text-center space-y-6 max-w-sm" initial="hidden" animate="visible" variants={staggerContainer}>
          <motion.div variants={fadeInUp}>
            <h1 className="text-3xl font-bold text-foreground">Vitaj späť! 👋</h1>
            <p className="text-muted-foreground mt-2">Už máš účet, pokračuj do aplikácie.</p>
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

  const registerUrl = code ? `${ROUTES.REGISTER}?ref=${code}` : ROUTES.REGISTER;

  const targetGroups = [
    { icon: Target, text: 'Zlepšenie techniky plávania' },
    { icon: Award, text: 'Príprava na skúšky a športové výzvy' },
    { icon: Droplets, text: 'Naučenie kraulu a nových štýlov' },
    { icon: Heart, text: 'Prekonanie strachu z vody' },
    { icon: Users, text: 'Zdravý pohyb pre deti aj dospelých' },
  ];

  return (
    <motion.div
      className="flex min-h-screen flex-col bg-background overflow-x-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Referral banner */}
      {!loading && (
        <motion.div
          className="bg-primary/10 px-5 py-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {referrerName
                ? `Odporučil vám tréning: ${referrerName}`
                : 'Prišli ste na odporúčanie.'
              }
            </p>
          </div>
        </motion.div>
      )}

      {/* HERO */}
      <section className="relative px-5 pt-12 pb-10">
        <motion.div
          className="mx-auto max-w-sm text-center space-y-6"
          initial="hidden"
          animate="visible"
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
              <Link to={registerUrl}>
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
              <Link to={registerUrl}>
                Zaregistrovať sa
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </motion.section>

      <LandingFooter />
    </motion.div>
  );
}
