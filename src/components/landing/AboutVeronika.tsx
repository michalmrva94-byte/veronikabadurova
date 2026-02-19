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

const stats = [
  { value: '14 rokov', label: 'skúseností' },
  { value: 'Certifikovaná', label: 'trénerka' },
  { value: 'PK Pezinok', label: 'plavecký klub' },
  { value: 'Individuálny', label: 'prístup' },
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

        <motion.div className="grid grid-cols-2 gap-3" variants={fadeInUp}>
          {stats.map((item) => (
            <div key={item.label} className="ios-card p-5">
              <p className="text-lg font-bold text-card-foreground">{item.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.label}</p>
            </div>
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
