import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

export const FormDialog = ({ form }: { form: React.ReactNode }) => {
  const isOpen = useFormDialogStore((state) => state.isOpen);
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSelectedId(null);
        }
      }}
    >
      <DialogTrigger>
        <Button>
          <PlusIcon />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent>{form}</DialogContent>
    </Dialog>
  );
};
