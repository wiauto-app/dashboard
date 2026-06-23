import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { planLeadRequestColumns } from "@/components/plan-leads/columns/planLeadRequestColumns";
import {
  planLeadRequestsParamsSchema,
  type PlanLeadRequestsParams,
} from "@/components/plan-leads/schemas/plan-lead-requests-params.schema";
import { planLeadRequestsService } from "@/components/plan-leads/services/planLeadRequestsService";
import type { PlanLeadRequest } from "@/components/plan-leads/services/planLeadRequestsService";
import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

export const Route = createFileRoute("/_authenticated/plan-lead-requests")({
  component: RouteComponent,
  validateSearch: planLeadRequestsParamsSchema,
  loader: async ({ deps }: { deps: PlanLeadRequestsParams }) =>
    planLeadRequestsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<PlanLeadRequest>;
  const rows = data?.data ?? [];

  return (
    <DynamicTable
      table_id="plan-lead-requests"
      columns={planLeadRequestColumns}
      data={rows}
      title="Solicitudes de planes"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
    />
  );
}
