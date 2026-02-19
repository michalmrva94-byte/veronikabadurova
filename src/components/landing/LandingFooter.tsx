import { motion } from 'framer-motion';

export default function LandingFooter() {
  return (
    <motion.footer
      className="py-6 px-5 safe-bottom"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          &copy; 2026 Veronika Swim
        </p>
      </div>
    </motion.footer>
  );
}
