import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { communitiesColumns } from "@/components/locations/columns/communitiesColumns";
import type { CommunityCatalogItem } from "@/components/locations/types/location.types";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import { communitiesService } from "@/components/vehicles/services/communitiesService";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/communities")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    communitiesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CommunityCatalogItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/communities");

  return (
    <DynamicTable
      table_id="communities_catalog"
      columns={communitiesColumns}
      data={rows}
      title="Comunidades autónomas"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      form={
        <DefaultForm
          columns={communitiesColumns}
          findOneService={communitiesService.findOne}
          createService={() =>
            Promise.reject(new Error("Creación no permitida"))
          }
          updateService={(id, payload) =>
            communitiesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            update_success: "Comunidad actualizada correctamente",
            update_error: "Error al actualizar la comunidad",
          }}
        />
      }
    />
  );
}
