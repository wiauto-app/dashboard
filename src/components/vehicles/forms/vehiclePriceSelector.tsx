import { useId, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { format, parseISO } from "date-fns";
import { Check, ChevronDown, History } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type {
  VehiclePriceHistoryItem,
  VehicleSchema,
} from "../types/vehicles.types";

const price_formatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const formatPriceHistoryLabel = (item: VehiclePriceHistoryItem): string => {
  const formatted_price = price_formatter.format(item.price);
  const formatted_date = format(parseISO(item.created_at), "dd/MM/yyyy");
  const status_label = item.status === "active" ? "activo" : "inactivo";

  return `${formatted_price} · ${formatted_date} · ${status_label}`;
};

const findMatchingHistoryItem = (
  vehicle_prices: VehiclePriceHistoryItem[],
  price: number,
): VehiclePriceHistoryItem | undefined => {
  return vehicle_prices.find((item) => item.price === price);
};

type VehiclePriceSelectorProps = {
  vehicle_prices?: VehiclePriceHistoryItem[];
  isEditMode?: boolean;
};

export const VehiclePriceSelector = ({
  vehicle_prices = [],
  isEditMode = false,
}: VehiclePriceSelectorProps) => {
  const price_input_id = useId();
  const [history_open, setHistoryOpen] = useState(false);
  const form = useFormContext<VehicleSchema>();

  const has_history = isEditMode && vehicle_prices.length > 0;
  const selected_price_id = form.watch("vehicle_price_id");

  const handleSelectHistoryItem = (item: VehiclePriceHistoryItem) => {
    form.setValue("price", item.price, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("vehicle_price_id", item.id, { shouldDirty: true });
    setHistoryOpen(false);
  };

  return (
    <Controller
      name="price"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={price_input_id}>Precio</FieldLabel>

          <InputGroup data-disabled={field.disabled}>
            <InputGroupInput
              id={price_input_id}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              name={field.name}
              ref={field.ref}
              onBlur={field.onBlur}
              disabled={field.disabled}
              value={field.value ?? ""}
              aria-invalid={fieldState.invalid}
              aria-label="Precio del vehículo en euros"
              onChange={(event) => {
                const raw_value = event.target.value;
                const parsed_price =
                  raw_value === "" ? 0 : Number(raw_value);

                field.onChange(parsed_price);

                const matching_item = findMatchingHistoryItem(
                  vehicle_prices,
                  parsed_price,
                );

                form.setValue(
                  "vehicle_price_id",
                  matching_item?.id,
                  { shouldDirty: true },
                );
              }}
            />

            {has_history ? (
              <InputGroupAddon align="inline-end">
                <Popover open={history_open} onOpenChange={setHistoryOpen}>
                  <PopoverTrigger>
                    <InputGroupButton
                      type="button"
                      size="icon-xs"
                      aria-label="Ver historial de precios"
                      aria-expanded={history_open}
                    >
                      <History className="size-4" aria-hidden />
                      <ChevronDown className="size-3 opacity-50" aria-hidden />
                    </InputGroupButton>
                  </PopoverTrigger>

                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] min-w-[320px] p-0"
                    align="end"
                  >
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandEmpty>
                          No hay precios en el historial.
                        </CommandEmpty>

                        <CommandGroup heading="Historial de precios">
                          {vehicle_prices.map((item) => {
                            const is_selected = selected_price_id === item.id;

                            return (
                              <CommandItem
                                key={item.id}
                                value={item.id}
                                onSelect={() => handleSelectHistoryItem(item)}
                                className="flex items-center justify-between gap-2"
                              >
                                <span className="truncate">
                                  {formatPriceHistoryLabel(item)}
                                </span>

                                {is_selected ? (
                                  <Check
                                    className="size-4 shrink-0"
                                    aria-hidden
                                  />
                                ) : null}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </InputGroupAddon>
            ) : null}
          </InputGroup>

          {fieldState.error ? (
            <FieldError errors={[fieldState.error]} />
          ) : null}
        </Field>
      )}
    />
  );
};
