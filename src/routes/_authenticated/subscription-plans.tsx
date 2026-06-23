import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { subscriptionPlanColumns } from "@/components/billing/columns/subscriptionPlanColumns";
import { billingPlansService } from "@/components/billing/services/billingPlansService";
import { SubscriptionPlanForm } from "@/components/billing/forms/subscriptionPlanForm";
import { subscriptionPlanActions } from "@/components/billing/actions/subscriptionPlanActions";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { vehicleCatalogParamsSchema } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { VehicleCatalogParams } from "@/components/vehicles/schemas/vehicle-catalog-params.schema";
import type { PaginatedResult } from "@/types/general.types";
import type { SubscriptionPlan } from "@/components/billing/services/billingPlansService";

export const Route = createFileRoute("/_authenticated/subscription-plans")({
  component: RouteComponent,
  validateSearch: vehicleCatalogParamsSchema,
  loader: async ({ deps }: { deps: VehicleCatalogParams }) =>
    billingPlansService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<SubscriptionPlan>;
  const rows = data?.data ?? [];
  const invalidate_data = useInvalidateData("/_authenticated/subscription-plans");

  return (
    <DynamicTable
      table_id="subscription-plans"
      columns={subscriptionPlanColumns}
      data={rows}
      title="Planes de suscripción"
      route={Route}
      total={data?.total ?? 0}
      form_size="5xl"
      actions={(row) => subscriptionPlanActions(row, invalidate_data)}
      form={<SubscriptionPlanForm />}
    />
  );
}
