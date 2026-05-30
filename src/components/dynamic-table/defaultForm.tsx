import type { DynamicTableColumn } from "./types";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";

import { useSelectedIdStore } from "@/stores/useSelectedIdStore";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormDialogStore } from "@/stores/useFormDialogStore";
import { ImageInput } from "../ui/imageInput";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { apiResponse } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type DefaultFormMutationMessages = {
  create_success?: string;
  update_success?: string;
  create_error?: string;
  update_error?: string;
};

const default_create_success = "Registro creado correctamente";
const default_update_success = "Registro actualizado correctamente";
const default_create_error = "No se pudo crear el registro";
const default_update_error = "No se pudo actualizar el registro";
export const DefaultForm = ({
  columns,
  createService,
  updateService,
  findOneService,
  isTest = false,
  onMutationSuccess,
  messages = {},
  columnsLayout = 2,
}: {
  columns: DynamicTableColumn[];
  findOneService: (id: string) => Promise<any>;
  createService: (data: unknown) => Promise<apiResponse<unknown>>;
  updateService: (id: string, data: unknown) => Promise<apiResponse<unknown>>;
  isTest?: boolean;
  /** Invalidar loader de la ruta, refetch de lista, etc. */
  onMutationSuccess?: () => void;
  messages?: DefaultFormMutationMessages;
  columnsLayout?: 1 | 2 | 3;
}) => {
  const [images, setImages] = useState<Record<string, string | null>>({});
  const [is_submitting, setIsSubmitting] = useState(false);
  const is_submit_locked_ref = useRef(false);
  const selectedId = useSelectedIdStore((state) => state.selectedId);

  const setSelectedId = useSelectedIdStore((state) => state.setSelectedId);

  const setIsOpen = useFormDialogStore((state) => state.setIsOpen);

  const queryClient = useQueryClient();

  const filteredColumns = columns.filter(
    (column) => column.accessorKey !== "select" && column.modifiable !== false,
  );

  const { data, isLoading } = useQuery({
    queryKey: ["selectedData", selectedId],
    queryFn: () => findOneService(selectedId!),
    enabled: !!selectedId,
  });

  const selectedData = data?.data;

  const release_submit_lock = () => {
    is_submit_locked_ref.current = false;
    setIsSubmitting(false);
  };

  const try_acquire_submit_lock = (): boolean => {
    if (is_submit_locked_ref.current) {
      return false;
    }
    is_submit_locked_ref.current = true;
    setIsSubmitting(true);
    return true;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!try_acquire_submit_lock()) {
      return;
    }

    try {
      const form = e.currentTarget;

      const formData = new FormData(form);

      const values: Record<string, unknown> = {};
      formData.forEach((value, key) => {
        values[key] = value;
      });

      // Parse booleans y números (FormData entrega todo como string).
      filteredColumns.forEach((column) => {
        if (column.type === "boolean") {
          const checkbox = form.elements.namedItem(
            column.accessorKey,
          ) as HTMLInputElement | null;

          values[column.accessorKey] = checkbox?.checked ?? false;
        }
        if (column.type === "number") {
          const raw = values[column.accessorKey];
          const trimmed =
            typeof raw === "string" ? raw.trim() : String(raw ?? "").trim();
          if (trimmed === "") {
            delete values[column.accessorKey];
            return;
          }
          const parsed = Number(trimmed);
          if (!Number.isFinite(parsed)) {
            delete values[column.accessorKey];
            return;
          }
          values[column.accessorKey] = Math.trunc(parsed);
        }
      });

      const submittedData = { ...values, ...images };

      const row_id_at_submit = selectedId;

      const response = row_id_at_submit
        ? await updateService(row_id_at_submit, submittedData)
        : await createService(submittedData);

      if (!response.ok) {
        toast.error(
          response.message ||
            (row_id_at_submit
              ? (messages.update_error ?? default_update_error)
              : (messages.create_error ?? default_create_error)),
        );
        return;
      }

      toast.success(
        row_id_at_submit
          ? (messages.update_success ?? default_update_success)
          : (messages.create_success ?? default_create_success),
      );

      onMutationSuccess?.();

      if (!isTest) {
        setSelectedId(null);
        setIsOpen(false);
      }

      queryClient.invalidateQueries({
        queryKey: ["selectedData"],
      });
    } catch {
      // Sin toast de error genérico: el servicio ya muestra el mensaje del API.
    } finally {
      release_submit_lock();
    }
  };

  useEffect(() => {
    if (!selectedData) return;

    const initialImages = columns
      .filter((column) => column.type === "image")
      .reduce(
        (acc, column) => {
          acc[column.accessorKey] = selectedData[column.accessorKey] ?? null;
          return acc;
        },
        {} as Record<string, string | null>,
      );

    setTimeout(() => {
      setImages(initialImages);
    }, 100);
  }, [selectedData, columns]);

  if (isLoading) {
    return <Loader2 className="size-4 animate-spin" />;
  }
  return (
    <form
      className={cn(
        "grid gap-4",
        columnsLayout === 1 && "grid-cols-1",
        columnsLayout === 2 && "grid-cols-1 md:grid-cols-2 ",
        columnsLayout === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ",
      )}
      onSubmit={onSubmit}
    >
      {filteredColumns.map((column) => (
        <Field key={column.accessorKey}>
          <FieldLabel htmlFor={column.accessorKey}>{column.header}</FieldLabel>
          {column.type === "image" && (
            <ImageInput
              value={images[column.accessorKey]}
              onChange={(value) =>
                setImages({ ...images, [column.accessorKey]: value })
              }
              bucketName={column.bucketName!}
              path={column.image_upload_path ?? column.accessorKey}
            />
          )}
          {column.type === "text" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="text"
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}
          {column.type === "textarea" && (
            <Textarea
              id={column.accessorKey}
              name={column.accessorKey}
              rows={4}
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}
          {column.type === "number" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={
                selectedData?.[column.accessorKey] !== undefined &&
                selectedData?.[column.accessorKey] !== null
                  ? String(selectedData[column.accessorKey])
                  : ""
              }
            />
          )}
          {column.type === "link" && (
            <Input
              id={column.accessorKey}
              name={column.accessorKey}
              type="text"
              defaultValue={selectedData?.[column.accessorKey] ?? ""}
            />
          )}

          {column.type === "boolean" && (
            <div className="flex items-center">
              <Checkbox
                id={column.accessorKey}
                name={column.accessorKey}
                defaultChecked={selectedData?.[column.accessorKey] ?? false}
              />
            </div>
          )}
        </Field>
      ))}

      <Button type="submit" disabled={is_submitting} aria-busy={is_submitting}>
        Guardar
      </Button>
    </form>
  );
};
