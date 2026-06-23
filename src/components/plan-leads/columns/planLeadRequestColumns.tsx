import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const planLeadRequestColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
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
    header: "Mensaje",
    accessorKey: "message",
    type: "text",
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
