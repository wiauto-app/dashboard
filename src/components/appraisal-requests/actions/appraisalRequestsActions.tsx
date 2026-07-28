import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import CustomAlertDialog from "@/components/ui/customAlertDialog";
import { IconButton } from "@/components/ui/iconButton";
import type { DynamicTableAction } from "@/components/dynamic-table/types";

import { appraisalRequestsService } from "../services/appraisalRequestsService";
import type { AppraisalRequestListItem } from "../types/appraisal-request.types";

export const appraisalRequestsActions = (
  row: AppraisalRequestListItem,
  onSuccess?: () => void,
): DynamicTableAction[] => {
  if (row.status === "closed") {
    return [];
  }

  const handleClose = async () => {
    const response = await appraisalRequestsService.close(row.id);
    if (response.ok) {
      toast.success("Solicitud cerrada correctamente");
      onSuccess?.();
      return;
    }
    toast.error(response.message || "Error al cerrar la solicitud");
  };

  return [
    {
      key: "close",
      label: "Cerrar solicitud",
      component: (
        <CustomAlertDialog
          key={`appraisal-request-close-${row.id}`}
          title="Cerrar solicitud de tasación"
          description={`¿Cerrar la solicitud de «${row.vehicle_label}»? Ya no aparecerá como pendiente ni respondida.`}
          confirmText="Cerrar solicitud"
          confirmVariant="default"
          onConfirm={handleClose}
          trigger={
            <IconButton
              text="Cerrar solicitud"
              variant="outline"
              size="icon-sm"
              ariaLabel="Cerrar solicitud"
            >
              <CheckCircle2 className="size-4" aria-hidden />
            </IconButton>
          }
        />
      ),
    },
  ];
};
