import { motion } from 'framer-motion';

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
  { number: '1', title: 'Ozvete sa mi', description: 'Napíšte mi správu alebo zavolajte.' },
  { number: '2', title: 'Preberieme možnosti', description: 'Zistíme, čo potrebujete a dohodneme kapacitu.' },
  { number: '3', title: 'Dostanete prístup do systému', description: 'Po potvrdení si budete vedieť pohodlne rezervovať tréningy online.' },
];

export default function HowItWorksSteps() {
  return (
    <section className="px-6 py-16">
      <motion.div
        className="mx-auto max-w-md space-y-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground tracking-tight" variants={fadeInUp}>
          Ako to prebieha
        </motion.h2>

        <div className="space-y-3">
          {steps.map((step) => (
            <motion.div
              key={step.number}
              className="ios-card p-5 flex items-start gap-4"
              variants={fadeInUp}
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-lg font-bold text-accent">{step.number}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
