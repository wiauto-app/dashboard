import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { billingPlansService, type SubscriptionPlan } from "../services/billingPlansService";
import { Button } from "@/components/ui/button";

const copy_checkout_link = async (plan_id: string) => {
  const response = await billingPlansService.createCheckoutLink(plan_id);
  if (!response.ok || !response.data?.checkout_url) {
    toast.error(response.message || "No se pudo generar el enlace de suscripción");
    return;
  }

  try {
    await navigator.clipboard.writeText(response.data.checkout_url);
    toast.success("Enlace de suscripción copiado");
  } catch {
    toast.error("No se pudo copiar el enlace al portapapeles");
  }
};

export const subscriptionPlanActions = (
  row: SubscriptionPlan,
  on_success?: () => void,
) => [
  ...(row.is_custom
    ? [
        {
          key: "copy-checkout-link",
          label: "Copiar enlace",
          component: (
            <Button
              type="button"
              className="w-fit"
              variant="outline"
              onClick={() => copy_checkout_link(row.id)}
            >
              Copiar enlace de suscripción
            </Button>
          ),
        },
      ]
    : []),
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
  deleteRowAction(row.id, on_success, {
    deleteFn: billingPlansService.delete,
    title: "Eliminar plan",
    description: "¿Estás seguro de querer eliminar este plan de suscripción?",
    successToast: "Plan eliminado correctamente",
    errorToast: "Error al eliminar el plan",
  }),
];
