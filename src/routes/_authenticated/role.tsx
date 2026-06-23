import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { rolesService } from "@/components/roles/services/rolesService";
import { createFileRoute } from "@tanstack/react-router";
import type { Role } from "@/components/roles/types/role.types";
import { rolesColumns } from "@/components/roles/rolesColumns";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { rolesParamsSchema } from "@/components/roles/schemas/roles-params.schema";
import type { RolesParams } from "@/components/roles/types/role.types";
import type { PaginatedResult } from "@/types/general.types";
import { roleActions } from "@/components/roles/actions/roleActions";
import { RoleForm } from "@/components/roles/forms/roleForm";
export const Route = createFileRoute('/_authenticated/role')({
  component: RouteComponent,
  validateSearch: rolesParamsSchema,
  loader: async ({ deps }: { deps: RolesParams }) => {
    const response = await rolesService.findAll(deps);
    return response;
  },
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const response = Route.useLoaderData() as PaginatedResult<Role>;
  const roles = response.data;
  const invalidateData = useInvalidateData('/_authenticated/role');
  return (
    <DynamicTable
      columns={rolesColumns}
      data={roles}
      title="Roles"
      form_size='5xl'
      total={response.total}
      route={Route}
      form={
        <RoleForm onSuccess={invalidateData} />
        // <DefaultForm
        //   columns={rolesColumns}
        //   findOneService={async (id) => {
        //     const response = await rolesService.findOne(id);
        //     return response;
        //   }}
        //   createService={async (data: Role) => {
        //     const response = await rolesService.create(data);
        //     if (response.ok) {
        //       toast.success("Rol creado correctamente");
        //       invalidateData();
        //     } else {
        //       toast.error(response.message || "Error al crear el rol");
        //     }
        //   }}
        //   updateService={async (id, data: Role) => {
        //     const response = await rolesService.update(id, data);
        //     if (response.ok) {
        //       toast.success("Rol actualizado correctamente");
        //       invalidateData();
        //     } else {
        //       toast.error(response.message || "Error al actualizar el rol");
        //     }
        //   }}
        // />
      }
      actions={(row) => roleActions(row, invalidateData)}
    />
  );
}
