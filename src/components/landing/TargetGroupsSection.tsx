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

const groups = [
  {
    title: 'Zlepšenie techniky',
    description: 'Pre tých, ktorí chcú plávať efektívnejšie a sebavedomejšie.',
  },
  {
    title: 'Príprava na skúšky',
    description: 'Individuálna príprava podľa požiadaviek a cieľov.',
  },
  {
    title: 'Prekonanie strachu z vody',
    description: 'Citlivý prístup pre deti aj dospelých.',
  },
];

export default function TargetGroupsSection() {
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
          Pre koho je tréning
        </motion.h2>

        <div className="space-y-8">
          {groups.map((item) => (
            <motion.div key={item.title} variants={fadeInUp}>
              <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
