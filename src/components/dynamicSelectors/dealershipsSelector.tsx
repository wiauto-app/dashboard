import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/useDebounce";
import { dealershipService } from "@/components/dealerships/services/dealershipService";
import type { Dealership } from "@/components/dealerships/types/dealership.types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const get_dealership_label = (dealership?: Dealership | null) =>
  dealership?.name?.trim() || dealership?.email || dealership?.id || "";

export const DealershipsSelector = ({
  value,
  onValueChange,
  ariaInvalid,
  disabled = false,
  placeholder = "Buscar concesionario por nombre...",
}: {
  value?: string;
  onValueChange: (dealership_id: string | undefined) => void;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [search_value, set_search_value] = useState("");
  const debounced_search = useDebounce(search_value.trim(), 300);

  const dealerships_query = useQuery({
    queryKey: ["dealerships-selector", debounced_search],
    queryFn: async () => {
      const response = await dealershipService.findAll({
        page: 1,
        limit: 20,
        name: debounced_search || undefined,
      });
      return (response?.data ?? []) as unknown as Dealership[];
    },
  });

  const dealerships = useMemo(
    () => dealerships_query.data ?? [],
    [dealerships_query.data],
  );

  const selected_dealership_query = useQuery({
    queryKey: ["dealerships-selector-selected", value],
    queryFn: async () => {
      if (!value) return null;
      const response = await dealershipService.findOne(value);
      return response.data ?? null;
    },
    enabled: !!value,
  });

  const selected_dealership = selected_dealership_query.data;

  const handleSelectDealership = (dealership: Dealership) => {
    onValueChange(dealership.id);
    set_search_value("");
  };

  return (
    <div className="flex flex-col gap-2">
      {value && selected_dealership ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {get_dealership_label(selected_dealership)}
            </p>
            {selected_dealership.email ? (
              <p className="truncate text-xs text-muted-foreground">
                {selected_dealership.email}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="shrink-0 text-xs text-muted-foreground transition hover:text-foreground"
            onClick={() => onValueChange(undefined)}
            disabled={disabled}
            aria-label="Quitar concesionario seleccionado"
          >
            Cambiar
          </button>
        </div>
      ) : (
        <>
          <Input
            value={search_value}
            onChange={(event) => set_search_value(event.target.value)}
            placeholder={placeholder}
            aria-invalid={ariaInvalid}
            disabled={disabled}
          />

          <div
            className={cn(
              "max-h-48 overflow-y-auto rounded-md border",
              ariaInvalid && "border-destructive",
            )}
          >
            {dealerships_query.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`dealership-selector-skeleton-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : dealerships.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                No hay concesionarios para mostrar.
              </p>
            ) : (
              <div className="flex flex-col">
                {dealerships.map((dealership) => (
                  <button
                    key={dealership.id}
                    type="button"
                    className="border-b p-3 text-left last:border-b-0 hover:bg-muted/50"
                    onClick={() => handleSelectDealership(dealership)}
                    disabled={disabled}
                  >
                    <p className="text-sm font-medium">
                      {get_dealership_label(dealership)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dealership.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
