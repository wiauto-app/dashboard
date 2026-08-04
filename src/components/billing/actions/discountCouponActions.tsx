import { toast } from "sonner";

import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import { Button } from "@/components/ui/button";
import {
  discountCouponsService,
  type DiscountCoupon,
} from "../services/discountCouponsService";

const copy_code = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code);
    toast.success("Código copiado");
  } catch {
    toast.error("No se pudo copiar el código");
  }
};

export const discountCouponActions = (
  row: DiscountCoupon,
  on_success?: () => void,
) => [
  {
    key: "copy-code",
    label: "Copiar código",
    component: (
      <Button
        type="button"
        className="w-fit"
        variant="outline"
        onClick={() => copy_code(row.code)}
        aria-label={`Copiar código ${row.code}`}
      >
        Copiar código
      </Button>
    ),
  },
  {
    key: "toggle-active",
    label: row.active ? "Desactivar" : "Activar",
    component: (
      <Button
        type="button"
        className="w-fit"
        variant="secondary"
        onClick={async () => {
          const response = await discountCouponsService.update({
            id: row.id,
            active: !row.active,
          });
          if (!response.ok) {
            toast.error(response.message || "No se pudo actualizar el cupón");
            return;
          }
          toast.success(row.active ? "Cupón desactivado" : "Cupón activado");
          on_success?.();
        }}
      >
        {row.active ? "Desactivar" : "Activar"}
      </Button>
    ),
  },
  deleteRowAction(row.id, on_success, {
    deleteFn: discountCouponsService.delete,
    title: "Eliminar cupón",
    description: "¿Seguro que quieres eliminar este cupón?",
    successToast: "Cupón eliminado",
    errorToast: "Error al eliminar el cupón",
  }),
];
