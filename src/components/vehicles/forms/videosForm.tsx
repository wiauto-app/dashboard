import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  GripVertical,
  Loader2,
  Trash2,
  Upload,
  VideoIcon,
  Clapperboard,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import {
  filesService,
  normalize_vehicle_video_upload_content_type,
  split_storage_compound_path,
} from "@/services/files/filesService";

import type { VehicleFormVideo } from "../schemas/vehicle.schema";

/** 100 MiB — límite de tamaño antes de enviar la subida firmada. */
const VEHICLE_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

/** Duración máxima permitida (3 minutos), validada desde metadatos del fichero local. */
const VEHICLE_VIDEO_MAX_DURATION_SECONDS = 3 * 60;

const VIDEO_ACCEPT_ATTRIBUTE = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
];

const VEHICLE_VIDEO_DRAG_TYPE = "application/x-vehicle-video-order";

export const normalize_vehicle_videos = (
  videos: VehicleFormVideo[],
): VehicleFormVideo[] =>
  [...videos]
    .sort((a, b) => a.order - b.order)
    .map((video, index) => ({
      path: video.path,
      order: index,
    }));

type PendingVideoItem = {
  temp_key: string;
  file: File;
  blob_preview_url: string;
};

const read_video_duration_seconds_from_file = (file: File): Promise<number> =>
  new Promise((resolve, reject) => {
    const object_url = URL.createObjectURL(file);
    const video_element = document.createElement("video");
    video_element.preload = "metadata";
    video_element.muted = true;

    const handle_cleanup = () => {
      URL.revokeObjectURL(object_url);
    };

    const handle_loaded_metadata = () => {
      const duration_value = video_element.duration;
      handle_cleanup();
      if (!Number.isFinite(duration_value) || duration_value <= 0) {
        reject(
          new Error("No se pudo determinar la duración del vídeo con precisión."),
        );
        return;
      }
      resolve(duration_value);
    };

    const handle_error = () => {
      handle_cleanup();
      reject(new Error("No se pudieron leer los metadatos del vídeo."));
    };

    video_element.addEventListener("loadedmetadata", handle_loaded_metadata, {
      once: true,
    });
    video_element.addEventListener("error", handle_error, { once: true });
    video_element.src = object_url;
  });

const validate_vehicle_video_constraints = async (file: File) => {
  if (file.size > VEHICLE_VIDEO_MAX_BYTES) {
    toast.error(
      `${file.name}: el vídeo supera el límite de 100 MB (${Math.round(file.size / (1024 * 1024))} MB).`,
    );
    return false;
  }

  const content_type_normalized =
    normalize_vehicle_video_upload_content_type(file);
  if (!content_type_normalized) {
    toast.error(
      `${file.name}: formato no admitido. Usa MP4, MOV, AVI, MKV o WEBM.`,
    );
    return false;
  }

  try {
    const duration_seconds = await read_video_duration_seconds_from_file(file);
    if (duration_seconds - VEHICLE_VIDEO_MAX_DURATION_SECONDS > 0.5) {
      toast.error(
        `${file.name}: la duración máxima permitida es 3 minutos (detectado ~${Math.ceil(duration_seconds)} s).`,
      );
      return false;
    }
  } catch (error) {
    toast.error(
      error instanceof Error
        ? error.message
        : "No se pudo validar la duración del vídeo.",
    );
    return false;
  }

  return true;
};

export type VideosFormProps = {
  value?: VehicleFormVideo[];
  onChange?: (videos: VehicleFormVideo[]) => void;
};

export const VideosForm = ({
  value: valueProp,
  onChange,
}: VideosFormProps) => {
  const committedSorted = useMemo(
    () => normalize_vehicle_videos(valueProp ?? []),
    [valueProp],
  );

  const valueRef = useRef<VehicleFormVideo[]>(committedSorted);
  useEffect(() => {
    valueRef.current = normalize_vehicle_videos(valueProp ?? []);
  }, [valueProp]);

  const [pendingVideoItems, setPendingVideoItems] = useState<PendingVideoItem[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(
    null,
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(
    null,
  );
  const [pathsRemoving, setPathsRemoving] = useState(
    () => new Set<string>(),
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthFilesRef = useRef(0);
  const formFieldId = useId();
  const cancelledUploadKeysRef = useRef(new Set<string>());
  const pendingVideoItemsRef = useRef<PendingVideoItem[]>([]);
  const lockedRemovePathsRef = useRef(new Set<string>());

  useEffect(() => {
    pendingVideoItemsRef.current = pendingVideoItems;
  }, [pendingVideoItems]);

  useEffect(() => {
    return () => {
      pendingVideoItemsRef.current.forEach((item) => {
        if (item.blob_preview_url.startsWith("blob:")) {
          URL.revokeObjectURL(item.blob_preview_url);
        }
      });
    };
  }, []);

  const handleRemovePending = useCallback((tempKey: string) => {
    cancelledUploadKeysRef.current.add(tempKey);
    setPendingVideoItems((previous) => {
      const target = previous.find((p) => p.temp_key === tempKey);
      if (target?.blob_preview_url.startsWith("blob:")) {
        URL.revokeObjectURL(target.blob_preview_url);
      }
      return previous.filter((p) => p.temp_key !== tempKey);
    });
  }, []);

  const appendCommittedPath = useCallback(
    (compoundPath: string) => {
      const sorted = normalize_vehicle_videos(valueRef.current);
      const next: VehicleFormVideo[] = [
        ...sorted,
        { path: compoundPath, order: sorted.length },
      ];
      valueRef.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const commitRemoveCommittedPath = useCallback(
    (compoundPath: string) => {
      const next = normalize_vehicle_videos(
        valueRef.current.filter((video) => video.path !== compoundPath),
      );
      valueRef.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const handleClickRemoveCommitted = useCallback(
    async (compoundPath: string) => {
      if (lockedRemovePathsRef.current.has(compoundPath)) return;

      let bucket_name: ReturnType<
        typeof split_storage_compound_path
      >["bucket_name"];
      let object_key: string;
      try {
        ({ bucket_name, object_key } = split_storage_compound_path(compoundPath));
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Ruta de vídeo no válida.",
        );
        return;
      }

      lockedRemovePathsRef.current.add(compoundPath);
      setPathsRemoving((previous) => {
        const next = new Set(previous);
        next.add(compoundPath);
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
        commitRemoveCommittedPath(compoundPath);
      } finally {
        lockedRemovePathsRef.current.delete(compoundPath);
        setPathsRemoving((previous) => {
          const next = new Set(previous);
          next.delete(compoundPath);
          return next;
        });
      }
    },
    [commitRemoveCommittedPath],
  );

  const reorderCommitted = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const sorted = normalize_vehicle_videos(valueRef.current);
      if (
        fromIndex < 0 ||
        fromIndex >= sorted.length ||
        toIndex < 0 ||
        toIndex >= sorted.length
      ) {
        return;
      }
      const copy = [...sorted];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      const next = copy.map((video, index) => ({
        path: video.path,
        order: index,
      }));
      valueRef.current = next;
      onChange?.(next);
    },
    [onChange],
  );

  const runUpload = useCallback(
    async (tempKey: string, file: File) => {
      try {
        const { path } = await filesService.upload_vehicle_video(file);
        if (!path) {
          if (!cancelledUploadKeysRef.current.has(tempKey)) {
            setPendingVideoItems((previous) => {
              const pending = previous.find((p) => p.temp_key === tempKey);
              if (pending?.blob_preview_url.startsWith("blob:")) {
                URL.revokeObjectURL(pending.blob_preview_url);
              }
              return previous.filter((p) => p.temp_key !== tempKey);
            });
          } else {
            cancelledUploadKeysRef.current.delete(tempKey);
          }
          return;
        }

        if (cancelledUploadKeysRef.current.has(tempKey)) {
          cancelledUploadKeysRef.current.delete(tempKey);
          return;
        }

        setPendingVideoItems((previous) => {
          const pending = previous.find((p) => p.temp_key === tempKey);
          if (pending?.blob_preview_url.startsWith("blob:")) {
            URL.revokeObjectURL(pending.blob_preview_url);
          }
          return previous.filter((p) => p.temp_key !== tempKey);
        });

        appendCommittedPath(path);
      } catch {
        toast.error(`No se pudo completar la subida de ${file.name}`);
        if (!cancelledUploadKeysRef.current.has(tempKey)) {
          setPendingVideoItems((previous) => {
            const pending = previous.find((p) => p.temp_key === tempKey);
            if (pending?.blob_preview_url.startsWith("blob:")) {
              URL.revokeObjectURL(pending.blob_preview_url);
            }
            return previous.filter((p) => p.temp_key !== tempKey);
          });
        } else {
          cancelledUploadKeysRef.current.delete(tempKey);
        }
      }
    },
    [appendCommittedPath],
  );

  const handleFilesAdded = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;

      const filtered: File[] = [];
      for (const file of Array.from(fileList)) {
        if (await validate_vehicle_video_constraints(file)) {
          filtered.push(file);
        }
      }
      if (!filtered.length) return;

      const newPending: PendingVideoItem[] = filtered.map((file_item) => ({
        temp_key: crypto.randomUUID(),
        file: file_item,
        blob_preview_url: URL.createObjectURL(file_item),
      }));

      setPendingVideoItems((previous) => [...previous, ...newPending]);

      newPending.forEach((item) => {
        void runUpload(item.temp_key, item.file);
      });
    },
    [runUpload],
  );

  const handleDropZoneDropFiles = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragDepthFilesRef.current = 0;
      setIsDraggingFiles(false);
      void handleFilesAdded(e.dataTransfer.files);
    },
    [handleFilesAdded],
  );

  const handleDropZoneDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDropZoneDragEnterFiles = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthFilesRef.current += 1;
    setIsDraggingFiles(true);
  }, []);

  const handleDropZoneDragLeaveFiles = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragDepthFilesRef.current -= 1;
    if (dragDepthFilesRef.current <= 0) {
      dragDepthFilesRef.current = 0;
      setIsDraggingFiles(false);
    }
  }, []);

  const handleDropZoneActivate = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleDropZoneKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDropZoneActivate();
      }
    },
    [handleDropZoneActivate],
  );

  const handleCommittedDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.dataTransfer.setData(VEHICLE_VIDEO_DRAG_TYPE, String(index));
      e.dataTransfer.effectAllowed = "move";
      setDragSourceIndex(index);
      setDragOverIndex(null);
    },
    [],
  );

  const handleCommittedDragEnd = useCallback(() => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleCommittedDragOverItem = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (![...e.dataTransfer.types].includes(VEHICLE_VIDEO_DRAG_TYPE))
        return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    [],
  );

  const handleCommittedDragLeaveItem = useCallback(
    (e: React.DragEvent) => {
      const related_target = e.relatedTarget as Node | null;
      if (
        related_target &&
        e.currentTarget.contains(related_target)
      )
        return;
      setDragOverIndex(null);
    },
    [],
  );

  const handleCommittedDropOnItem = useCallback(
    (targetIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const fromString = e.dataTransfer.getData(VEHICLE_VIDEO_DRAG_TYPE);
      const fromIndex = Number.parseInt(fromString, 10);
      setDragSourceIndex(null);
      setDragOverIndex(null);
      if (Number.isNaN(fromIndex)) return;
      reorderCommitted(fromIndex, targetIndex);
    },
    [reorderCommitted],
  );

  const inputId = `${formFieldId}-video-input`;
  const hasGallery =
    committedSorted.length > 0 || pendingVideoItems.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar vídeos o abrir selector de archivos"
        onKeyDown={handleDropZoneKeyDown}
        onDrop={handleDropZoneDropFiles}
        onDragOver={handleDropZoneDragOver}
        onDragEnter={handleDropZoneDragEnterFiles}
        onDragLeave={handleDropZoneDragLeaveFiles}
        onClick={handleDropZoneActivate}
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isDraggingFiles
            ? "scale-[1.02] border-primary bg-primary/10"
            : "border-muted-foreground/40 hover:border-muted-foreground hover:bg-muted/50",
        )}
      >
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          multiple
          accept={VIDEO_ACCEPT_ATTRIBUTE.join(",")}
          onChange={(e) => {
            void handleFilesAdded(e.target.files);
            e.target.value = "";
          }}
          className="sr-only"
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div
            className={cn(
              "rounded-full p-4 transition-colors",
              isDraggingFiles
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {isDraggingFiles ? (
              <VideoIcon className="h-8 w-8" aria-hidden />
            ) : (
              <Upload className="h-8 w-8" aria-hidden />
            )}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isDraggingFiles
                ? "Suelta los vídeos aquí"
                : "Arrastra y suelta tus vídeos"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              o haz clic para seleccionar (máximo 100 MB y 3 minutos de duración
              cada uno)
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["MP4", "MOV", "WEBM", "AVI", "MKV"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            Tras confirmar la subida, el servidor procesa el fichero en segundo
            plano (puede tardar unos instantes antes de reproducir la versión MP4).
          </p>
        </div>
      </div>

      {hasGallery ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Lista de vídeos del vehículo"
        >
          {committedSorted.map((video, index) => (
            <li
              key={video.path}
              onDragOver={handleCommittedDragOverItem(index)}
              onDragLeave={handleCommittedDragLeaveItem}
              onDrop={handleCommittedDropOnItem(index)}
              className={cn(
                "relative overflow-hidden rounded-lg border bg-muted transition-[outline,opacity]",
                dragOverIndex === index
                  ? "outline-2 outline-offset-2 outline-primary"
                  : "border-border",
                dragSourceIndex === index ? "opacity-50" : "opacity-100",
              )}
            >
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={getImageUrl(video.path)}
                  className="size-full object-contain"
                  controls
                  preload="metadata"
                  playsInline
                >
                  Tu navegador no admite la reproducción de vídeo HTML5.
                </video>
              </div>
              <div
                draggable
                onDragStart={handleCommittedDragStart(index)}
                onDragEnd={handleCommittedDragEnd}
                className={cn(
                  "absolute left-2 top-2 flex h-9 w-9 cursor-grab items-center justify-center rounded-md bg-background/90 text-foreground shadow-sm touch-none active:cursor-grabbing",
                  "hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                )}
                role="button"
                tabIndex={0}
                title="Arrastrar para reordenar"
                aria-label={`Reordenar vídeo, posición ${index + 1}`}
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
                disabled={pathsRemoving.has(video.path)}
                className="absolute top-2 right-2 rounded-full shadow-md disabled:opacity-60"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleClickRemoveCommitted(video.path);
                }}
                aria-busy={pathsRemoving.has(video.path)}
                aria-label={
                  pathsRemoving.has(video.path)
                    ? "Eliminando vídeo…"
                    : "Quitar vídeo"
                }
              >
                {pathsRemoving.has(video.path) ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="size-4" aria-hidden />
                )}
              </Button>
            </li>
          ))}

          {pendingVideoItems.map((item) => (
            <li
              key={item.temp_key}
              className="relative overflow-hidden rounded-lg border border-border bg-muted"
            >
              <div className="relative aspect-video w-full bg-black">
                <video
                  src={item.blob_preview_url}
                  className="size-full object-contain opacity-80"
                  muted
                  playsInline
                  preload="metadata"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/65">
                <Loader2
                  className="size-8 animate-spin text-primary"
                  aria-label="Subiendo vídeo"
                />
                <span className="text-xs font-medium text-foreground">
                  Subiendo…
                </span>
              </div>
              <Button
                type="button"
                size="icon-sm"
                variant="destructive"
                className="absolute top-10 right-2 rounded-full shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePending(item.temp_key);
                }}
                aria-label={`Cancelar subida de ${item.file.name}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      {committedSorted.length > 1 ? (
        <p className="text-sm text-muted-foreground">
          Usa el asa para arrastrar y cambiar el orden de los vídeos publicados.
        </p>
      ) : null}

      <Button
        type="button"
        variant="default"
        className="w-full gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Clapperboard className="h-5 w-5" aria-hidden />
        Seleccionar vídeos
      </Button>
    </div>
  );
};
