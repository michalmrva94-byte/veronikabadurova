import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '@/lib/constants';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DualPathSection() {
  return (
    <section className="px-6 py-8">
      <motion.div
        className="mx-auto max-w-md"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeInUp}
      >
        <div className="border border-border rounded-2xl p-6 text-center space-y-4">
          <p className="text-sm font-semibold text-foreground">Ste už môj klient?</p>
          <p className="text-sm text-muted-foreground">
            Spravujte si tréningy online.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to={ROUTES.LOGIN}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Prihlásiť sa
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Registrovať sa
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
