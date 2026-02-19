import { motion } from 'framer-motion';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const groups = [
  { title: 'Zlepšenie techniky', description: 'Pre tých, ktorí chcú plávať efektívnejšie a sebavedomejšie.' },
  { title: 'Príprava na skúšky', description: 'Individuálna príprava podľa cieľov a požiadaviek.' },
  { title: 'Naučenie kraulu', description: 'Pre začiatočníkov aj mierne pokročilých.' },
  { title: 'Prekonanie strachu', description: 'Citlivý prístup pre deti aj dospelých.' },
  { title: 'Zdravý pohyb', description: 'Pre každého, kto chce zostať aktívny.' },
];

export default function TargetGroupsSection() {
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
          Pre koho je tréning
        </motion.h2>

        <div className="space-y-3">
          {groups.map((item) => (
            <motion.div
              key={item.title}
              className="rounded-2xl border border-border p-5"
              variants={fadeInUp}
            >
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
