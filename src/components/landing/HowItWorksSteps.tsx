import { motion } from 'framer-motion';

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

const steps = [
  { number: '1', title: 'Ozvete sa mi', description: 'Napíšte mi správu alebo zavolajte.' },
  { number: '2', title: 'Preberieme možnosti', description: 'Zistíme, čo potrebujete a dohodneme kapacitu.' },
  { number: '3', title: 'Dostanete prístup', description: 'Ak si sadneme, dostanete prístup do systému na rezervácie.' },
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
              className="flex items-start gap-3"
              variants={fadeInUp}
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {step.number}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
