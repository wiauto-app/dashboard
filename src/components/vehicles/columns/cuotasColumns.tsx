import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const cuotasColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre del plan",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Valor (p. ej. meses)",
    accessorKey: "value",
    type: "number",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Slug",
    accessorKey: "slug",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Creado",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Actualizado",
    accessorKey: "updated_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
];
