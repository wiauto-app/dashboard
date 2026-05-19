import type { DynamicTableColumn } from "../dynamic-table/types";
import { defaultColumn } from "../dynamic-table/defaultColumns";

export const rolesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
  },
  {
    header: "Administrador",
    accessorKey: "is_admin",
    type: "boolean",
    sortable: true,
  },
  {
    header: "Desarrollador",
    accessorKey: "is_developer",
    type: "boolean",
    sortable: true,
  },

  {
    header: "Fecha de creación",
    accessorKey: "created_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Fecha de actualización",
    accessorKey: "updated_at",
    type: "date",
    sortable: true,
    modifiable: false,
  },
  {
    header: "Permisos",
    accessorKey: "roles_permissions",
    type: "array",
    sortable: false,
    arrayDisplayKey: "permission.name",
  },
];
