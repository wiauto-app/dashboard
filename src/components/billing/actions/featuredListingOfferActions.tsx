import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { Button } from "@/components/ui/button";
import {
  featuredListingOffersService,
  type FeaturedListingOffer,
} from "../services/featuredListingOffersService";

export const featuredListingOfferActions = (
  row: FeaturedListingOffer,
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
          const response = await featuredListingOffersService.syncStripe(
            row.id,
          );
          if (!response.ok) {
            toast.error(response.message || "Error al sincronizar");
            return;
          }
          toast.success("Oferta sincronizada con Stripe");
          on_success?.();
        }}
        aria-label={`Sincronizar oferta ${row.title} con Stripe`}
      >
        Sincronizar con Stripe
      </Button>
    ),
  },
  deleteRowAction(row.id, on_success, {
    deleteFn: featuredListingOffersService.delete,
    title: "Eliminar oferta",
    description: "¿Seguro que quieres eliminar esta oferta de destacar?",
    successToast: "Oferta eliminada",
    errorToast: "Error al eliminar la oferta",
  }),
];
