import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import {
  featuresService,
  type CreateFeatureDto,
  type UpdateFeatureDto,
} from "@/components/vehicles/services/featuresService";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";
import type { Feature } from "@/components/vehicles/types/vehicles.types";
import { featuresColumns } from "@/components/vehicles/columns/featuresColumns";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { featuresActions } from "@/components/vehicles/actions/featuresActions";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";

export const Route = createFileRoute("/_authenticated/features")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    featuresService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<Feature>;
  const features = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/features");
  return (
    <DynamicTable
      table_id="features"
      columns={featuresColumns}
      data={features}
      title="Características"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => featuresActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={featuresColumns}
          findOneService={featuresService.findOne}
          createService={(data) =>
            featuresService.create(data as CreateFeatureDto)
          }
          updateService={(id, data) =>
            featuresService.update({
              id,
              ...(data as Record<string, unknown>),
            } as UpdateFeatureDto)
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Característica creada correctamente",
            update_success: "Característica actualizada correctamente",
            create_error: "Error al crear la característica",
            update_error: "Error al actualizar la característica",
          }}
        />
      }
    />
  );
}
