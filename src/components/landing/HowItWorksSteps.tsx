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
  { number: '1', title: 'Ozvite sa mi', description: 'Napíšte správu alebo mi zavolajte.' },
  { number: '2', title: 'Krátka konzultácia', description: 'Zistíme vašu úroveň a cieľ.' },
  { number: '3', title: 'Začneme tréning', description: 'Dohodneme termín a ideme do vody.' },
];

export default function HowItWorksSteps() {
  return (
    <section className="px-5 py-10">
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
              className="rounded-2xl border border-border p-5 flex items-start gap-4"
              variants={fadeInUp}
            >
              <span className="text-3xl font-bold text-foreground leading-none mt-0.5">
                {step.number}
              </span>
              <div>
                <p className="font-semibold text-foreground">{step.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
