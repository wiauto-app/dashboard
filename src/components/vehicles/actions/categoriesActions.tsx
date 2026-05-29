import type { CategoryItem } from "../types/category.types";
import { categoriesService } from "../services/categoriesService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const categoriesActions = (
  row: CategoryItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: categoriesService.delete,
    title: "Eliminar categoría",
    description: `¿Eliminar la categoría «${row.name}»? Esta acción no se puede deshacer.`,
    successToast: "Categoría eliminada correctamente",
    errorToast: "Error al eliminar la categoría",
  }),
];
