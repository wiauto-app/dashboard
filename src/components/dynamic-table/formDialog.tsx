import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { cn } from "@/lib/utils";
import type { FormSize } from "@/types/form.types";

export const FormDialog = ({
  form,
  size,
}: {
  form: React.ReactNode;
  size?: FormSize;
}) => {
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
        <Button type="button">
          <PlusIcon />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "md:max-w-2xl max-w-",
          size === "sm" && "md:max-w-sm",
          size === "md" && "md:max-w-md",
          size === "lg" && "md:max-w-lg",
          size === "xl" && "md:max-w-xl",
          size === "2xl" && "md:max-w-2xl",
          size === "3xl" && "md:max-w-3xl",
          size === "4xl" && "md:max-w-4xl",
          size === "5xl" && "md:max-w-5xl",
          size === "6xl" && "md:max-w-6xl",
          size === "7xl" && "md:max-w-7xl",
          size === "8xl" && "md:max-w-8xl",
        )}
      >
        <DialogHeader></DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
};
