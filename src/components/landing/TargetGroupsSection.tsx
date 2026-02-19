import { motion } from 'framer-motion';
import { Target, Award, Droplets, Heart, Users } from 'lucide-react';

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
  { icon: Target, text: 'Zlepšenie techniky plávania' },
  { icon: Award, text: 'Príprava na skúšky a športové výzvy' },
  { icon: Droplets, text: 'Naučenie kraulu a nových štýlov' },
  { icon: Heart, text: 'Prekonanie strachu z vody' },
  { icon: Users, text: 'Zdravý pohyb pre deti aj dospelých' },
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

        <div className="space-y-3">
          {groups.map((item) => (
            <motion.div
              key={item.text}
              className="ios-card p-4 flex items-center gap-4"
              variants={fadeInUp}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
