import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/useDebounce";
import { vehiclesService } from "@/components/vehicles/services/vehiclesService";
import type {
  AdminVehicleDetail,
  AdminVehicleListItem,
  VehiclesParams,
} from "@/components/vehicles/types/vehicles.types";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const get_vehicle_label = (
  vehicle?: Pick<AdminVehicleListItem | AdminVehicleDetail, "id" | "title" | "license_plate"> | null,
) => vehicle?.title?.trim() || vehicle?.license_plate?.trim() || vehicle?.id || "";

export const VehiclesSelector = ({
  value,
  onValueChange,
  ariaInvalid,
  disabled = false,
  placeholder = "Buscar anuncio por título...",
}: {
  value?: string;
  onValueChange: (vehicle_id: string | undefined) => void;
  ariaInvalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [search_value, set_search_value] = useState("");
  const debounced_search = useDebounce(search_value.trim(), 300);

  const vehicles_query = useQuery({
    queryKey: ["vehicles-selector", debounced_search],
    queryFn: async () => {
      const response = await vehiclesService.findAll({
        page: 1,
        limit: 20,
        query: debounced_search || undefined,
      } as VehiclesParams);
      return response?.data ?? [];
    },
  });

  const vehicles = useMemo(
    () => vehicles_query.data ?? [],
    [vehicles_query.data],
  );

  const selected_vehicle_query = useQuery({
    queryKey: ["vehicles-selector-selected", value],
    queryFn: async () => {
      if (!value) return null;
      return vehiclesService.findOne(value);
    },
    enabled: !!value,
  });

  const selected_vehicle = selected_vehicle_query.data;

  const handleSelectVehicle = (vehicle: AdminVehicleListItem) => {
    onValueChange(vehicle.id);
    set_search_value("");
  };

  return (
    <div className="flex flex-col gap-2">
      {value && selected_vehicle ? (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {get_vehicle_label(selected_vehicle)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selected_vehicle.license_plate || selected_vehicle.id}
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-xs text-muted-foreground transition hover:text-foreground"
            onClick={() => onValueChange(undefined)}
            disabled={disabled}
            aria-label="Quitar anuncio seleccionado"
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
            {vehicles_query.isLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={`vehicle-selector-skeleton-${index}`}
                    className="h-10 w-full"
                  />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                No hay anuncios para mostrar.
              </p>
            ) : (
              <div className="flex flex-col">
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    type="button"
                    className="border-b p-3 text-left last:border-b-0 hover:bg-muted/50"
                    onClick={() => handleSelectVehicle(vehicle)}
                    disabled={disabled}
                  >
                    <p className="text-sm font-medium">
                      {get_vehicle_label(vehicle)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.license_plate || vehicle.id}
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
