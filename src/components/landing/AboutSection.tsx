import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import veronikaPhoto from '@/assets/veronika-photo.png';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function AboutSection() {
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
        <div className="flex items-start gap-4">
          <img 
            src={veronikaPhoto} 
            alt="Veronika" 
            className="h-14 w-14 rounded-2xl object-cover shadow-soft flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">O mne</h3>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
              <p>
                Som certifikovaná trénerka plávania so 14-ročnou skúsenosťou. Profesionálne pôsobím v Plaveckom klube Pezinok a venujem sa deťom aj dospelým.
              </p>
              <p>Pomáham ľuďom:</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>zlepšiť techniku plávania</li>
                <li>naučiť sa nové štýly (napr. kraul)</li>
                <li>pripraviť sa na skúšky či športové výzvy</li>
                <li>prekonať strach z vody</li>
                <li>alebo si jednoducho užívať pohyb ako súčasť zdravého životného štýlu</li>
              </ul>
              <p>
                Každý tréning prispôsobujem individuálne – podľa cieľa, úrovne aj osobných potrieb.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
