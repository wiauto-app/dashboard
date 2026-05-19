import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = React.ComponentProps<typeof Button>["variant"];

type CustomAlertDialogBaseProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: React.ReactNode;
  onCancel?: () => void;
  /** Por defecto: "Confirmar" */
  confirmText?: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  confirmVariant?: ButtonVariant;
  /** Si viene definido, deshabilita cerrar y los botones mientras es true (modo controlado). */
  isConfirming?: boolean;
  contentClassName?: string;
};

type CustomAlertDialogControlledProps = CustomAlertDialogBaseProps & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: undefined;
};

type CustomAlertDialogTriggerProps = CustomAlertDialogBaseProps & {
  trigger: React.ReactNode;
  open?: undefined;
  onOpenChange?: undefined;
};

export type CustomAlertDialogProps =
  | CustomAlertDialogControlledProps
  | CustomAlertDialogTriggerProps;

const CustomAlertDialog = (props: CustomAlertDialogProps) => {
  const {
    title,
    description,
    cancelText = "Cancelar",
    confirmText = "Confirmar",
    onCancel,
    onConfirm,
    confirmVariant = "destructive",
    isConfirming: isConfirmingProp,
    contentClassName,
  } = props;

  const isControlled = "open" in props && props.open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [internalConfirming, setInternalConfirming] = React.useState(false);

  const open = isControlled ? props.open : internalOpen;
  const isConfirming = isConfirmingProp ?? internalConfirming;

  const handleOpenChange = (next: boolean) => {
    if (isConfirming && !next) return;
    if (isControlled) {
      props.onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  const handleConfirm = async () => {
    if (isConfirmingProp !== undefined) {
      await Promise.resolve(onConfirm());
      return;
    }
    setInternalConfirming(true);
    try {
      await Promise.resolve(onConfirm());
      if (!isControlled) {
        setInternalOpen(false);
      }
    } finally {
      setInternalConfirming(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {"trigger" in props && props.trigger ? (
        <AlertDialogTrigger>{props.trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className={cn(contentClassName)}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <Button 
          type="button"
          onClick={() => {
            handleOpenChange(false);
            onCancel?.();
          }}
          variant="outline" disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isConfirming}
            onClick={() => {
              void handleConfirm();
            }}
          >
            {isConfirming ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden
                />
                {confirmText}
              </>
            ) : (
              confirmText
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CustomAlertDialog;
export { CustomAlertDialog };
