import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const reportsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Título",
    accessorKey: "title",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Tipo",
    accessorKey: "target_type",
    type: "badge",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Objetivo",
    accessorKey: "target_label",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Denunciante",
    accessorKey: "reporter_label",
    type: "text",
    sortable: false,
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
