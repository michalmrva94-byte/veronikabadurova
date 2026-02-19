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
  { number: '3', title: 'Začneme tréning', description: 'Ak si sadneme, získate prístup do rezervačného systému.' },
];

export default function HowItWorksSteps() {
  return (
    <section className="px-6 py-16">
      <motion.div
        className="mx-auto max-w-md space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground tracking-tight" variants={fadeInUp}>
          Ako to prebieha
        </motion.h2>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              className="flex gap-5"
              variants={fadeInUp}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-foreground leading-none">{step.number}</span>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-2" />
                )}
              </div>
              <div className="pb-6">
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
