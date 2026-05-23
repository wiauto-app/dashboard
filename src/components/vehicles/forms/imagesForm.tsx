import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  Camera,
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import { filesService, split_storage_compound_path } from "@/services/files/filesService";
import { VEHICLE_GALLERY_TEMP_PREFIX } from "@/services/files/temp-storage-path";

import type { VehicleFormImage } from "../schemas/vehicle.schema";

const accepted_mime_types = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

const VEHICLE_IMAGE_DRAG_TYPE = "application/x-vehicle-image-order";

export const normalize_vehicle_images = (
  images: VehicleFormImage[],
): VehicleFormImage[] =>
  [...images]
    .sort((a, b) => a.order - b.order)
    .map((image, index) => ({
      path: image.path,
      order: index,
    }));

type PendingItem = {
  temp_key: string;
  file: File;
  blob_preview: string;
};

const is_valid_image_file = (file: File) => {
  const ok = accepted_mime_types.includes(
    file.type as (typeof accepted_mime_types)[number],
  );
  if (!ok) {
    toast.error(`${file.name}: usa JPG, PNG o WEBP.`);
  }
  return ok;
};

export type ImagesFormProps = {
  /** Imágenes confirmadas (ruta + orden), persistidas en el formulario. */
  value?: VehicleFormImage[];
  /** Emite el array completo, con `order` normalizado (0 … n-1). */
  onChange?: (images: VehicleFormImage[]) => void;
  /**
   * ID de referencia para la subida (p. ej. id del vehículo).
   * Si no se pasa, se usa un UUID estable por montaje del formulario.
   */
  reference_id?: string;
};

export const ImagesForm = ({
  value: value_prop,
  onChange,
  reference_id: reference_id_prop,
}: ImagesFormProps) => {
  const committed_sorted = useMemo(
    () => normalize_vehicle_images(value_prop ?? []),
    [value_prop],
  );

  const value_ref = useRef<VehicleFormImage[]>(committed_sorted);
  useEffect(() => {
    value_ref.current = normalize_vehicle_images(value_prop ?? []);
  }, [value_prop]);

  const session_reference_id = useRef(
    reference_id_prop ?? crypto.randomUUID(),
  );
  const reference_id = reference_id_prop ?? session_reference_id.current;

  const [pending_items, setPendingItems] = useState<PendingItem[]>([]);
  const [is_dragging, setIsDragging] = useState(false);
  const [drag_source_index, set_drag_source_index] = useState<number | null>(
    null,
  );
  const [drag_over_index, set_drag_over_index] = useState<number | null>(null);
  const [paths_removing, set_paths_removing] = useState(() => new Set<string>());
  const file_input_ref = useRef<HTMLInputElement>(null);
  const drag_depth_ref = useRef(0);
  const form_field_id = useId();
  const cancelled_upload_keys_ref = useRef(new Set<string>());
  const pending_items_ref = useRef<PendingItem[]>([]);
  const locked_remove_paths_ref = useRef(new Set<string>());

  useEffect(() => {
    pending_items_ref.current = pending_items;
  }, [pending_items]);

  useEffect(() => {
    return () => {
      pending_items_ref.current.forEach((item) => {
        if (item.blob_preview.startsWith("blob:")) {
          URL.revokeObjectURL(item.blob_preview);
        }
      });
    };
  }, []);

  const handle_remove_pending = useCallback((temp_key: string) => {
    cancelled_upload_keys_ref.current.add(temp_key);
    setPendingItems((prev) => {
      const target = prev.find((p) => p.temp_key === temp_key);
      if (target?.blob_preview.startsWith("blob:")) {
        URL.revokeObjectURL(target.blob_preview);
      }
      return prev.filter((p) => p.temp_key !== temp_key);
    });
  }, []);

  const append_committed_path = useCallback(
    (path: string) => {
      const sorted = normalize_vehicle_images(value_ref.current);
      const next: VehicleFormImage[] = [
        ...sorted,
        { path, order: sorted.length },
      ];
      value_ref.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const commit_remove_committed_path = useCallback(
    (path: string) => {
      const next = normalize_vehicle_images(
        value_ref.current.filter((image) => image.path !== path),
      );
      value_ref.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const handle_click_remove_committed = useCallback(
    async (compound_path: string) => {
      if (locked_remove_paths_ref.current.has(compound_path)) return;

      let bucket_name: ReturnType<
        typeof split_storage_compound_path
      >["bucket_name"];
      let object_key: string;
      try {
        ({ bucket_name, object_key } = split_storage_compound_path(compound_path));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Ruta de imagen no válida.",
        );
        return;
      }

      locked_remove_paths_ref.current.add(compound_path);
      set_paths_removing((previous) => {
        const next = new Set(previous);
        next.add(compound_path);
        return next;
      });

      try {
        const result = await filesService.removeStoredFiles({
          bucket_name,
          paths: [object_key],
        });
        if (!result.ok) {
          toast.error("No se pudo eliminar el archivo del almacén.");
          return;
        }
        commit_remove_committed_path(compound_path);
      } finally {
        locked_remove_paths_ref.current.delete(compound_path);
        set_paths_removing((previous) => {
          const next = new Set(previous);
          next.delete(compound_path);
          return next;
        });
      }
    },
    [commit_remove_committed_path],
  );

  const reorder_committed = useCallback(
    (from_index: number, to_index: number) => {
      if (from_index === to_index) return;
      const sorted = normalize_vehicle_images(value_ref.current);
      if (
        from_index < 0 ||
        from_index >= sorted.length ||
        to_index < 0 ||
        to_index >= sorted.length
      ) {
        return;
      }
      const copy = [...sorted];
      const [moved] = copy.splice(from_index, 1);
      copy.splice(to_index, 0, moved);
      const next = copy.map((image, index) => ({
        path: image.path,
        order: index,
      }));
      value_ref.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const run_upload = useCallback(
    async (temp_key: string, file: File) => {
      try {
        const { path } = await filesService.uploadFile({
          file,
          bucket_name: "vehicles-images",
          file_key: filesService.generateFileKey(VEHICLE_GALLERY_TEMP_PREFIX, file),
          content_type: file.type as
            | "image/jpeg"
            | "image/png"
            | "image/jpg"
            | "image/webp",
          reference_id,
        });

        if (!path) {
          throw new Error("Sin ruta de archivo");
        }

        if (cancelled_upload_keys_ref.current.has(temp_key)) {
          cancelled_upload_keys_ref.current.delete(temp_key);
          return;
        }

        setPendingItems((prev) => {
          const item = prev.find((p) => p.temp_key === temp_key);
          if (item?.blob_preview.startsWith("blob:")) {
            URL.revokeObjectURL(item.blob_preview);
          }
          return prev.filter((p) => p.temp_key !== temp_key);
        });

        append_committed_path(path);
      } catch {
        toast.error(`No se pudo subir ${file.name}`);
        if (!cancelled_upload_keys_ref.current.has(temp_key)) {
          setPendingItems((prev) => {
            const item = prev.find((p) => p.temp_key === temp_key);
            if (item?.blob_preview.startsWith("blob:")) {
              URL.revokeObjectURL(item.blob_preview);
            }
            return prev.filter((p) => p.temp_key !== temp_key);
          });
        } else {
          cancelled_upload_keys_ref.current.delete(temp_key);
        }
      }
    },
    [append_committed_path, reference_id],
  );

  const handle_files_added = useCallback(
    (file_list: FileList | null) => {
      if (!file_list?.length) return;

      const files = Array.from(file_list).filter(is_valid_image_file);
      if (!files.length) return;

      const new_pending: PendingItem[] = files.map((file) => ({
        temp_key: crypto.randomUUID(),
        file,
        blob_preview: URL.createObjectURL(file),
      }));

      setPendingItems((prev) => [...prev, ...new_pending]);

      new_pending.forEach((item) => {
        void run_upload(item.temp_key, item.file);
      });
    },
    [run_upload],
  );

  const handle_drop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      drag_depth_ref.current = 0;
      setIsDragging(false);
      handle_files_added(e.dataTransfer.files);
    },
    [handle_files_added],
  );

  const handle_drag_over = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handle_drag_enter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag_depth_ref.current += 1;
    setIsDragging(true);
  }, []);

  const handle_drag_leave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag_depth_ref.current -= 1;
    if (drag_depth_ref.current <= 0) {
      drag_depth_ref.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handle_drop_zone_click = useCallback(() => {
    file_input_ref.current?.click();
  }, []);

  const handle_drop_zone_key_down = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handle_drop_zone_click();
      }
    },
    [handle_drop_zone_click],
  );

  const handle_committed_drag_start = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.dataTransfer.setData(VEHICLE_IMAGE_DRAG_TYPE, String(index));
      e.dataTransfer.effectAllowed = "move";
      set_drag_source_index(index);
      set_drag_over_index(null);
    },
    [],
  );

  const handle_committed_drag_end = useCallback(() => {
    set_drag_source_index(null);
    set_drag_over_index(null);
  }, []);

  const handle_committed_drag_over_item = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (![...e.dataTransfer.types].includes(VEHICLE_IMAGE_DRAG_TYPE)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      set_drag_over_index(index);
    },
    [],
  );

  const handle_committed_drag_leave_item = useCallback(
    (e: React.DragEvent) => {
      const related = e.relatedTarget as Node | null;
      if (related && e.currentTarget.contains(related)) return;
      set_drag_over_index(null);
    },
    [],
  );

  const handle_committed_drop_on_item = useCallback(
    (target_index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const from_str = e.dataTransfer.getData(VEHICLE_IMAGE_DRAG_TYPE);
      const from_index = Number.parseInt(from_str, 10);
      set_drag_source_index(null);
      set_drag_over_index(null);
      if (Number.isNaN(from_index)) return;
      reorder_committed(from_index, target_index);
    },
    [reorder_committed],
  );

  const input_id = `${form_field_id}-file-input`;
  const has_gallery =
    committed_sorted.length > 0 || pending_items.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar imágenes o abrir selector de archivos"
        onKeyDown={handle_drop_zone_key_down}
        onDrop={handle_drop}
        onDragOver={handle_drag_over}
        onDragEnter={handle_drag_enter}
        onDragLeave={handle_drag_leave}
        onClick={handle_drop_zone_click}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          is_dragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-muted-foreground/40 hover:border-muted-foreground hover:bg-muted/50",
        )}
      >
        <input
          id={input_id}
          ref={file_input_ref}
          type="file"
          multiple
          accept={accepted_mime_types.join(",")}
          onChange={(e) => {
            handle_files_added(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div
            className={cn(
              "p-4 rounded-full transition-colors",
              is_dragging
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {is_dragging ? (
              <ImagePlus className="h-8 w-8" aria-hidden />
            ) : (
              <Upload className="h-8 w-8" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {is_dragging
                ? "Suelta las fotos aquí"
                : "Arrastra y suelta tus fotos"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              o haz clic para seleccionar archivos
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="px-3 py-1 bg-muted text-foreground text-xs rounded-full border border-border">
              JPG
            </span>
            <span className="px-3 py-1 bg-muted text-foreground text-xs rounded-full border border-border">
              PNG
            </span>
            <span className="px-3 py-1 bg-muted text-foreground text-xs rounded-full border border-border">
              WEBP
            </span>
          </div>
        </div>
      </div>

      {has_gallery ? (
        <ul
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
          aria-label="Galería de imágenes del vehículo"
        >
          {committed_sorted.map((image, index) => (
            <li
              key={image.path}
              onDragOver={handle_committed_drag_over_item(index)}
              onDragLeave={handle_committed_drag_leave_item}
              onDrop={handle_committed_drop_on_item(index)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border bg-muted transition-[outline,opacity]",
                drag_over_index === index
                  ? "outline-2 outline-offset-2 outline-primary"
                  : "border-border",
                drag_source_index === index ? "opacity-50" : "opacity-100",
              )}
            >
              <img
                src={getImageUrl(image.path)}
                alt=""
                className="size-full object-cover pointer-events-none"
                draggable={false}
              />
              <div
                draggable
                onDragStart={handle_committed_drag_start(index)}
                onDragEnd={handle_committed_drag_end}
                className={cn(
                  "absolute left-2 top-2 flex h-9 w-9 cursor-grab items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm touch-none active:cursor-grabbing",
                  "hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                role="button"
                tabIndex={0}
                title="Arrastrar para reordenar"
                aria-label={`Reordenar imagen, posición ${index + 1}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                  }
                }}
              >
                <GripVertical className="size-5" aria-hidden />
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                disabled={paths_removing.has(image.path)}
                className="absolute top-2 right-2 rounded-full shadow-md disabled:opacity-60"
                onClick={(e) => {
                  e.stopPropagation();
                  void handle_click_remove_committed(image.path);
                }}
                aria-busy={paths_removing.has(image.path)}
                aria-label={
                  paths_removing.has(image.path)
                    ? "Eliminando imagen…"
                    : "Quitar imagen"
                }
              >
                {paths_removing.has(image.path) ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
              </Button>
            </li>
          ))}

          {pending_items.map((item) => (
            <li
              key={item.temp_key}
              className="relative aspect-square overflow-hidden rounded-lg border border-border bg-muted"
            >
              {item.blob_preview ? (
                <img
                  src={item.blob_preview}
                  alt=""
                  className="size-full object-cover opacity-70"
                />
              ) : null}
              <div className="absolute inset-0 flex items-center justify-center bg-background/65">
                <Loader2
                  className="size-8 animate-spin text-primary"
                  aria-label="Subiendo imagen"
                />
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                className="absolute top-2 right-2 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handle_remove_pending(item.temp_key);
                }}
                aria-label={`Cancelar subida de ${item.file.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {committed_sorted.length > 1 ? (
        <p className="text-sm text-muted-foreground">
          Usa el asa de cada imagen para arrastrarla y cambiar el orden.
        </p>
      ) : null}

      <Button
        type="button"
        variant="default"
        className="w-full gap-2"
        onClick={() => file_input_ref.current?.click()}
      >
        <Camera className="h-5 w-5" aria-hidden />
        Tomar foto o subir archivo
      </Button>
    </div>
  );
};
