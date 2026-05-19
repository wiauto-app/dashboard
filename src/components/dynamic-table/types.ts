/** `accessorKey` admite rutas con punto, p. ej. `user.email` o `role.name`. */

import type { BucketName } from "@/services/files/filesService";

export type DynamicTableColumnType =
  | "badge"
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "date"
  | "boolean"
  | "image"
  | "array"
  | "link";
export interface DynamicTableColumn {
  header: string;
  accessorKey: string;
  type: DynamicTableColumnType;
  sortable?: boolean;
  showArrayItems?:boolean;
  modifiable?: boolean;
  arrayDisplayKey?: string;
  bucketName?: BucketName;
}

export interface DynamicTableAction {
  key: string;
  label: string;
  component: React.ReactNode;
}