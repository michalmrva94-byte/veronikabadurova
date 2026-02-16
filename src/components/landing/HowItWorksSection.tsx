import { motion } from 'framer-motion';
import { Calendar, BarChart3, Zap, Gift, ChevronRight } from 'lucide-react';

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

const benefits = [
  {
    icon: Calendar,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Vyber si termín',
    description: 'Voľné termíny uvidíš online a rezervuješ si ich za pár sekúnd – pohodlne a bez vypisovania správ.',
  },
  {
    icon: BarChart3,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    title: 'Prehľad o tréningoch',
    description: 'Nadchádzajúce tréningy, absolvované hodiny aj aktuálny stav konta – všetko na jednom mieste.',
  },
  {
    icon: Zap,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    title: 'Last-minute príležitosti',
    description: 'Ak sa niektorý termín uvoľní, môžeš ho využiť – niekedy aj za zvýhodnenú cenu.',
  },
  {
    icon: Gift,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    title: 'Odporúčanie sa oplatí',
    description: 'Ak odporučíš niekoho nového a absolvuje prvý tréning, získaš jednu hodinu zdarma ako poďakovanie.',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-6 px-5">
      <div className="mx-auto max-w-sm">
        <motion.h2 
          className="text-xl font-bold mb-4 px-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          Ako funguje rezervačný systém?
        </motion.h2>
        
        <motion.div 
          className="space-y-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {benefits.map((benefit) => (
            <motion.div key={benefit.title} className="ios-card p-4 card-hover" variants={fadeInUp}>
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-2xl ${benefit.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.iconColor}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold mb-1">{benefit.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
