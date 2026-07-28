import { createFileRoute } from "@tanstack/react-router";
import type { PaginatedResult } from "@/types/general.types";

import { appraisalRequestsActions } from "@/components/appraisal-requests/actions/appraisalRequestsActions";
import { appraisalRequestsColumns } from "@/components/appraisal-requests/columns/appraisalRequestsColumns";
import { get_appraisal_request_priority_label } from "@/components/appraisal-requests/constants/appraisal-request-priority.constants";
import { AppraisalRequestsFilter } from "@/components/appraisal-requests/filters/appraisalRequestsFilters";
import { AppraisalRequestForm } from "@/components/appraisal-requests/forms/appraisalRequestForm";
import {
  appraisalRequestsParamsSchema,
  type AppraisalRequestsParams,
} from "@/components/appraisal-requests/schemas/appraisal-requests-params.schema";
import { appraisalRequestsService } from "@/components/appraisal-requests/services/appraisalRequestsService";
import type { AppraisalRequestListItem } from "@/components/appraisal-requests/types/appraisal-request.types";
import { DynamicTable } from "@/components/dynamic-table/dynamic-table";
import { useInvalidateData } from "@/hooks/useInvalidateData";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";

interface AppraisalRequestTableRow extends AppraisalRequestListItem {
  priority_label: string;
}

export const Route = createFileRoute("/_authenticated/tasaciones")({
  component: RouteComponent,
  validateSearch: appraisalRequestsParamsSchema,
  loader: async ({ deps }: { deps: AppraisalRequestsParams }) =>
    appraisalRequestsService.findAll(deps),
  loaderDeps: ({ search }) => search,
});

function RouteComponent() {
  const data = Route.useLoaderData() as PaginatedResult<AppraisalRequestListItem>;
  const rows: AppraisalRequestTableRow[] = (data?.data ?? []).map((row) => ({
    ...row,
    priority_label: get_appraisal_request_priority_label(row.priority),
  }));
  const invalidateData = useInvalidateData("/_authenticated/tasaciones");
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  return (
    <DynamicTable
      table_id="appraisal-requests"
      columns={appraisalRequestsColumns}
      data={rows}
      title="Tasaciones"
      route={Route}
      total={data?.total ?? 0}
      filters={<AppraisalRequestsFilter />}
      form={
        <AppraisalRequestForm
          key={selectedId ?? "none"}
          requests={rows}
          onSuccess={invalidateData}
        />
      }
      form_size="lg"
      hideCreateButton
      actions={(row) => appraisalRequestsActions(row, invalidateData)}
    />
  );
}
