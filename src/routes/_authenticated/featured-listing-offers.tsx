import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { featuredListingOfferColumns } from "@/components/billing/columns/featuredListingOfferColumns";
import { featuredListingOfferActions } from "@/components/billing/actions/featuredListingOfferActions";
import { FeaturedListingOfferForm } from "@/components/billing/forms/featuredListingOfferForm";
import {
  featuredListingOffersService,
  type FeaturedListingOffer,
} from "@/components/billing/services/featuredListingOffersService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute(
  "/_authenticated/featured-listing-offers",
)({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    featuredListingOffersService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<FeaturedListingOffer>;
  const rows = data?.data ?? [];
  const invalidate_data = useInvalidateData(
    "/_authenticated/featured-listing-offers",
  );

  return (
    <DynamicTable
      table_id="featured-listing-offers"
      columns={featuredListingOfferColumns}
      data={rows}
      title="Destacar anuncios"
      route={Route}
      total={data?.total ?? 0}
      form_size="lg"
      actions={(row) => featuredListingOfferActions(row, invalidate_data)}
      form={<FeaturedListingOfferForm />}
    />
  );
}
