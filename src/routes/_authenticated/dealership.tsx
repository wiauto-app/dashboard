import { createFileRoute } from '@tanstack/react-router'
import { DynamicTable } from '@/components/dynamic-table/dynamic-table'
import { dealershipService } from '@/components/dealerships/services/dealershipService'
import type { PaginatedResult } from '@/types/general.types';
import type { Dealership, DealershipParams } from '@/components/dealerships/types/dealership.types';
import { dealershipColumns } from '@/components/dealerships/dealershipColumns';
import { dealershipParamsSchema } from '@/components/dealerships/schemas/dealership-params.schema';
import { DefaultForm } from '@/components/dynamic-table/defaultForm';
import { useInvalidateData } from '@/hooks/useInvalidateData';
import { dealershipActions } from '@/components/dealerships/actions/dealershipActions';

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
  return (
    <DynamicTable
      columns={dealershipColumns}
      data={response.data}
      title="Concesionarios"
      total={response.total}
      route={Route}
      form={
        <DefaultForm
          columns={dealershipColumns}
          findOneService={dealershipService.findOne}
          createService={(data) =>
            dealershipService.create(data as Dealership)
          }
          updateService={(id, data) =>
            dealershipService.update(id, data as Dealership)
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Concesionario creado correctamente",
            update_success: "Concesionario actualizado correctamente",
            create_error: "Error al crear el concesionario",
            update_error: "Error al actualizar el concesionario",
          }}
        />
      }
      actions={(row) => dealershipActions(row, invalidateData)}
    />
  )
}
