import { CustomDialog } from "@/components/dynamic-table/customDialog";
import { Button } from "@/components/ui/button";
import type { PlanContactLead } from "../services/planContactLeadsService";
import { PlanContactLeadDetailForm } from "../forms/planContactLeadDetailForm";

export const planContactLeadActions = (
  row: PlanContactLead,
  on_success?: () => void,
) => [
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
            aria-label={`Ver lead de contacto ${row.phone}`}
          >
            Ver
          </Button>
        }
      >
        {({ closeDialog }) => (
          <PlanContactLeadDetailForm
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
];
