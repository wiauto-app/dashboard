import { TicketCategoriesSelector } from "@/components/dynamicSelectors/ticketCategoriesSelector";
import { TicketStatusSelector } from "@/components/dynamicSelectors/ticketStatusSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { useFiltersManager } from "@/hooks/useFiltersManager";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";
import { SearchIcon, XIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import type { TicketStatus } from "../types/ticket.types";

type TicketsFilterFormValues = {
  status?: TicketStatus;
  category_id?: string;
};

const FILTER_QUERY_KEYS = ["status", "category_id"] as const;

export const TicketsFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange } = useFiltersManager({
    path: "/tickets",
  });

  const form = useForm<TicketsFilterFormValues>({
    defaultValues: {
      status: (values.status as TicketStatus | undefined) ?? undefined,
      category_id: values.category_id ?? "",
    },
  });

  const handleSubmit = (data: TicketsFilterFormValues) => {
    handleChange("status", data.status || undefined);
    handleChange("category_id", data.category_id?.trim() || undefined);
    setIsOpen(false);
  };

  const handleReset = () => {
    for (const key of FILTER_QUERY_KEYS) {
      handleChange(key, undefined);
    }
    form.reset({
      status: undefined,
      category_id: "",
    });
    setIsOpen(false);
  };

  return (
    <form
      id="tickets-filter-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <FieldSet className="gap-3">
          <FieldLegend variant="label">Ticket</FieldLegend>
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="ticket_status">Estado</Label>
                <TicketStatusSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar estado"
                />
              </Field>
            )}
          />
          <Controller
            name="category_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="ticket_category_id">Categoría</Label>
                <TicketCategoriesSelector
                  value={field.value}
                  onValueChange={field.onChange}
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
        <Button type="submit" form="tickets-filter-form">
          Buscar
          <SearchIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
};
