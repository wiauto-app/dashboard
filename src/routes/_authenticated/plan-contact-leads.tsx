import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { planContactLeadColumns } from "@/components/plan-contact-leads/columns/planContactLeadColumns";
import { planContactLeadActions } from "@/components/plan-contact-leads/actions/planContactLeadActions";
import {
  planContactLeadsParamsSchema,
  type PlanContactLeadsParams,
} from "@/components/plan-contact-leads/schemas/plan-contact-leads-params.schema";
import {
  PLAN_CONTACT_LEAD_STATUS_LABELS,
  planContactLeadsService,
  type PlanContactLead,
  type PlanContactLeadStatus,
} from "@/components/plan-contact-leads/services/planContactLeadsService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import type { PaginatedResult } from "@/types/general.types";

interface PlanContactLeadRow extends PlanContactLead {
  status_label: string;
}

export const Route = createFileRoute("/_authenticated/plan-contact-leads")({
  component: RouteComponent,
  validateSearch: planContactLeadsParamsSchema,
  loader: async ({ deps }: { deps: PlanContactLeadsParams }) =>
    planContactLeadsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<PlanContactLead>;
  const invalidate_data = useInvalidateData(
    "/_authenticated/plan-contact-leads",
  );

  const rows: PlanContactLeadRow[] = (data?.data ?? []).map((row) => ({
    ...row,
    status_label:
      PLAN_CONTACT_LEAD_STATUS_LABELS[row.status as PlanContactLeadStatus] ??
      row.status,
  }));

  return (
    <DynamicTable
      table_id="plan-contact-leads"
      columns={planContactLeadColumns}
      data={rows}
      title="Leads de contacto (planes)"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      actions={(row) => planContactLeadActions(row, invalidate_data)}
    />
  );
}
