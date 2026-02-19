import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';

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
          S 💙 vytvorené pre teba
        </p>
        <Link 
          to={ROUTES.LOGIN}
          className="text-xs text-muted-foreground/50 mt-2 block hover:text-muted-foreground transition-colors"
        >
          © 2024 Veronika Swim
        </Link>
      </div>
    </motion.footer>
  );
}
