import type { ColorCatalogItem } from "../types/catalog.types";
import { colorsService } from "../services/colorsService";
import { deleteRowAction } from "@/components/dynamic-table/deleteResourceDialog";

export const colorsActions = (row: ColorCatalogItem, onSuccess?: () => void) => [
  deleteRowAction(row.id, onSuccess, {
    deleteFn: colorsService.delete,
    title: "Eliminar color",
    description:
      "¿Eliminar este color del catálogo? Los anuncios que lo usan pueden dejar de mostrarlo.",
    successToast: "Color eliminado correctamente",
    errorToast: "Error al eliminar el color",
  }),
];
