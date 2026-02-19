import { motion } from 'framer-motion';
import { MessageCircle, Handshake, KeyRound } from 'lucide-react';

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

const steps = [
  {
    icon: MessageCircle,
    number: '1',
    title: 'Ozvete sa mi',
    description: 'Napíšte mi správu alebo zavolajte.',
  },
  {
    icon: Handshake,
    number: '2',
    title: 'Spoločne preberieme možnosti',
    description: 'Zistíme, čo potrebujete a dohodneme si kapacitu.',
  },
  {
    icon: KeyRound,
    number: '3',
    title: 'Dostanete prístup do systému',
    description: 'Po potvrdení si budete vedieť pohodlne rezervovať tréningy online.',
  },
];

export default function HowItWorksSteps() {
  return (
    <section className="px-5 py-8">
      <motion.div
        className="mx-auto max-w-sm space-y-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeInUp}>
          Ako to prebieha
        </motion.h2>

        <div className="space-y-3">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="ios-card p-5 flex items-start gap-4"
              variants={fadeInUp}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                {step.number}
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">{step.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
