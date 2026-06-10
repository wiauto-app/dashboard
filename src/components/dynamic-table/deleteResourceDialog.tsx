import CustomAlertDialog from "@/components/ui/customAlertDialog";
import { TrashIcon } from "lucide-react";
import { toast } from "sonner";
import type { apiResponse } from "@/services/api";
import type { DynamicTableAction } from "./types";
import { useUndoDelayedCommit } from "@/hooks/useUndoDelayedCommit";
import { IconButton } from "../ui/iconButton";

export type DeleteResourceConfig = {
  deleteFn: (id: string) => Promise<apiResponse<unknown>>;
  title: string;
  description: string;
  successToast?: string;
  errorToast?: string;
  confirmText?: string;
  /** Sonner con “Deshacer” antes de llamar al API (por defecto `true`). */
  use_undo_toast?: boolean;
  undo_delay_ms?: number;
  undo_pending_message?: string;
  undo_label?: string;
};

const default_undo_pending =
  "Se eliminará el registro en unos segundos. Pulsa Deshacer para cancelar.";

export const DeleteResourceDialog = ({
  resource_id,
  onSuccess,
  deleteFn,
  title,
  description,
  successToast = "Eliminado correctamente",
  errorToast = "No se pudo eliminar el registro",
  confirmText = "Eliminar",
  use_undo_toast = true,
  undo_delay_ms = 5000,
  undo_pending_message = default_undo_pending,
  undo_label,
}: DeleteResourceConfig & {
  resource_id: string;
  onSuccess?: () => void;
}) => {
  const { schedule: schedule_undo_commit } = useUndoDelayedCommit();

  const execute_delete = async (opts: { show_success_toast: boolean }) => {
    const response = await deleteFn(resource_id);
    if (!response.ok) {
      toast.error(response.message || errorToast);
      return;
    }
    if (opts.show_success_toast) {
      toast.success(successToast);
    }
    onSuccess?.();
  };

  const handleConfirm = () => {
    if (!use_undo_toast) {
      return execute_delete({ show_success_toast: true });
    }
    schedule_undo_commit({
      message: undo_pending_message,
      undo_label,
      delay_ms: undo_delay_ms,
      on_commit: () => execute_delete({ show_success_toast: false }),
    });
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
