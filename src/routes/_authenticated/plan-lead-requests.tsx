import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { planLeadRequestColumns } from "@/components/plan-leads/columns/planLeadRequestColumns";
import { planLeadRequestActions } from "@/components/plan-leads/actions/planLeadRequestActions";
import {
  planLeadRequestsParamsSchema,
  type PlanLeadRequestsParams,
} from "@/components/plan-leads/schemas/plan-lead-requests-params.schema";
import {
  PLAN_LEAD_STATUS_LABELS,
  planLeadRequestsService,
  type PlanLeadRequest,
  type PlanLeadStatus,
} from "@/components/plan-leads/services/planLeadRequestsService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import type { PaginatedResult } from "@/types/general.types";

interface PlanLeadRequestRow extends PlanLeadRequest {
  status_label: string;
}

export const Route = createFileRoute("/_authenticated/plan-lead-requests")({
  component: RouteComponent,
  validateSearch: planLeadRequestsParamsSchema,
  loader: async ({ deps }: { deps: PlanLeadRequestsParams }) =>
    planLeadRequestsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<PlanLeadRequest>;
  const invalidate_data = useInvalidateData("/_authenticated/plan-lead-requests");

  const rows: PlanLeadRequestRow[] = (data?.data ?? []).map((row) => ({
    ...row,
    status_label:
      PLAN_LEAD_STATUS_LABELS[row.status as PlanLeadStatus] ?? row.status,
  }));

  return (
    <DynamicTable
      table_id="plan-lead-requests"
      columns={planLeadRequestColumns}
      data={rows}
      title="Solicitudes de planes"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      actions={(row) => planLeadRequestActions(row, invalidate_data)}
    />
  );
}
