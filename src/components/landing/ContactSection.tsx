import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
        className="mx-auto max-w-md space-y-6"
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
          className="ios-card p-5 flex items-center gap-4 block"
          variants={fadeInUp}
        >
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Phone className="h-5 w-5 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-card-foreground">Zavolajte mi</p>
            <p className="text-base font-bold text-card-foreground">+421 000 000 000</p>
          </div>
        </motion.a>

        <motion.form
          className="ios-card p-6 space-y-5"
          variants={fadeInUp}
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="contact-name">Meno</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vaše meno"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.sk"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message">Správa</Label>
            <textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vaša správa..."
              maxLength={1000}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-semibold text-base px-7 py-4 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-50 w-full"
          >
            {sending ? 'Odosielam...' : 'Odoslať správu'}
          </button>
          <p className="text-sm text-muted-foreground text-center">
            Ozvem sa vám čo najskôr.
          </p>
        </motion.form>
      </motion.div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;
