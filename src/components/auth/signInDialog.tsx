import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { SignInFormContent } from "./signInFormContent";

export type SignInDialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  onSuccess?: () => void | Promise<void>;
};

export const SignInDialog = ({
  open,
  onOpenChange,
  trigger,
  onSuccess,
}: SignInDialogProps) => {
  const { refreshUser } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(nextOpen);
    }

    onOpenChange?.(nextOpen);

    if (!nextOpen) {
      setFormKey((current) => current + 1);
    }
  };

  const handleSuccess = async () => {
    await refreshUser();
    handleOpenChange(false);
    await onSuccess?.();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? <DialogTrigger>{trigger}</DialogTrigger> : null}
      <DialogContent
        className={cn(
          "max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-sm",
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-semibold tracking-tight">
            Inicia Sesión
          </DialogTitle>
        </DialogHeader>
        <SignInFormContent
          key={formKey}
          showTitle={false}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
