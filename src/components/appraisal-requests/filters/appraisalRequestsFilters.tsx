import { Controller, useForm } from "react-hook-form";
import { SearchIcon, XIcon } from "lucide-react";

import { AppraisalRequestPrioritySelector } from "@/components/dynamicSelectors/appraisalRequestPrioritySelector";
import { AppraisalRequestStatusSelector } from "@/components/dynamicSelectors/appraisalRequestStatusSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";

import type {
  AppraisalRequestPriority,
  AppraisalRequestStatus,
} from "../types/appraisal-request.types";

interface AppraisalRequestsFilterFormValues {
  status?: AppraisalRequestStatus;
  priority?: AppraisalRequestPriority;
}

const FILTER_QUERY_KEYS = ["status", "priority"] as const;

export const AppraisalRequestsFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange } = useFiltersManager({
    path: "/tasaciones",
  });

  const form = useForm<AppraisalRequestsFilterFormValues>({
    defaultValues: {
      status: (values.status as AppraisalRequestStatus | undefined) ?? undefined,
      priority:
        (values.priority as AppraisalRequestPriority | undefined) ?? undefined,
    },
  });

  const handleSubmit = (data: AppraisalRequestsFilterFormValues) => {
    handleChange("status", data.status || undefined);
    handleChange("priority", data.priority || undefined);
    setIsOpen(false);
  };

  const handleReset = () => {
    for (const key of FILTER_QUERY_KEYS) {
      handleChange(key, undefined);
    }
    form.reset({ status: undefined, priority: undefined });
    setIsOpen(false);
  };

  return (
    <form
      id="appraisal-requests-filter-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <FieldSet className="gap-3">
          <FieldLegend variant="label">Solicitud de tasación</FieldLegend>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="appraisal_request_status">Estado</Label>
                <AppraisalRequestStatusSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar estado"
                />
              </Field>
            )}
          />
          <Controller
            name="priority"
            control={form.control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="appraisal_request_priority">Prioridad</Label>
                <AppraisalRequestPrioritySelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar prioridad"
                />
              </Field>
            )}
          />
        </FieldSet>
      </FieldGroup>

      <div className="flex shrink-0 flex-row justify-end gap-2 border-t pt-3">
        <Button type="button" variant="outline" onClick={handleReset}>
          Limpiar
          <XIcon className="size-4" aria-hidden />
        </Button>
        <Button type="submit" form="appraisal-requests-filter-form">
          Buscar
          <SearchIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
};
