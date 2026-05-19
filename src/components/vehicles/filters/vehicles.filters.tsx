import { useFiltersManager } from "@/hooks/useFiltersManager";
import { VehicleTypesSelector } from "@/components/dynamicSelectors/vehicleTypesSelector";
import { VehiclePublisherTypeSelector } from "@/components/dynamicSelectors/vehiclePublisherTypeSelector";
import { VehicleStatusSelector } from "@/components/dynamicSelectors/vehicleStatusSelector";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import z from "zod";
import { Button } from "@/components/ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";
import { Field, FieldError, FieldGroup, FieldLegend, FieldSet } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { vehiclesSchema } from "../schemas/vehicles-params.schema";

const vehiclesFilterFormSchema = vehiclesSchema
  .pick({
    publisher_name: true,
    publisher_email: true,
    status: true,
    publisher_type: true,
    vehicle_type_id: true,
    query: true,
  })
  .extend({
    is_featured: z.enum(["__all__", "true", "false"]).optional(),
    since_created_at: z.string().optional(),
    until_created_at: z.string().optional(),
    since_updated_at: z.string().optional(),
    until_updated_at: z.string().optional(),
    since_expires_at: z.string().optional(),
    until_expires_at: z.string().optional(),
  });

type VehiclesFilterFormValues = z.infer<typeof vehiclesFilterFormSchema>;

const FEATURED_OPTIONS = [
  { value: "__all__", label: "Todos" },
  { value: "true", label: "Destacados" },
  { value: "false", label: "No destacados" },
] as const;

const FILTER_QUERY_KEYS = [
  "publisher_name",
  "publisher_email",
  "status",
  "publisher_type",
  "is_featured",
  "vehicle_type_id",
  "query",
  "since_created_at",
  "until_created_at",
  "since_updated_at",
  "until_updated_at",
  "since_expires_at",
  "until_expires_at",
] as const;

const parseSearchDate = (value: unknown): string => {
  if (value == null || value === "") return "";
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return format(value, "yyyy-MM-dd");
  }
  if (typeof value === "string") return value.slice(0, 10);
  return "";
};

const parseFeaturedValue = (
  value: unknown,
): "__all__" | "true" | "false" => {
  if (value === true || value === "true") return "true";
  if (value === false || value === "false") return "false";
  return "__all__";
};

const parseDateInput = (value?: string): Date | undefined => {
  if (!value?.trim()) return undefined;
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const DateRangeFields = ({
  legend,
  fromName,
  toName,
  control,
}: {
  legend: string;
  fromName: keyof Pick<
    VehiclesFilterFormValues,
    | "since_created_at"
    | "until_created_at"
    | "since_updated_at"
    | "until_updated_at"
    | "since_expires_at"
    | "until_expires_at"
  >;
  toName: keyof Pick<
    VehiclesFilterFormValues,
    | "since_created_at"
    | "until_created_at"
    | "since_updated_at"
    | "until_updated_at"
    | "since_expires_at"
    | "until_expires_at"
  >;
  control: ReturnType<typeof useForm<VehiclesFilterFormValues>>["control"];
}) => (
  <FieldSet className="gap-3">
    <FieldLegend variant="label">{legend}</FieldLegend>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Controller
        name={fromName}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label htmlFor={fromName}>Desde</Label>
            <Input
              id={fromName}
              type="date"
              aria-invalid={fieldState.invalid}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name={toName}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Label htmlFor={toName}>Hasta</Label>
            <Input
              id={toName}
              type="date"
              aria-invalid={fieldState.invalid}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </div>
  </FieldSet>
);

export const VehiclesFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange, handleDateRangeChange } = useFiltersManager({
    path: "/vehicles",
  });

  const form = useForm<VehiclesFilterFormValues>({
    resolver: standardSchemaResolver(vehiclesFilterFormSchema),
    defaultValues: {
      publisher_name: values.publisher_name ?? "",
      publisher_email: values.publisher_email ?? "",
      status: (values.status as VehiclesFilterFormValues["status"]) ?? undefined,
      publisher_type:
        (values.publisher_type as VehiclesFilterFormValues["publisher_type"]) ??
        undefined,
      is_featured: parseFeaturedValue(values.is_featured),
      vehicle_type_id: values.vehicle_type_id ?? "",
      query: values.query ?? "",
      since_created_at: parseSearchDate(values.since_created_at),
      until_created_at: parseSearchDate(values.until_created_at),
      since_updated_at: parseSearchDate(values.since_updated_at),
      until_updated_at: parseSearchDate(values.until_updated_at),
      since_expires_at: parseSearchDate(values.since_expires_at),
      until_expires_at: parseSearchDate(values.until_expires_at),
    },
  });

  const handleSubmit = (data: VehiclesFilterFormValues) => {
    handleChange("publisher_name", data.publisher_name?.trim() || undefined);
    handleChange("publisher_email", data.publisher_email?.trim() || undefined);
    handleChange("status", data.status || undefined);
    handleChange("publisher_type", data.publisher_type || undefined);
    handleChange("vehicle_type_id", data.vehicle_type_id?.trim() || undefined);
    handleChange("query", data.query?.trim() || undefined);
    handleChange(
      "is_featured",
      data.is_featured === "true" || data.is_featured === "false"
        ? data.is_featured
        : undefined,
    );

    handleDateRangeChange("since_created_at", "until_created_at", {
      from: parseDateInput(data.since_created_at),
      to: parseDateInput(data.until_created_at),
    });
    handleDateRangeChange("since_updated_at", "until_updated_at", {
      from: parseDateInput(data.since_updated_at),
      to: parseDateInput(data.until_updated_at),
    });
    handleDateRangeChange("since_expires_at", "until_expires_at", {
      from: parseDateInput(data.since_expires_at),
      to: parseDateInput(data.until_expires_at),
    });

    setIsOpen(false);
  };

  const handleReset = () => {
    for (const key of FILTER_QUERY_KEYS) {
      handleChange(key, undefined);
    }
    form.reset({
      publisher_name: "",
      publisher_email: "",
      status: undefined,
      publisher_type: undefined,
      is_featured: "__all__",
      vehicle_type_id: "",
      query: "",
      since_created_at: "",
      until_created_at: "",
      since_updated_at: "",
      until_updated_at: "",
      since_expires_at: "",
      until_expires_at: "",
    });
    setIsOpen(false);
  };

  return (
    <form
      id="vehicles-filter-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex max-h-[min(70vh,32rem)] flex-col gap-4 overflow-y-auto pr-1"
    >
      <FieldGroup>
        <FieldSet className="gap-3">
          <FieldLegend variant="label">Publicador</FieldLegend>
          <Controller
            name="publisher_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="publisher_name">Nombre</Label>
                <Input
                  id="publisher_name"
                  type="text"
                  placeholder="Nombre del publicador"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  value={field.value ?? ""}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="publisher_email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="publisher_email">Correo</Label>
                <Input
                  id="publisher_email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  value={field.value ?? ""}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="publisher_type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="publisher_type">Tipo de publicador</Label>
                <VehiclePublisherTypeSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar tipo"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>

        <FieldSet className="gap-3">
          <FieldLegend variant="label">Anuncio</FieldLegend>
          <Controller
            name="query"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="vehicles_query">Búsqueda</Label>
                <Input
                  id="vehicles_query"
                  type="text"
                  placeholder="Título o descripción"
                  aria-invalid={fieldState.invalid}
                  {...field}
                  value={field.value ?? ""}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="status"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="status">Estado</Label>
                <VehicleStatusSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  include_all_option
                  placeholder="Seleccionar estado"
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="is_featured"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="is_featured">Destacado</Label>
                <Select
                  value={field.value ?? "__all__"}
                  onValueChange={(value) =>
                    field.onChange(
                      value === "__all__"
                        ? "__all__"
                        : (value as "true" | "false"),
                    )
                  }
                  items={FEATURED_OPTIONS.map((option) => ({
                    value: option.value,
                    label: option.label,
                  }))}
                >
                  <SelectTrigger
                    id="is_featured"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Destacado" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURED_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            name="vehicle_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <Label htmlFor="vehicle_type_id">Tipo de vehículo</Label>
                <VehicleTypesSelector
                  value={field.value}
                  onValueChange={field.onChange}
                  ariaInvalid={fieldState.invalid}
                />
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </FieldSet>

        <DateRangeFields
          legend="Fecha de creación"
          fromName="since_created_at"
          toName="until_created_at"
          control={form.control}
        />
        <DateRangeFields
          legend="Fecha de actualización"
          fromName="since_updated_at"
          toName="until_updated_at"
          control={form.control}
        />
        <DateRangeFields
          legend="Fecha de expiración"
          fromName="since_expires_at"
          toName="until_expires_at"
          control={form.control}
        />
      </FieldGroup>

      <div className="flex shrink-0 flex-row justify-end gap-2 border-t pt-3">
        <Button type="button" variant="outline" onClick={handleReset}>
          Limpiar
          <XIcon className="size-4" aria-hidden />
        </Button>
        <Button type="submit" form="vehicles-filter-form">
          Buscar
          <SearchIcon className="size-4" aria-hidden />
        </Button>
      </div>
    </form>
  );
};
