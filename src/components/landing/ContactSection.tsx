import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

const ContactSection = forwardRef<HTMLElement>((_, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Prosím vyplňte všetky polia.');
      return;
    }
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Správa odoslaná! Ozvem sa vám čo najskôr.');
    setName('');
    setEmail('');
    setMessage('');
    setSending(false);
  };

  return (
    <section ref={ref} className="px-6 py-16">
      <motion.div
        className="mx-auto max-w-md space-y-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground tracking-tight" variants={fadeInUp}>
          Spojme sa
        </motion.h2>

        <motion.a
          href="tel:+421000000000"
          className="block text-xl font-semibold text-foreground hover:text-muted-foreground transition-colors"
          variants={fadeInUp}
        >
          +421 000 000 000
        </motion.a>

        <motion.form
          className="space-y-6"
          variants={fadeInUp}
          onSubmit={handleSubmit}
        >
          <div>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Meno"
              maxLength={100}
              className="w-full bg-transparent border-b border-border pb-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              maxLength={255}
              className="w-full bg-transparent border-b border-border pb-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors"
            />
          </div>
          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Správa"
              maxLength={1000}
              rows={3}
              className="w-full bg-transparent border-b border-border pb-3 text-base text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-foreground transition-colors resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-semibold text-base px-7 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {sending ? 'Odosielam...' : 'Odoslať správu'}
          </button>
          <p className="text-sm text-muted-foreground">
            Ozvem sa vám čo najskôr.
          </p>
        </motion.form>
      </motion.div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;
