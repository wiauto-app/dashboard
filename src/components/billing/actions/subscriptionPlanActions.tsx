import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { billingPlansService, type SubscriptionPlan } from "../services/billingPlansService";
import { Button } from "@/components/ui/button";
import CustomAlertDialog from "@/components/ui/customAlertDialog";

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
        className="w-fit"
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
  {
    key: "publish-version",
    label: "Publicar versión",
    component: (
      <CustomAlertDialog
        title="Publicar versión del plan"
        description={`Se publicará la versión borrador de «${row.name}». Las suscripciones nuevas usarán estas capacidades.`}
        confirmText="Publicar"
        confirmVariant="default"
        onConfirm={async () => {
          const response = await billingPlansService.publishPlan(row.id);
          if (!response.ok) {
            toast.error(response.message || "No se pudo publicar la versión");
            return;
          }
          toast.success("Versión publicada");
          on_success?.();
        }}
        trigger={
          <Button type="button" className="w-fit" variant="secondary">
            Publicar versión
          </Button>
        }
      />
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
