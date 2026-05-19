import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { permissionsColumns } from "@/components/permissions/permissionsColumns";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { permissionParamsSchema } from "@/components/permissions/schemas/permission-params.schema";
import {
  permissionService,
  type CreatePermissionDto,
  type UpdatePermissionDto,
} from "@/components/permissions/services/permissionService";
import type { Permission, PermissionParams } from "@/components/permissions/types/permission.type";
import { permissionActions } from "@/components/permissions/actions/permissionActions";
import { useInvalidateData } from "@/hooks/useInvalidateData";

export const Route = createFileRoute("/_authenticated/permissions")({
  component: RouteComponent,
  validateSearch: permissionParamsSchema,
  loader: async ({ deps }: { deps: PermissionParams }) =>
    await permissionService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<Permission>;
  const invalidateData = useInvalidateData("/_authenticated/permissions");
  return (
    <DynamicTable
      table_id="permissions"
      columns={permissionsColumns}
      data={data?.data ?? []}
      title="Permisos"
      route={Route}
      total={data?.total ?? 0}
      filters={<div>Filters</div>}
      form={
        <DefaultForm
          columns={permissionsColumns}
          findOneService={permissionService.findOne}
          createService={(data) =>
            permissionService.createPermission(
              data as CreatePermissionDto,
            )
          }
          updateService={(id, data) =>
            permissionService.updatePermission(
              id,
              data as UpdatePermissionDto,
            )
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Permiso creado correctamente",
            update_success: "Permiso actualizado correctamente",
            create_error: "Error al crear el permiso",
            update_error: "Error al actualizar el permiso",
          }}
        />
      }
      actions={(row: Permission) => permissionActions(row, invalidateData)}
    />
  );
}
