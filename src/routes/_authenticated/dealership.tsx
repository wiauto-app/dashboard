import { createFileRoute } from '@tanstack/react-router'
import { DynamicTable } from '@/components/dynamic-table/dynamic-table'
import { dealershipService } from '@/components/dealerships/services/dealershipService'
import type { PaginatedResult } from '@/types/general.types';
import type { Dealership, DealershipParams } from '@/components/dealerships/types/dealership.types';
import { dealershipColumns } from '@/components/dealerships/dealershipColumns';
import { dealershipParamsSchema } from '@/components/dealerships/schemas/dealership-params.schema';
import { DealershipForm } from '@/components/dealerships/forms/dealershipForm';
import { useInvalidateData } from '@/hooks/useInvalidateData';
import { dealershipActions } from '@/components/dealerships/actions/dealershipActions';
import { useSelectedIdStore } from '@/stores/useSelectedIdStore';

export const Route = createFileRoute('/_authenticated/dealership')({
  component: RouteComponent,
  validateSearch: dealershipParamsSchema,
  loader: async ({ deps }: { deps: DealershipParams }) => {
    const response = await dealershipService.findAll(deps);
    return response;
  },
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  const response = Route.useLoaderData() as PaginatedResult<Dealership>; 
  const invalidateData = useInvalidateData('/_authenticated/dealership');
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  return (
    <DynamicTable
      columns={dealershipColumns}
      data={response.data}
      form_size='5xl'
      title="Concesionarios"
      total={response.total}
      route={Route}
      form={
        <DealershipForm
          key={selectedId ?? "create"}
          onSuccess={invalidateData}
        />
      }
      actions={(row) => dealershipActions(row, invalidateData)}
    />
  )
}
