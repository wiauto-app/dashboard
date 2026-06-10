import { defaultColumn } from "../dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "../dynamic-table/types";

export const usersColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Avatar",
    accessorKey: "avatar_url",
    type: "image",
    sortable: false,
  },
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
    sortable: true,
  },
  {
    header: "Apellido",
    accessorKey: "last_name",
    type: "text",
    sortable: true,
  },
  {
    header: "Email",
    accessorKey: "user.email",
    type: "text",
    sortable: false,
  },
  {
    header: "Proveedor",
    accessorKey: "user.provider",
    type: "text",
    sortable: false,
  },
  {
    header: "Último inicio de sesión",
    accessorKey: "user.last_sign_in",
    type: "date",
    sortable: false,
  },
  {
    header: "Fecha de creación",
    accessorKey: "user.created_at",
    type: "date",
    sortable: false,
  },
  {
    header: "Fecha de suspensión",
    accessorKey: "user.suspended_at",
    type: "date",
    sortable: false,
  },
  {
    header: "Razón de suspensión",
    accessorKey: "user.suspension_reason",
    type: "text",
    sortable: false,
  },
  {
    header: "Fecha de reactivación",
    accessorKey: "user.suspension_end_time",
    type: "date",
    sortable: false,
  },
  {
    header: "Doble factor activado",
    accessorKey: "user.two_factor_enabled",
    type: "boolean",
    sortable: false,
  },
  {
    header: "Rol",
    accessorKey: "role.name",
    type: "badge",
    sortable: false,
  },
];
