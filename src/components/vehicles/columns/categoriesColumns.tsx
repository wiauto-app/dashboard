import { defaultColumn } from "@/components/dynamic-table/defaultColumns";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";

export const categoriesColumns: DynamicTableColumn[] = [
  defaultColumn,
  {
    header: "Imagen",
    accessorKey: "image_url",
    type: "image",
    sortable: false,
    modifiable: true,
    bucketName: "files",
    image_upload_path: "categories",
  },
  {
    header: "Nombre",
    accessorKey: "name",
    type: "text",
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
