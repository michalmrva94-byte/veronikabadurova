import { motion } from 'framer-motion';
import veronikaPhoto from '@/assets/veronika-photo.png';
import { Gift } from 'lucide-react';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export default function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        // Trigger completion after showing animation
        setTimeout(onComplete, 2000);
      }}
    >
      {/* Photo with wave icon */}
      <motion.div 
        className="relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Soft glow behind photo */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
        
        {/* Photo */}
        <motion.img 
          src={veronikaPhoto} 
          alt="Veronika" 
          className="relative h-40 w-40 rounded-full object-cover shadow-float ring-4 ring-white"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        {/* Gift icon badge */}
        <motion.div 
          className="absolute -bottom-2 -right-2 bg-primary rounded-full p-3 shadow-soft"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <Gift className="h-5 w-5 text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* Birthday message */}
      <motion.p
        className="mt-8 text-xl font-semibold text-foreground text-center px-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Všetko najlepšie k meninkám láska 💖
      </motion.p>

      {/* Animated dots/loading indicator */}
      <motion.div 
        className="mt-10 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/40"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
