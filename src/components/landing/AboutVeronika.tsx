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

const highlights = [
  '14 rokov skúseností',
  'Certifikovaná trénerka',
  'Individuálny prístup',
];

export default function AboutVeronika() {
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
          O Veronike
        </motion.h2>

        <motion.div className="flex flex-wrap gap-x-6 gap-y-2" variants={fadeInUp}>
          {highlights.map((text) => (
            <span key={text} className="text-sm text-muted-foreground">
              {text}
            </span>
          ))}
        </motion.div>

        <motion.p
          className="text-base text-muted-foreground leading-relaxed"
          variants={fadeInUp}
        >
          Plávanie ma sprevádza celý život. Verím, že každý sa môže vo vode cítiť istejšie – bez ohľadu na vek či skúsenosti.
        </motion.p>
      </motion.div>
    </section>
  );
}
