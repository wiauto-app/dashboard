import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { billingPlansService, type SubscriptionPlan } from "../services/billingPlansService";

export const subscriptionPlanActions = (
  row: SubscriptionPlan,
  on_success?: () => void,
) => [
  deleteRowAction(row.id, on_success, {
    deleteFn: billingPlansService.delete,
    title: "Eliminar plan",
    description: "¿Estás seguro de querer eliminar este plan de suscripción?",
    successToast: "Plan eliminado correctamente",
    errorToast: "Error al eliminar el plan",
  }),
];
