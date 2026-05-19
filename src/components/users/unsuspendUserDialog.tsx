import { suspendUserService } from "@/services/users/suspendUserService";
import { CustomAlertDialog } from "../ui/customAlertDialog";
import { Button } from "../ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const UnsuspendUserDialog = ({
  targetUserId,
  onSuccess,
}: {
  onSuccess?: () => void;
  targetUserId: string;
}) => {
  const handleUnsuspend = async () => {
    const response = await suspendUserService.unsuspendUser(targetUserId);
    if (response.ok) {
      toast.success("Usuario reactivado correctamente");
      onSuccess?.();
    } else {
      toast.error("Error al reactivar el usuario");
    }
  };
  return (
    <CustomAlertDialog
      title="Reactivar usuario"
      description="¿Estás seguro de querer reactivar este usuario?"
      onConfirm={handleUnsuspend}
      confirmVariant="default"
      trigger={
        <Button
          key="unsuspend"
          className={cn(
            "bg-green-100 text-green-600 hover:bg-green-600 hover:text-white",
          )}
          size="icon-sm"
        >
          <CheckCircle className="size-4" />
        </Button>
      }
    />
  );
};
