import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type BackupCodesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  backupCodes: string[];
};

export const BackupCodesDialog = ({
  open,
  onOpenChange,
  backupCodes,
}: BackupCodesDialogProps) => {
  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join("\n"));
      toast.success("Códigos copiados al portapapeles");
    } catch {
      toast.error("No se pudieron copiar los códigos");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Códigos de respaldo</DialogTitle>
          <DialogDescription>
            Guárdalos en un lugar seguro. Solo se muestran una vez y no podrás
            verlos de nuevo.
          </DialogDescription>
        </DialogHeader>

        <ul
          className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-sm"
          aria-label="Lista de códigos de respaldo"
        >
          {backupCodes.map((code) => (
            <li key={code}>{code}</li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCopyAll}
            aria-label="Copiar todos los códigos de respaldo"
          >
            <Copy className="size-4" aria-hidden />
            Copiar todos
          </Button>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
