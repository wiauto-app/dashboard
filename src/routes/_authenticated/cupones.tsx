import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { discountCouponColumns } from "@/components/billing/columns/discountCouponColumns";
import { discountCouponActions } from "@/components/billing/actions/discountCouponActions";
import { DiscountCouponForm } from "@/components/billing/forms/discountCouponForm";
import { discountCouponsService } from "@/components/billing/services/discountCouponsService";
import type { DiscountCoupon } from "@/components/billing/services/discountCouponsService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/cupones")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    discountCouponsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<DiscountCoupon>;
  const rows = data?.data ?? [];
  const invalidate_data = useInvalidateData("/_authenticated/cupones");

  return (
    <DynamicTable
      table_id="discount-coupons"
      columns={discountCouponColumns}
      data={rows}
      title="Cupones"
      route={Route}
      total={data?.total ?? 0}
      form_size="lg"
      actions={(row) => discountCouponActions(row, invalidate_data)}
      form={<DiscountCouponForm />}
    />
  );
}
