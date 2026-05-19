import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useState } from "react";

interface CustomDialogProps {
  trigger: React.ReactNode;
  children: (props: { closeDialog: () => void }) => React.ReactNode;
}

export const CustomDialog = ({ trigger, children }: CustomDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{trigger}</DialogTrigger>
      <DialogContent>{children({ closeDialog })}</DialogContent>
    </Dialog>
  );
};
