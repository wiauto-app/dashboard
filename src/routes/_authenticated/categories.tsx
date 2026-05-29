import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { DefaultForm } from "@/components/dynamic-table/defaultForm";
import { categoriesActions } from "@/components/vehicles/actions/categoriesActions";
import { categoriesColumns } from "@/components/vehicles/columns/categoriesColumns";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import { categoriesService } from "@/components/vehicles/services/categoriesService";
import type { CategoryItem } from "@/components/vehicles/types/category.types";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/categories")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    categoriesService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<CategoryItem>;
  const rows = data?.data ?? [];
  const invalidateData = useInvalidateData("/_authenticated/categories");

  return (
    <DynamicTable
      table_id="categories"
      columns={categoriesColumns}
      data={rows}
      title="Categorías"
      route={Route}
      total={data?.total ?? 0}
      actions={(row) => categoriesActions(row, invalidateData)}
      form={
        <DefaultForm
          columns={categoriesColumns}
          findOneService={categoriesService.findOne}
          createService={(payload) =>
            categoriesService.create(
              payload as { name: string; image_url?: string | null },
            )
          }
          updateService={(id, payload) =>
            categoriesService.update({
              id,
              ...(payload as Record<string, unknown>),
            })
          }
          onMutationSuccess={invalidateData}
          messages={{
            create_success: "Categoría creada correctamente",
            update_success: "Categoría actualizada correctamente",
            create_error: "Error al crear la categoría",
            update_error: "Error al actualizar la categoría",
          }}
        />
      }
    />
  );
}
