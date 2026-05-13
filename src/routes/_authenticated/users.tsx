import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { profileService } from "@/services/profiles/profileService";
import type { DynamicTableColumn } from "@/components/dynamic-table/types";
import type { UserParams } from "@/types/profiles.types";
import { UsersFilter } from "@/components/users/users.filter";
import { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import { UserForm } from "@/components/users/userForm";

export const Route = createFileRoute("/_authenticated/users")({
  component: RouteComponent,
  validateSearch: userParamsSchema,
  loader: async ({ deps }: { deps: UserParams }) =>
    profileService.getProfiles(deps),
  loaderDeps: ({ search }) => search,
});

const columns: DynamicTableColumn[] = [
  {
    header: "Seleccionar",
    accessorKey: "select",
    type: "checkbox",
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
    header: "Rol",
    accessorKey: "role",
    type: "badge",
    sortable: true,
  },
];

function RouteComponent() {
  const router = useRouter();
  const data = Route.useLoaderData();

  const handleUserCreated = () => {
    void router.invalidate({
      filter: (match) => match.routeId === "/_authenticated/users",
    });
  };

  return (
    <DynamicTable
      columns={columns}
      data={data?.data ?? []}
      title="Usuarios"
      route={Route}
      total={data?.total ?? 0}
      filters={<UsersFilter />}
      form={<UserForm onSuccess={handleUserCreated} />}
    />
  );
}
