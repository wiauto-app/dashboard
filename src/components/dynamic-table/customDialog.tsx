import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CustomDialogProps {
  trigger: React.ReactNode;
  children: (props: { closeDialog: () => void }) => React.ReactNode;
  contentClassName?: string;
}

export const CustomDialog = ({
  trigger,
  children,
  contentClassName,
}: CustomDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent className={cn(contentClassName)}>
        {children({ closeDialog })}
      </DialogContent>
    </Dialog>
  );
};
