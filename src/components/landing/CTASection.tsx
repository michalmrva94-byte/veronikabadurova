import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/constants';
import { ArrowRight } from 'lucide-react';

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

export default function CTASection() {
  return (
    <motion.section 
      className="py-10 px-5"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={scaleIn}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto max-w-sm text-center">
        <div className="ios-card-elevated p-8">
          <h2 className="text-2xl font-bold mb-2">Si pripravená / pripravený?</h2>
          <p className="text-muted-foreground mb-6">
            Registrácia trvá menej ako minútu.
          </p>
          <Button 
            asChild 
            size="lg" 
            className="w-full btn-dark h-14 text-base ios-press"
          >
            <Link to={ROUTES.REGISTER}>
              Zaregistrovať sa
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
