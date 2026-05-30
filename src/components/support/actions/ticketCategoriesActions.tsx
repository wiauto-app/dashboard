import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { TicketCategoryItem } from "../types/ticket-category.types";
import { ticketCategoriesService } from "../services/ticketCategoriesService";

export const ticketCategoriesActions = (
  row: TicketCategoryItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: ticketCategoriesService.delete,
    title: "Eliminar categoría",
    description: `¿Eliminar la categoría «${row.name}»? Esta acción no se puede deshacer.`,
    successToast: "Categoría eliminada correctamente",
    errorToast: "Error al eliminar la categoría",
  }),
];
