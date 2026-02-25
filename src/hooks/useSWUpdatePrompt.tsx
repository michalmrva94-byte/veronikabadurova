import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useSWUpdatePrompt() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkForUpdate = async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          showUpdateToast(registration.waiting);
        }
      } catch {
        // SW not available
      }
    };

    const showUpdateToast = (waitingWorker: ServiceWorker) => {
      toast({
        title: 'Nová verzia dostupná',
        description: 'Klikni na tlačidlo pre aktualizáciu aplikácie.',
        action: (
          <button
            onClick={() => {
              waitingWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }}
            className="inline-flex h-8 items-center justify-center rounded-md border bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Aktualizovať
          </button>
        ),
      });
    };

    // Listen for new SW becoming available
    const handleControllerChange = () => {
      // New SW took control - this happens after SKIP_WAITING
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check on mount
    checkForUpdate();

    // Periodic check every 60 seconds
    const interval = setInterval(checkForUpdate, 60_000);

    // Also listen for new SW installations
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast(newWorker);
          }
        });
      });
    });

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(interval);
    };
  }, []);
}
