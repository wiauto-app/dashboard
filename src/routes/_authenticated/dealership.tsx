import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const { id: filtered_id } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const table = (
    <DynamicTable
      table_id="dealerships"
      columns={dealershipColumns}
      data={response.data}
      form_size='5xl'
      title="Concesionarios"
      total={response.total}
      route={Route}
      // virtualization={{ enabled: true, height: 600 }}
      form={
        <DealershipForm
          key={selectedId ?? "create"}
          onSuccess={invalidateData}
        />
      }
      actions={(row) => dealershipActions(row, invalidateData)}
    />
  );

  if (!filtered_id) {
    return table;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
        <span className="text-muted-foreground">
          Mostrando un concesionario concreto.
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigate({ search: (prev: DealershipParams) => ({ ...prev, id: undefined }) });
          }}
        >
          <XIcon className="size-4" />
          Ver todos
        </Button>
      </div>
      {table}
    </div>
  );
}
