import { ReportTargetTypeSelector } from "@/components/dynamicSelectors/reportTargetTypeSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import {
  createReportCategorySchema,
  updateReportCategorySchema,
} from "../schemas/report-category.schema";
import { reportCategoriesService } from "../services/reportCategoriesService";
import type { ReportTargetType } from "../types/report.types";

export const ReportCategoryForm = ({
  onSuccess,
}: {
  onSuccess?: () => void;
}) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const formSchema = selectedId
    ? updateReportCategorySchema
    : createReportCategorySchema;
  type FormSchema = z.infer<typeof formSchema>;

  const { data: categoryResponse } = useQuery({
    queryKey: ["report-category", selectedId],
    queryFn: () => reportCategoriesService.findOne(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      target_type: "profile" as ReportTargetType,
    },
  });

  useEffect(() => {
    const category = categoryResponse?.data;
    if (!category) return;
    form.reset({
      name: category.name,
      target_type: category.target_type,
    });
  }, [categoryResponse, form]);

  const onSubmit = async (formData: FormSchema) => {
    if (selectedId) {
      const update_data = formData as z.infer<typeof updateReportCategorySchema>;
      const response = await reportCategoriesService.update({
        id: selectedId,
        name: update_data.name,
        target_type: update_data.target_type,
      });
      if (response.ok) {
        toast.success("Categoría actualizada correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error(response.message || "Error al actualizar la categoría");
      }
      return;
    }

    const create_data = formData as z.infer<typeof createReportCategorySchema>;
    const response = await reportCategoriesService.create({
      name: create_data.name,
      target_type: create_data.target_type,
    });

    if (response.ok) {
      toast.success("Categoría creada correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
    } else {
      toast.error(response.message || "Error al crear la categoría");
    }
  };

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Categoría de denuncia</h2>
          <p className="text-sm text-muted-foreground">
            Define el nombre y el tipo de objetivo al que aplica la categoría.
          </p>
        </div>

        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nombre</FieldLabel>
              <Input
                id="name"
                type="text"
                placeholder="Nombre de la categoría"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="target_type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="target_type">Tipo de objetivo</FieldLabel>
              <ReportTargetTypeSelector
                value={field.value}
                onValueChange={(value) => {
                  if (value) {
                    field.onChange(value);
                  }
                }}
                disabled={!!selectedId}
                placeholder="Seleccionar tipo de objetivo"
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </section>

      <div className="flex justify-end">
        <Button type="submit">
          {selectedId ? "Actualizar categoría" : "Crear categoría"}
        </Button>
      </div>
    </form>
  );
};
