import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { billingPlansService, type SubscriptionPlan } from "../services/billingPlansService";
import { Button } from "@/components/ui/button";

export const subscriptionPlanActions = (
  row: SubscriptionPlan,
  on_success?: () => void,
) => [
  {
    key: "sync-stripe",
    label: "Sync Stripe",
    component: (
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start"
        onClick={async () => {
          const response = await billingPlansService.syncStripe(row.id);
          if (!response.ok) {
            toast.error(response.message || "Error al sincronizar");
            return;
          }
          toast.success("Sincronizado con Stripe");
          on_success?.();
        }}
      >
        Sincronizar con Stripe
      </Button>
    ),
  },
  deleteRowAction(row.id, on_success, {
    deleteFn: billingPlansService.delete,
    title: "Eliminar plan",
    description: "¿Estás seguro de querer eliminar este plan de suscripción?",
    successToast: "Plan eliminado correctamente",
    errorToast: "Error al eliminar el plan",
  }),
];
