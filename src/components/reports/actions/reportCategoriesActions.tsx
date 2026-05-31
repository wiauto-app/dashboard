import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";
import type { ReportCategoryItem } from "../types/report-category.types";
import { reportCategoriesService } from "../services/reportCategoriesService";

export const reportCategoriesActions = (
  row: ReportCategoryItem,
  onSuccess?: () => void,
) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: reportCategoriesService.delete,
    title: "Eliminar categoría",
    description: `¿Eliminar la categoría «${row.name}»? Esta acción no se puede deshacer.`,
    successToast: "Categoría eliminada correctamente",
    errorToast: "Error al eliminar la categoría",
  }),
];
