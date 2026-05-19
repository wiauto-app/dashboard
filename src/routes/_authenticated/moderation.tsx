import { DynamicTable } from '@/components/dynamic-table/dynamic-table';
import { moderationActions } from '@/components/moderation/actions/moderationActions';
import { UsersFilter } from '@/components/users/users.filter';
import { usersColumns } from '@/components/users/usersColumns';
import { profileService } from '@/services/profiles/profileService';
import type { PaginatedResult } from '@/types/general.types';
import type { Profile, UserParams } from '@/types/profiles.types';
import { userParamsSchema } from '@/validations/queryParams/user-params.schema';
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/moderation')({
  component: RouteComponent,
  validateSearch: userParamsSchema,
  loader: async ({ deps }: { deps: UserParams }) =>
    profileService.getProfiles(deps),
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  const router = useRouter();
  const data = Route.useLoaderData() as PaginatedResult<Profile>;
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
      // form={<UserForm onSuccess={handleUserCreated} />}
      actions={(row: Profile) => moderationActions(row, handleUserCreated)}
    />
  )
}
