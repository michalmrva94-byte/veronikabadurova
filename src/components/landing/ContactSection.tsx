import { useState, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
    // Simulate send – replace with actual edge function later
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Správa odoslaná! Ozvem sa vám čo najskôr. 💙');
    setName('');
    setEmail('');
    setMessage('');
    setSending(false);
  };

  return (
    <section ref={ref} className="px-5 py-8">
      <motion.div
        className="mx-auto max-w-sm space-y-5"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className="text-2xl font-bold text-foreground" variants={fadeInUp}>
          Spojme sa
        </motion.h2>

        <motion.a
          href="tel:+421000000000"
          className="ios-card p-4 flex items-center gap-4 card-hover block"
          variants={fadeInUp}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
            <Phone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Zavolajte mi</p>
            <p className="text-xs text-muted-foreground">+421 000 000 000</p>
          </div>
        </motion.a>

        <motion.form
          className="ios-card p-6 space-y-4"
          variants={fadeInUp}
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm font-medium text-foreground">Meno</Label>
            <Input
              id="contact-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Vaše meno"
              className="rounded-xl"
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.com"
              className="rounded-xl"
              maxLength={255}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-message" className="text-sm font-medium text-foreground">Správa</Label>
            <Textarea
              id="contact-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Napíšte mi, čo vás zaujíma..."
              className="rounded-xl min-h-[100px]"
              maxLength={1000}
            />
          </div>
          <Button
            type="submit"
            disabled={sending}
            className="w-full rounded-2xl h-12 bg-primary text-primary-foreground hover:bg-primary/90 ios-press"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Odosielam...' : 'Odoslať správu'}
          </Button>
          <p className="text-xs text-muted-foreground/70 text-center">
            Ozvem sa vám čo najskôr. 💙
          </p>
        </motion.form>
      </motion.div>
    </section>
  );
});

ContactSection.displayName = 'ContactSection';
export default ContactSection;
