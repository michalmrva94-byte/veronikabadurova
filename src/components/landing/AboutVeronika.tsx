import { motion } from 'framer-motion';
import { Clock, Award, User } from 'lucide-react';

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
  { icon: Clock, text: '14 rokov skúseností' },
  { icon: Award, text: 'Certifikovaná trénerka' },
  { icon: User, text: 'Individuálny prístup' },
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

        <motion.div className="space-y-2.5" variants={fadeInUp}>
          {highlights.map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <item.icon className="h-4 w-4 text-primary shrink-0" />
              <p className="text-sm font-medium text-foreground">{item.text}</p>
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
