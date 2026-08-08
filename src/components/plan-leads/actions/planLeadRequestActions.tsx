import { CustomDialog } from "@/components/dynamic-table/customDialog";
import { Button } from "@/components/ui/button";
import type { PlanLeadRequest } from "../services/planLeadRequestsService";
import { PlanLeadProposalForm } from "../forms/planLeadProposalForm";

export const planLeadRequestActions = (
  row: PlanLeadRequest,
  on_success?: () => void,
) => [
  {
    key: "proposal",
    label: "Propuesta",
    component: (
      <CustomDialog
        contentClassName="md:max-w-4xl max-w-full"
        trigger={
          <Button type="button" className="w-fit" variant="secondary">
            Ver / Propuesta
          </Button>
        }
      >
        {({ closeDialog }) => (
          <PlanLeadProposalForm
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
