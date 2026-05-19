import { createFileRoute } from '@tanstack/react-router'
import { DynamicTable } from '@/components/dynamic-table/dynamic-table';
import { vehiclesSchema } from '@/components/vehicles/schemas/vehicles-params.schema';
import type { Vehicle, VehiclesParams } from '@/components/vehicles/types/vehicles.types';
import { vehiclesService } from '@/components/vehicles/services/vehiclesService';
import type { PaginatedResult } from '@/types/general.types';
import { vehiclesColumns } from '@/components/vehicles/vehiclesColumns';
import { VehiclesFilter } from '@/components/vehicles/filters/vehicles.filters';
import { VehicleForm } from '@/components/vehicles/forms/vehicleForm';

export const Route = createFileRoute('/_authenticated/vehicles')({
  component: RouteComponent,
  validateSearch: vehiclesSchema,
  loader: async ({ deps }: { deps: VehiclesParams }) => {
    const response = await vehiclesService.findAll(deps);
    return response;
  },
  loaderDeps: ({ search }) => search,
})

function RouteComponent() {
  const response = Route.useLoaderData() as PaginatedResult<Vehicle>;
  return (
    <DynamicTable
      table_id="vehicles"
      columns={vehiclesColumns}
      data={response?.data ?? []}
      title="Anuncios"
      route={Route}
      total={response?.total ?? 0}
      filters={<VehiclesFilter />}
      form={<VehicleForm />}
      form_size="5xl"
    />
  )
}
