import { useFiltersManager } from "@/hooks/useFiltersManager";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import type z from "zod";
import { Button } from "../ui/button";
import { SearchIcon, XIcon } from "lucide-react";
import { useFilterPopoverStore } from "@/stores/useFilterPopoverStore";
import { userParamsSchema } from "@/validations/queryParams/user-params.schema";
import { Field, FieldError } from "../ui/field";

const SelectedFieldsSchema = userParamsSchema.pick({
  name: true,
  last_name: true,
  email: true,
});

type SelectedFields = z.infer<typeof SelectedFieldsSchema>;

const normalizeFilterValue = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const UsersFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange } = useFiltersManager({ path: "/users" });
  const form = useForm<SelectedFields>({
    resolver: standardSchemaResolver(SelectedFieldsSchema),
    defaultValues: {
      name: values.name ?? "",
      last_name: values.last_name ?? "",
      email: values.email ?? "",
    },
  });

  const onSubmit = (data: SelectedFields) => {
    handleChange("name", normalizeFilterValue(data.name));
    handleChange("last_name", normalizeFilterValue(data.last_name));
    handleChange("email", normalizeFilterValue(data.email));
    setIsOpen(false);
  };

  const handleReset = () => {
    handleChange("name", undefined);
    handleChange("last_name", undefined);
    handleChange("email", undefined);
    form.reset({
      name: "",
      last_name: "",
      email: "",
    });
    setIsOpen(false);
  };

  return (
    <form
      id="filter-form"
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              aria-invalid={fieldState.invalid}
              type="text"
              placeholder="Nombre"
              {...field}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="last_name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              aria-invalid={fieldState.invalid}
              type="text"
              placeholder="Apellido"
              {...field}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        name="email"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <Input
              aria-invalid={fieldState.invalid}
              type="text"
              placeholder="Email"
              autoComplete="email"
              {...field}
            />
            {fieldState.error && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <div className="flex flex-row gap-2 justify-end">
        <Button type="button" variant="outline" onClick={handleReset}>
          Limpiar
          <XIcon className="size-4" />
        </Button>
        <Button type="submit" form="filter-form">
          Buscar
          <SearchIcon className="size-4" />
        </Button>
      </div>
    </form>
  );
};
