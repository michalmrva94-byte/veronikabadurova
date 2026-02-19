import { motion } from 'framer-motion';
import { Target, Award, Heart } from 'lucide-react';

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
  { icon: Target, text: 'Zlepšenie techniky' },
  { icon: Award, text: 'Príprava na skúšky' },
  { icon: Heart, text: 'Prekonanie strachu z vody' },
];

export default function TargetGroupsSection() {
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
          Pre koho je tréning
        </motion.h2>

        <div className="space-y-2.5">
          {groups.map((item) => (
            <motion.div
              key={item.text}
              className="flex items-center gap-3 py-1"
              variants={fadeInUp}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <item.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
