import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function CancellationRulesSection() {
  return (
    <motion.section 
      className="py-4 px-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
    >
      <div className="ios-card-elevated p-5 mx-auto max-w-sm">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-lg">Rezervačné pravidlá</h3>
        </div>
        <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>Rezervovaný termín je vyhradený iba pre teba. Ak sa tréning zruší:</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span>viac ako 48 hodín vopred</span>
              <span className="text-success font-medium">bez poplatku</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span>24 – 48 hodín</span>
              <span className="text-warning font-medium">50 %</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span>menej ako 24 hodín</span>
              <span className="text-destructive font-medium">80 %</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/30">
              <span>neúčasť bez zrušenia</span>
              <span className="text-destructive font-medium">100 %</span>
            </div>
          </div>
          <p className="pt-1">Systém je nastavený férovo a rovnako pre všetkých 💙</p>
        </div>
      </div>
    </motion.section>
  );
}
