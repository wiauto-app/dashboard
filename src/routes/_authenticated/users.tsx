import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { profileService } from "@/services/profiles/profileService";
import type { Profile, UserParams } from "@/types/profiles.types";
import { UsersFilter } from "@/components/users/users.filter";
import { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import { UserForm } from "@/components/users/userForm";
import { usersColumns } from "@/components/users/usersColumns";
import { userActions } from "@/services/users/userActions";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute('/_authenticated/users')({
  component: RouteComponent,
  validateSearch: userParamsSchema,
  loader: async ({ deps }: { deps: UserParams }) =>
    profileService.getProfiles(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const router = useRouter();
  const data = Route.useLoaderData() as PaginatedResult<Profile>;
  console.log(data);
  const handleUserCreated = () => {
    void router.invalidate({
      filter: (match) => match.routeId === '/_authenticated/users',
    });
  };

  return (
    <DynamicTable
      table_id="users"
      columns={usersColumns}
      data={data?.data ?? []}
      title="Usuarios"
      route={Route}
      total={data?.total ?? 0}
      filters={<UsersFilter />}
      form={<UserForm onSuccess={handleUserCreated} />}
      actions={(row: Profile) => userActions(row, handleUserCreated)}
    />
  );
}
