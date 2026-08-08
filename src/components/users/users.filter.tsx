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
});

type SelectedFields = z.infer<typeof SelectedFieldsSchema>;
export const UsersFilter = () => {
  const setIsOpen = useFilterPopoverStore((state) => state.setIsOpen);
  const { values, handleChange } = useFiltersManager({ path: "/users" });
  const form = useForm<SelectedFields>({
    resolver: standardSchemaResolver(SelectedFieldsSchema),
    defaultValues: {
      name: values.name ?? "",
    },
  });
  const onSubmit = (data: SelectedFields) => {
    handleChange("name", data.name);

    setIsOpen(false);
  };
  const handleReset = () => {
    handleChange("name", undefined);
    form.reset({
      name: "",
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
              placeholder="Buscar"
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
