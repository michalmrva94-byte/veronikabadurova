import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Bell, Share, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePushNotifications, isSupported as pushSupported } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const LS_INSTALL_DISMISSED = 'install_banner_dismissed_at';
const LS_PUSH_DISMISSED = 'push_dismissed_at';
const INSTALL_COOLDOWN_DAYS = 14;
const PUSH_COOLDOWN_DAYS = 7;

function isDismissed(key: string, days: number): boolean {
  const val = localStorage.getItem(key);
  if (!val) return false;
  return (Date.now() - Number(val)) / (1000 * 60 * 60 * 24) < days;
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

function isInStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;
}

export function InstallPushBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [showIOSDialog, setShowIOSDialog] = useState(false);
  const { subscribeToPush } = usePushNotifications();

  useEffect(() => {
    const standalone = isInStandaloneMode();

    // Scenario A: Not installed
    if (!standalone && !isDismissed(LS_INSTALL_DISMISSED, INSTALL_COOLDOWN_DAYS)) {
      setShowInstall(true);
    }

    // Scenario B: Installed but push not enabled
    if (standalone && pushSupported && Notification.permission === 'default' && !isDismissed(LS_PUSH_DISMISSED, PUSH_COOLDOWN_DAYS)) {
      setShowPush(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (isIOS()) {
      setShowIOSDialog(true);
      return;
    }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        toast.success('Appka sa inštaluje! 🎉');
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for browsers without beforeinstallprompt
      setShowIOSDialog(true);
    }
  }, [deferredPrompt]);

  const handleDismissInstall = () => {
    localStorage.setItem(LS_INSTALL_DISMISSED, String(Date.now()));
    setShowInstall(false);
  };

  const handleAllowPush = async () => {
    const ok = await subscribeToPush();
    setShowPush(false);
    if (ok) toast.success('Notifikácie sú zapnuté ✅');
  };

  const handleDismissPush = () => {
    localStorage.setItem(LS_PUSH_DISMISSED, String(Date.now()));
    setShowPush(false);
  };

  return (
    <>
      <AnimatePresence>
        {showInstall && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden relative">
              <button
                onClick={handleDismissInstall}
                className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <CardContent className="flex flex-col items-center text-center py-6 px-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 mb-4">
                  <Smartphone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Pridajte si appku na plochu
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-[280px]">
                  Rýchly prístup jedným ťuknutím, notifikácie o tréningoch a plynulejší zážitok.
                </p>
                <Button onClick={handleInstall} className="w-full" size="lg">
                  <Smartphone className="mr-2 h-4 w-4" />
                  Nainštalovať
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {showPush && !showInstall && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden relative">
              <button
                onClick={handleDismissPush}
                className="absolute top-3 right-3 p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              <CardContent className="flex flex-col items-center text-center py-6 px-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 mb-4">
                  <Bell className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Zapnite si notifikácie
                </h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-[280px]">
                  Budeme vás informovať o nových tréningoch, zmenách a pripomienkach. Nič vám neunikne.
                </p>
                <Button onClick={handleAllowPush} className="w-full" size="lg">
                  <Bell className="mr-2 h-4 w-4" />
                  Povoliť notifikácie
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS instructions dialog */}
      <Dialog open={showIOSDialog} onOpenChange={setShowIOSDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pridajte si appku na plochu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</div>
              <p className="text-sm text-foreground">
                Ťuknite na ikonu <Share className="inline h-4 w-4 text-primary mx-0.5 -mt-0.5" /> <strong>Zdieľať</strong> v dolnej lište Safari.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</div>
              <p className="text-sm text-foreground">
                Posuňte nadol a ťuknite na <Plus className="inline h-4 w-4 text-primary mx-0.5 -mt-0.5" /> <strong>Pridať na plochu</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</div>
              <p className="text-sm text-foreground">
                Potvrďte ťuknutím na <strong>Pridať</strong>. Hotovo! 🎉
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
