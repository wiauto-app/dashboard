import { DealershipsSelector } from "@/components/dynamicSelectors/dealershipsSelector";
import { ProfilesSelector } from "@/components/dynamicSelectors/profilesSelector";
import { ReportCategoriesSelector } from "@/components/dynamicSelectors/reportCategoriesSelector";
import { ReportStatusSelector } from "@/components/dynamicSelectors/reportStatusSelector";
import { ReportTargetTypeSelector } from "@/components/dynamicSelectors/reportTargetTypeSelector";
import { VehiclesSelector } from "@/components/dynamicSelectors/vehiclesSelector";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { FileInput } from "@/components/ui/fileInput";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { get_report_target_type_label } from "../constants/report-target-type.constants";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { createReportSchema, updateReportSchema } from "../schemas/report.schema";
import { reportsService } from "../services/reportsService";
import type { ReportStatus, ReportTargetType } from "../types/report.types";

const ReportTargetSelector = ({
  target_type,
  value,
  onValueChange,
  disabled,
  ariaInvalid,
}: {
  target_type?: ReportTargetType;
  value?: string;
  onValueChange: (value: string | undefined) => void;
  disabled?: boolean;
  ariaInvalid?: boolean;
}) => {
  if (!target_type) {
    return (
      <p className="text-sm text-muted-foreground">
        Selecciona primero el tipo de objetivo.
      </p>
    );
  }

  if (target_type === "profile") {
    return (
      <ProfilesSelector
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        ariaInvalid={ariaInvalid}
        placeholder="Buscar perfil por nombre o email..."
      />
    );
  }

  if (target_type === "dealership") {
    return (
      <DealershipsSelector
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        ariaInvalid={ariaInvalid}
      />
    );
  }

  return (
    <VehiclesSelector
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      ariaInvalid={ariaInvalid}
    />
  );
};

export const ReportForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);
  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const formSchema = selectedId ? updateReportSchema : createReportSchema;
  type FormSchema = z.infer<typeof formSchema>;

  const { data: reportResponse } = useQuery({
    queryKey: ["report", selectedId],
    queryFn: () => reportsService.findOne(selectedId!),
    enabled: !!selectedId,
  });

  const form = useForm<FormSchema>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category_id: "",
      target_type: "profile" as ReportTargetType,
      target_id: "",
      file_url: "",
      status: "open" as ReportStatus,
      admin_notes: "",
    },
  });

  const selected_target_type = selectedId
    ? reportResponse?.data?.target_type
    : (form.watch("target_type" as keyof FormSchema) as
        | ReportTargetType
        | undefined);

  useEffect(() => {
    const report = reportResponse?.data;
    if (!report) return;
    form.reset({
      title: report.title,
      description: report.description,
      file_url: report.file_url ?? "",
      status: report.status,
      admin_notes: report.admin_notes ?? "",
    });
  }, [reportResponse, form]);

  useEffect(() => {
    if (selectedId) return;
    form.setValue("category_id" as keyof FormSchema, "" as never);
    form.setValue("target_id" as keyof FormSchema, "" as never);
  }, [selected_target_type, selectedId, form]);

  const onSubmit = async (formData: FormSchema) => {
    const file_url = formData.file_url?.trim()
      ? formData.file_url.trim()
      : null;

    if (selectedId) {
      const update_data = formData as z.infer<typeof updateReportSchema>;
      const response = await reportsService.update(selectedId, {
        title: update_data.title,
        description: update_data.description,
        file_url,
        status: update_data.status,
        admin_notes: update_data.admin_notes?.trim()
          ? update_data.admin_notes.trim()
          : null,
      });
      if (response.ok) {
        toast.success("Denuncia actualizada correctamente");
        setIsOpen(false);
        setSelectedId(null);
        onSuccess?.();
      } else {
        toast.error(response.message || "Error al actualizar la denuncia");
      }
      return;
    }

    const create_data = formData as z.infer<typeof createReportSchema>;
    if (
      !create_data.category_id ||
      !create_data.title ||
      !create_data.description ||
      !create_data.target_id
    ) {
      return;
    }

    const response = await reportsService.create({
      category_id: create_data.category_id,
      title: create_data.title,
      description: create_data.description,
      target_type: create_data.target_type,
      target_id: create_data.target_id,
      file_url,
    });

    if (response.ok) {
      toast.success("Denuncia creada correctamente");
      setIsOpen(false);
      setSelectedId(null);
      onSuccess?.();
    } else {
      toast.error(response.message || "Error al crear la denuncia");
    }
  };

  const report = reportResponse?.data;

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <section className="flex flex-col gap-4 rounded-xl border p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Denuncia</h2>
          <p className="text-sm text-muted-foreground">
            {selectedId
              ? "Modera la denuncia y actualiza su estado."
              : "Registra una denuncia manual indicando el objetivo denunciado."}
          </p>
        </div>

        {selectedId && report ? (
          <div className="grid gap-3 rounded-lg bg-muted/40 p-3 text-sm">
            <div>
              <p className="font-medium text-muted-foreground">Tipo de objetivo</p>
              <p>{get_report_target_type_label(report.target_type)}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Objetivo</p>
              <p>{report.target_label}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Denunciante</p>
              <p>{report.reporter_label}</p>
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Categoría</p>
              <p>{report.category.name}</p>
            </div>
          </div>
        ) : (
          <>
            <Controller
              name={"target_type" as keyof FormSchema}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="target_type">Tipo de objetivo</FieldLabel>
                  <ReportTargetTypeSelector
                    value={field.value as ReportTargetType | undefined}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                    placeholder="Seleccionar tipo de objetivo"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={"target_id" as keyof FormSchema}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="target_id">Objetivo denunciado</FieldLabel>
                  <ReportTargetSelector
                    target_type={selected_target_type}
                    value={field.value as string | undefined}
                    onValueChange={field.onChange}
                    ariaInvalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name={"category_id" as keyof FormSchema}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category_id">Categoría</FieldLabel>
                  <ReportCategoriesSelector
                    value={field.value as string | undefined}
                    onValueChange={field.onChange}
                    targetType={selected_target_type}
                    ariaInvalid={fieldState.invalid}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </>
        )}

        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="title">Título</FieldLabel>
              <Input
                id="title"
                type="text"
                placeholder="Título de la denuncia"
                aria-invalid={fieldState.invalid}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="description">Descripción</FieldLabel>
              <Textarea
                id="description"
                placeholder="Describe el motivo de la denuncia"
                aria-invalid={fieldState.invalid}
                rows={5}
                {...field}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="file_url"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FileInput
                label="Archivo adjunto (opcional)"
                description="Imágenes, PDF o documentos de evidencia"
                bucketName="files"
                path="reports"
                referenceId={selectedId ?? undefined}
                value={field.value?.trim() ? field.value : null}
                onChange={field.onChange}
              />
              {fieldState.error && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {selectedId ? (
          <>
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status">Estado</FieldLabel>
                  <ReportStatusSelector
                    value={field.value as ReportStatus | undefined}
                    onValueChange={(value) => {
                      if (value) {
                        field.onChange(value);
                      }
                    }}
                    placeholder="Seleccionar estado"
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="admin_notes"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="admin_notes">Notas del administrador</FieldLabel>
                  <Textarea
                    id="admin_notes"
                    placeholder="Notas internas de moderación"
                    aria-invalid={fieldState.invalid}
                    rows={4}
                    {...field}
                  />
                  {fieldState.error && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </>
        ) : null}
      </section>

      <div className="flex justify-end">
        <Button type="submit">
          {selectedId ? "Actualizar denuncia" : "Crear denuncia"}
        </Button>
      </div>
    </form>
  );
};
