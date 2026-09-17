import { CustomDialog } from "@/components/dynamic-table/customDialog";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { Button } from "@/components/ui/button";
import type { Lead } from "../services/leadsService";
import { leadsService } from "../services/leadsService";
import { LeadDetailForm } from "../forms/leadDetailForm";

export const leadActions = (row: Lead, on_success?: () => void) => [
  {
    key: "detail",
    label: "Ver",
    component: (
      <CustomDialog
        contentClassName="md:max-w-lg max-w-full"
        trigger={
          <Button
            type="button"
            className="w-fit"
            variant="secondary"
            aria-label={`Ver lead ${row.first_name} ${row.last_name}`}
          >
            Ver
          </Button>
        }
      >
        {({ closeDialog }) => (
          <LeadDetailForm
            lead={row}
            onCancel={closeDialog}
            onSuccess={() => {
              closeDialog();
              on_success?.();
            }}
          />
        )}
      </CustomDialog>
    ),
  },
  deleteRowAction(row.id, on_success, {
    deleteFn: leadsService.delete,
    title: "Eliminar lead",
    description: "¿Eliminar este lead? Esta acción no se puede deshacer.",
    successToast: "Lead eliminado correctamente",
    errorToast: "Error al eliminar el lead",
  }),
];
