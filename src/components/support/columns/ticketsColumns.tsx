import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const ticketsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Título",
    accessorKey: "title",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Categoría",
    accessorKey: "category.name",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Estado",
    accessorKey: "status",
    type: "badge",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Descripción",
    accessorKey: "description",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Archivo",
    accessorKey: "file_url",
    type: "link",
    sortable: false,
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
