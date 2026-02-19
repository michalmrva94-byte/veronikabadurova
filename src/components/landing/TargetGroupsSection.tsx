import { motion } from 'framer-motion';
import { Target, Award, Waves, Heart, Users } from 'lucide-react';

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
  { icon: Target, title: 'Zlepšenie techniky plávania', description: 'Pre tých, ktorí chcú plávať efektívnejšie a sebavedomejšie.' },
  { icon: Award, title: 'Príprava na skúšky a športové výzvy', description: 'Individuálna príprava podľa požiadaviek a cieľov.' },
  { icon: Waves, title: 'Naučenie kraulu a nových štýlov', description: 'Správna technika od základov až po pokročilé štýly.' },
  { icon: Heart, title: 'Prekonanie strachu z vody', description: 'Citlivý prístup pre deti aj dospelých.' },
  { icon: Users, title: 'Zdravý pohyb pre deti aj dospelých', description: 'Plávanie ako forma aktívneho oddychu a zdravia.' },
];

export default function TargetGroupsSection() {
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
          Pre koho je tréning
        </motion.h2>

        <div className="space-y-3">
          {groups.map((item) => (
            <motion.div key={item.title} className="ios-card p-5 flex items-start gap-4" variants={fadeInUp}>
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
