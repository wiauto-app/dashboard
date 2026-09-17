import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { leadColumns } from "@/components/leads/columns/leadColumns";
import { leadActions } from "@/components/leads/actions/leadActions";
import {
  leadsParamsSchema,
  type LeadsParams,
} from "@/components/leads/schemas/leads-params.schema";
import { leadsService, type Lead } from "@/components/leads/services/leadsService";
import { createFileRoute } from "@tanstack/react-router";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import type { PaginatedResult } from "@/types/general.types";

interface LeadRow extends Lead {
  full_name: string;
}

export const Route = createFileRoute("/_authenticated/leads")({
  component: RouteComponent,
  validateSearch: leadsParamsSchema,
  loader: async ({ deps }: { deps: LeadsParams }) => leadsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<Lead>;
  const invalidate_data = useInvalidateData("/_authenticated/leads");

  const rows: LeadRow[] = (data?.data ?? []).map((row) => ({
    ...row,
    full_name: `${row.first_name} ${row.last_name}`,
  }));

  return (
    <DynamicTable
      table_id="leads"
      columns={leadColumns}
      data={rows}
      title="Leads"
      route={Route}
      total={data?.total ?? 0}
      hideCreateButton
      actions={(row) => leadActions(row, invalidate_data)}
    />
  );
}
