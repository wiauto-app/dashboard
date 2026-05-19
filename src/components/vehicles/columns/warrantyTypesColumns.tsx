import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const warrantyTypesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
    modifiable: true,
  },
  {
    header: "Descripción",
    accessorKey: "description",
    type: "textarea",
    sortable: false,
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
