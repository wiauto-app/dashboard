import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const leadColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Tipo",
    accessorKey: "type",
    type: "badge",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Nombre",
    accessorKey: "full_name",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Correo",
    accessorKey: "email",
    type: "text",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Teléfono",
    accessorKey: "phone",
    type: "text",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Estado",
    accessorKey: "status",
    type: "badge",
    sortable: false,
    modifiable: false,
  },
  {
    header: "Fecha",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
];
