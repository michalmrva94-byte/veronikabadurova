import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface LowCreditWarningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  missingAmount: number;
}

export function LowCreditWarningDialog({
  isOpen,
  onClose,
  onConfirm,
  missingAmount,
}: LowCreditWarningDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nedostatok kreditu</DialogTitle>
          <DialogDescription>
            Informácia o vašom zostatkoch
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 p-4 rounded-lg border border-primary/30 bg-primary/5">
          <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-foreground">
            Nemáte dostatočný kredit. Po absolvovaní tréningu vznikne záväzok vo výške{' '}
            <span className="font-semibold">{missingAmount.toFixed(2)} €</span>.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Zrušiť
          </Button>
          <Button onClick={onConfirm} className="w-full sm:w-auto">
            Pokračovať
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
