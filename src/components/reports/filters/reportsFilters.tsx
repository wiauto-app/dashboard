import { ReportCategoriesSelector } from "@/components/dynamicSelectors/reportCategoriesSelector";
import { ReportStatusSelector } from "@/components/dynamicSelectors/reportStatusSelector";
import { ReportTargetTypeSelector } from "@/components/dynamicSelectors/reportTargetTypeSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";
import { SearchIcon, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { ReportStatus, ReportTargetType } from "../types/report.types";

type ReportsFilterFormValues = {
  status?: ReportStatus;
  target_type?: ReportTargetType;
  category_id?: string;
};

const FILTER_QUERY_KEYS = ["status", "target_type", "category_id"] as const;

export const ReportsFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange } = useFiltersManager({
    path: "/reports",
  });

  const form = useForm<ReportsFilterFormValues>({
    defaultValues: {
      status: (values.status as ReportStatus | undefined) ?? undefined,
      target_type:
        (values.target_type as ReportTargetType | undefined) ?? undefined,
      category_id: values.category_id ?? "",
    },
  });

  const selected_target_type = form.watch("target_type");

  const handleSubmit = (data: ReportsFilterFormValues) => {
    handleChange("status", data.status || undefined);
    handleChange("target_type", data.target_type || undefined);
    handleChange("category_id", data.category_id?.trim() || undefined);
    setIsOpen(false);
  };

  const handleReset = () => {
    for (const key of FILTER_QUERY_KEYS) {
      handleChange(key, undefined);
    }
    form.reset({
      status: undefined,
      target_type: undefined,
      category_id: "",
    });
    setIsOpen(false);
  };

  return (
    <form
      id="reports-filter-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <FieldSet className="gap-3">
          <FieldLegend variant="label">Denuncia</FieldLegend>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="report_status">Estado</Label>
                <ReportStatusSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar estado"
                />
              </Field>
            )}
          />
          <Controller
            name="target_type"
            control={form.control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="report_target_type">Tipo de objetivo</Label>
                <ReportTargetTypeSelector
                  value={field.value}
                  onValueChange={(next_value) => {
                    field.onChange(next_value);
                    form.setValue("category_id", "");
                  }}
                  include_all_option
                  placeholder="Seleccionar tipo"
                />
              </Field>
            )}
          />
          <Controller
            name="category_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="report_category_id">Categoría</Label>
                <ReportCategoriesSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  targetType={selected_target_type}
                  ariaInvalid={fieldState.invalid}
                />
                {field.value ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-auto px-0 text-muted-foreground"
                    onClick={() => field.onChange(undefined)}
                  >
                    Quitar categoría
                  </Button>
                ) : null}
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
        <Button type="submit" form="reports-filter-form">
          Buscar
          <SearchIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
};
