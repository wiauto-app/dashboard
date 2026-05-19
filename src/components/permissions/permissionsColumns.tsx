import { defaultColumn } from "../dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "../dynamic-table/types";


export const permissionsColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
  },
  {
    header: "Clave",
    accessorKey: "key",
    type: "text",
    sortable: true,
  },
  {
    header: "Valor",
    accessorKey: "value",
    type: "text",
    sortable: true,
  },
];