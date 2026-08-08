import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { Button } from "@/components/ui/button";
import {
  assistantCreditPacksService,
  type AssistantCreditPack,
} from "../services/assistantCreditPacksService";

export const assistantCreditPackActions = (
  row: AssistantCreditPack,
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
          const response = await assistantCreditPacksService.syncStripe(row.id);
          if (!response.ok) {
            toast.error(response.message || "Error al sincronizar");
            return;
          }
          toast.success("Pack sincronizado con Stripe");
          on_success?.();
        }}
        aria-label={`Sincronizar pack ${row.title} con Stripe`}
      >
        Sincronizar con Stripe
      </Button>
    ),
  },
  deleteRowAction(row.id, on_success, {
    deleteFn: assistantCreditPacksService.delete,
    title: "Eliminar pack",
    description: "¿Seguro que quieres eliminar este pack de consultas?",
    successToast: "Pack eliminado",
    errorToast: "Error al eliminar el pack",
  }),
];
