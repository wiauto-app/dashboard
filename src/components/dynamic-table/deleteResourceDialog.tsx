import CustomAlertDialog from "@/components/ui/customAlertDialog";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import type { apiResponse } from "@/services/api";
import type { DynamicTableAction } from "./types";
import { IconButton } from "../ui/iconButton";

export interface DeleteResourceConfig {
  deleteFn: (id: string) => Promise<apiResponse<unknown>>;
  title: string;
  description: string;
  successToast?: string;
  errorToast?: string;
  confirmText?: string;
}

export const DeleteResourceDialog = ({
  resource_id,
  onSuccess,
  deleteFn,
  title,
  description,
  successToast = "Eliminado correctamente",
  errorToast = "No se pudo eliminar el registro",
  confirmText = "Eliminar",
}: DeleteResourceConfig & {
  resource_id: string;
  onSuccess?: () => void;
}) => {
  const handleConfirm = async () => {
    const response = await deleteFn(resource_id);
    if (!response.ok) {
      toast.error(response.message || errorToast);
      return;
    }
    toast.success(successToast);
    onSuccess?.();
  };

  return (
    <CustomAlertDialog
      title={title}
      description={description}
      onConfirm={handleConfirm}
      confirmVariant="destructive"
      confirmText={confirmText}
      trigger={
        <IconButton
          text="Eliminar"
          variant="destructive"
          size="icon-sm"
          aria-label={typeof title === "string" ? title : "Eliminar"}
        >
          <TrashIcon className="size-4" aria-hidden />
        </IconButton>
      }
    />
  );
};

/** Acción estándar “Eliminar” para `DynamicTable` (icono + diálogo + API). */
export const deleteRowAction = (
  resource_id: string,
  onSuccess: (() => void) | undefined,
  config: DeleteResourceConfig,
): DynamicTableAction => ({
  key: "delete",
  label: "Eliminar",
  component: (
    <DeleteResourceDialog
      resource_id={resource_id}
      onSuccess={onSuccess}
      {...config}
    />
  ),
});
