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
  { label: '14 rokov', sub: 'skúseností' },
  { label: 'Certifikovaná', sub: 'trénerka' },
  { label: 'PK Pezinok', sub: 'plavecký klub' },
  { label: 'Individuálny', sub: 'prístup' },
];

export default function AboutVeronika() {
  return (
    <section className="px-5 py-8">
      <motion.div
        className="mx-auto max-w-sm space-y-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeInUp}>
          O Veronike
        </motion.h2>

        <motion.div className="grid grid-cols-2 gap-3" variants={fadeInUp}>
          {stats.map((item) => (
            <div key={item.label} className="ios-card text-center p-4">
              <p className="font-semibold text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="text-sm text-muted-foreground leading-relaxed"
          variants={fadeInUp}
        >
          Plávanie ma sprevádza celý život. Verím, že každý sa môže vo vode cítiť istejšie – bez ohľadu na vek či skúsenosti.
        </motion.p>
      </motion.div>
    </section>
  );
}
