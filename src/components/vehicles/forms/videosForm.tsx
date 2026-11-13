import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Clapperboard,
  GripVertical,
  Loader2,
  RotateCcw,
  Trash2,
  Upload,
  VideoIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn, getImageUrl } from "@/lib/utils";
import {
  abortMultipartVideoUpload,
  isAbortError,
  MultipartVideoUploadError,
  resolveVehicleVideoMimeType,
  uploadVehicleVideoMultipart,
  VEHICLE_VIDEO_MAX_BYTES,
  VEHICLE_VIDEO_MAX_DURATION_SECONDS,
  type MultipartVideoUploadSession,
} from "@/lib/upload/multipartVideoUpload";

import type { VehicleFormVideo } from "../schemas/vehicle.schema";

/** Margen sobre la duración máxima (redondeos de contenedor), igual que el backend. */
const DURATION_TOLERANCE_SECONDS = 1;

const VIDEO_ACCEPT_ATTRIBUTE = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/x-m4v",
  "video/3gpp",
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".m4v",
  ".3gp",
];

const VEHICLE_VIDEO_DRAG_TYPE = "application/x-vehicle-video-order";

const MAX_SIZE_MB = Math.round(VEHICLE_VIDEO_MAX_BYTES / (1024 * 1024));

export const normalize_vehicle_videos = (
  videos: VehicleFormVideo[],
): VehicleFormVideo[] =>
  [...videos]
    .sort((a, b) => a.order - b.order)
    .map((video, index) => ({ ...video, order: index }));

const video_key = (video: VehicleFormVideo) =>
  video.id ?? video.upload_id ?? `order-${video.order}`;

type PendingVideoStatus = "uploading" | "completing" | "failed";

type PendingVideoItem = {
  temp_key: string;
  file: File;
  preview_url: string;
  status: PendingVideoStatus;
  progress: number;
  error?: string;
  /** Si es `false`, reintentar no tiene sentido (p. ej. vídeo > 120 s). */
  retryable: boolean;
};

const revoke_blob_url = (url?: string | null) => {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
};

/** Duración en segundos, o `null` si el navegador no sabe leerla (p. ej. MKV/AVI). */
const read_video_duration_seconds = (file: File): Promise<number | null> =>
  new Promise((resolve) => {
    const object_url = URL.createObjectURL(file);
    const video_element = document.createElement("video");
    video_element.preload = "metadata";
    video_element.muted = true;

    const finish = (value: number | null) => {
      URL.revokeObjectURL(object_url);
      resolve(value);
    };

    video_element.addEventListener(
      "loadedmetadata",
      () => {
        const duration = video_element.duration;
        finish(Number.isFinite(duration) && duration > 0 ? duration : null);
      },
      { once: true },
    );
    video_element.addEventListener("error", () => finish(null), { once: true });
    video_element.src = object_url;
  });

const validate_vehicle_video = async (file: File): Promise<boolean> => {
  if (file.size > VEHICLE_VIDEO_MAX_BYTES) {
    toast.error(
      `${file.name}: el vídeo supera el límite de ${MAX_SIZE_MB} MB (${Math.round(file.size / (1024 * 1024))} MB).`,
    );
    return false;
  }

  if (!resolveVehicleVideoMimeType(file)) {
    toast.error(`${file.name}: formato no admitido. Usa MP4, MOV, WEBM, MKV o AVI.`);
    return false;
  }

  // Si el navegador no puede leer la duración, la valida el backend al completar.
  const duration_seconds = await read_video_duration_seconds(file);
  if (
    duration_seconds !== null &&
    duration_seconds > VEHICLE_VIDEO_MAX_DURATION_SECONDS + DURATION_TOLERANCE_SECONDS
  ) {
    toast.error(
      `${file.name}: la duración máxima es ${VEHICLE_VIDEO_MAX_DURATION_SECONDS} s (detectado ~${Math.ceil(duration_seconds)} s).`,
    );
    return false;
  }

  return true;
};

const upload_error_message = (error: unknown) =>
  error instanceof Error && error.message
    ? error.message
    : "No se pudo subir el vídeo.";

export type VideosFormProps = {
  value?: VehicleFormVideo[];
  onChange?: (videos: VehicleFormVideo[]) => void;
  /** `true` mientras haya vídeos subiendo, completándose o con error. */
  onUploadStatusChange?: (hasIncompleteUploads: boolean) => void;
};

export const VideosForm = ({
  value: valueProp,
  onChange,
  onUploadStatusChange,
}: VideosFormProps) => {
  const committedSorted = useMemo(
    () => normalize_vehicle_videos(valueProp ?? []),
    [valueProp],
  );

  const valueRef = useRef<VehicleFormVideo[]>(committedSorted);
  useEffect(() => {
    valueRef.current = normalize_vehicle_videos(valueProp ?? []);
  }, [valueProp]);

  const [pendingItems, setPendingItems] = useState<PendingVideoItem[]>([]);
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragDepthFilesRef = useRef(0);
  const formFieldId = useId();

  const pendingItemsRef = useRef<PendingVideoItem[]>([]);
  const controllersRef = useRef(new Map<string, AbortController>());
  const sessionsRef = useRef(new Map<string, MultipartVideoUploadSession>());
  const lastProgressRef = useRef(new Map<string, number>());

  useEffect(() => {
    pendingItemsRef.current = pendingItems;
  }, [pendingItems]);

  const onUploadStatusChangeRef = useRef(onUploadStatusChange);
  useEffect(() => {
    onUploadStatusChangeRef.current = onUploadStatusChange;
  }, [onUploadStatusChange]);

  useEffect(() => {
    onUploadStatusChange?.(pendingItems.length > 0);
  }, [pendingItems, onUploadStatusChange]);

  // Al desmontar (cerrar el diálogo): cancelar subidas en curso y liberar sesiones.
  useEffect(() => {
    const controllers = controllersRef.current;
    const sessions = sessionsRef.current;
    return () => {
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
      sessions.forEach((session) => {
        void abortMultipartVideoUpload(session.upload_id);
      });
      sessions.clear();
      pendingItemsRef.current.forEach((item) => revoke_blob_url(item.preview_url));
      onUploadStatusChangeRef.current?.(false);
    };
  }, []);

  const updatePending = useCallback(
    (tempKey: string, patch: Partial<PendingVideoItem>) => {
      setPendingItems((previous) =>
        previous.map((item) =>
          item.temp_key === tempKey ? { ...item, ...patch } : item,
        ),
      );
    },
    [],
  );

  const commitVideos = useCallback(
    (next: VehicleFormVideo[]) => {
      const normalized = normalize_vehicle_videos(next);
      valueRef.current = normalized;
      onChange?.(normalized);
    },
    [onChange],
  );

  const runUpload = useCallback(
    async (tempKey: string, file: File) => {
      controllersRef.current.get(tempKey)?.abort();
      const controller = new AbortController();
      controllersRef.current.set(tempKey, controller);
      updatePending(tempKey, { status: "uploading", error: undefined });

      try {
        const result = await uploadVehicleVideoMultipart({
          file,
          session: sessionsRef.current.get(tempKey) ?? null,
          signal: controller.signal,
          onSession: (session) => {
            sessionsRef.current.set(tempKey, session);
          },
          onPhase: (phase) => {
            if (phase === "completing") {
              updatePending(tempKey, { status: "completing", progress: 100 });
            }
          },
          onProgress: ({ percent }) => {
            if (lastProgressRef.current.get(tempKey) === percent) return;
            lastProgressRef.current.set(tempKey, percent);
            updatePending(tempKey, { progress: percent });
          },
        });

        if (controller.signal.aborted) return;

        const pending = pendingItemsRef.current.find(
          (item) => item.temp_key === tempKey,
        );
        controllersRef.current.delete(tempKey);
        sessionsRef.current.delete(tempKey);
        lastProgressRef.current.delete(tempKey);
        setPendingItems((previous) =>
          previous.filter((item) => item.temp_key !== tempKey),
        );
        commitVideos([
          ...valueRef.current,
          {
            upload_id: result.upload_id,
            order: valueRef.current.length,
            preview_url: pending?.preview_url,
            file_name: file.name,
          },
        ]);
      } catch (error) {
        if (isAbortError(error) || controller.signal.aborted) return;
        controllersRef.current.delete(tempKey);

        const retryable =
          !(error instanceof MultipartVideoUploadError) || error.retryable;
        if (!retryable) {
          // La sesión ya no sirve (vídeo rechazado): liberarla.
          const session = sessionsRef.current.get(tempKey);
          if (session) void abortMultipartVideoUpload(session.upload_id);
          sessionsRef.current.delete(tempKey);
        }
        const message = upload_error_message(error);
        toast.error(`${file.name}: ${message}`);
        updatePending(tempKey, { status: "failed", error: message, retryable });
      }
    },
    [commitVideos, updatePending],
  );

  const handleRetry = useCallback(
    (item: PendingVideoItem) => {
      void runUpload(item.temp_key, item.file);
    },
    [runUpload],
  );

  // Al recuperar la conexión, reanudar las subidas que fallaron por red.
  useEffect(() => {
    const handleOnline = () => {
      pendingItemsRef.current
        .filter((item) => item.status === "failed" && item.retryable)
        .forEach((item) => void runUpload(item.temp_key, item.file));
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [runUpload]);

  const handleCancelPending = useCallback((tempKey: string) => {
    controllersRef.current.get(tempKey)?.abort();
    controllersRef.current.delete(tempKey);
    const session = sessionsRef.current.get(tempKey);
    if (session) void abortMultipartVideoUpload(session.upload_id);
    sessionsRef.current.delete(tempKey);
    lastProgressRef.current.delete(tempKey);
    setPendingItems((previous) => {
      revoke_blob_url(previous.find((item) => item.temp_key === tempKey)?.preview_url);
      return previous.filter((item) => item.temp_key !== tempKey);
    });
  }, []);

  const handleRemoveCommitted = useCallback(
    (video: VehicleFormVideo) => {
      // Subida nueva aún no asociada al vehículo: liberarla en el backend.
      // Vídeo ya guardado: se elimina al guardar (estado final de `videos`).
      if (video.upload_id) {
        void abortMultipartVideoUpload(video.upload_id);
        revoke_blob_url(video.preview_url);
      }
      commitVideos(
        valueRef.current.filter((item) => video_key(item) !== video_key(video)),
      );
    },
    [commitVideos],
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
      commitVideos(copy.map((video, index) => ({ ...video, order: index })));
    },
    [commitVideos],
  );

  const handleFilesAdded = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList?.length) return;

      const accepted: File[] = [];
      for (const file of Array.from(fileList)) {
        if (await validate_vehicle_video(file)) accepted.push(file);
      }
      if (!accepted.length) return;

      const newItems: PendingVideoItem[] = accepted.map((file) => ({
        temp_key: crypto.randomUUID(),
        file,
        preview_url: URL.createObjectURL(file),
        status: "uploading",
        progress: 0,
        retryable: true,
      }));

      setPendingItems((previous) => [...previous, ...newItems]);
      newItems.forEach((item) => void runUpload(item.temp_key, item.file));
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
      if (![...e.dataTransfer.types].includes(VEHICLE_VIDEO_DRAG_TYPE)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    [],
  );

  const handleCommittedDragLeaveItem = useCallback((e: React.DragEvent) => {
    const related_target = e.relatedTarget as Node | null;
    if (related_target && e.currentTarget.contains(related_target)) return;
    setDragOverIndex(null);
  }, []);

  const handleCommittedDropOnItem = useCallback(
    (targetIndex: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const fromIndex = Number.parseInt(
        e.dataTransfer.getData(VEHICLE_VIDEO_DRAG_TYPE),
        10,
      );
      setDragSourceIndex(null);
      setDragOverIndex(null);
      if (Number.isNaN(fromIndex)) return;
      reorderCommitted(fromIndex, targetIndex);
    },
    [reorderCommitted],
  );

  const inputId = `${formFieldId}-video-input`;
  const hasGallery = committedSorted.length > 0 || pendingItems.length > 0;

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
              o haz clic para seleccionar (máximo {MAX_SIZE_MB} MB y{" "}
              {VEHICLE_VIDEO_MAX_DURATION_SECONDS / 60} minutos cada uno)
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {["MP4", "MOV", "WEBM", "MKV", "AVI"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="max-w-md text-xs text-muted-foreground">
            El vídeo se sube al elegirlo. Al guardar, el servidor lo optimiza
            (máx. 1080p) en segundo plano.
          </p>
        </div>
      </div>

      {hasGallery ? (
        <ul
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Lista de vídeos del vehículo"
        >
          {committedSorted.map((video, index) => {
            const source = video.preview_url ?? (video.url ? getImageUrl(video.url) : "");
            const poster = video.thumbnail_url
              ? getImageUrl(video.thumbnail_url)
              : undefined;
            // Vídeos guardados: `uploaded`/`processing` aún no tienen URL reproducible.
            const is_failed = video.status === "failed";
            const is_processing =
              Boolean(video.status) && video.status !== "ready" && !is_failed;
            return (
              <li
                key={video_key(video)}
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
                  {source ? (
                    <video
                      src={source}
                      poster={poster}
                      className="size-full object-contain"
                      controls
                      preload="metadata"
                      playsInline
                    >
                      Tu navegador no admite la reproducción de vídeo HTML5.
                    </video>
                  ) : poster ? (
                    <img
                      src={poster}
                      alt="Miniatura del vídeo"
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <VideoIcon className="size-8" aria-hidden />
                    </div>
                  )}
                </div>
                {is_processing || is_failed ? (
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 py-1.5 text-xs font-medium",
                      is_failed
                        ? "bg-destructive text-white"
                        : "bg-background/90 text-foreground",
                    )}
                  >
                    {is_failed ? (
                      <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                    ) : (
                      <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
                    )}
                    <span className="truncate">
                      {is_failed
                        ? "Error al procesar el vídeo"
                        : "Procesando…"}
                    </span>
                  </div>
                ) : null}
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
                  className="absolute top-2 right-2 rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveCommitted(video);
                  }}
                  aria-label="Quitar vídeo"
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              </li>
            );
          })}

          {pendingItems.map((item) => {
            const is_failed = item.status === "failed";
            return (
              <li
                key={item.temp_key}
                className={cn(
                  "relative overflow-hidden rounded-lg border bg-muted",
                  is_failed ? "border-destructive" : "border-border",
                )}
              >
                <div className="relative aspect-video w-full bg-black">
                  <video
                    src={item.preview_url}
                    className="size-full object-contain opacity-60"
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 px-6 text-center">
                  {is_failed ? (
                    <>
                      <AlertCircle className="size-7 text-destructive" aria-hidden />
                      <span className="line-clamp-2 text-xs font-medium text-destructive">
                        {item.error ?? "Error al subir el vídeo."}
                      </span>
                      {item.retryable ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="gap-1.5"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(item);
                          }}
                        >
                          <RotateCcw className="size-3.5" aria-hidden />
                          Reintentar
                        </Button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <Loader2
                        className="size-7 animate-spin text-primary"
                        aria-hidden
                      />
                      <span className="text-xs font-medium text-foreground">
                        {item.status === "completing"
                          ? "Verificando vídeo…"
                          : `Subiendo… ${item.progress}%`}
                      </span>
                      <div
                        className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-muted"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={item.progress}
                        aria-label={`Progreso de subida de ${item.file.name}`}
                      >
                        <div
                          className="h-full bg-primary transition-[width] duration-200"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </>
                  )}
                  <span className="max-w-full truncate text-[11px] text-muted-foreground">
                    {item.file.name}
                  </span>
                </div>
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="absolute top-2 right-2 rounded-full shadow-md"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelPending(item.temp_key);
                  }}
                  aria-label={
                    is_failed
                      ? `Quitar ${item.file.name}`
                      : `Cancelar subida de ${item.file.name}`
                  }
                >
                  {is_failed ? (
                    <Trash2 className="size-4" aria-hidden />
                  ) : (
                    <X className="size-4" aria-hidden />
                  )}
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {committedSorted.length > 1 ? (
        <p className="text-sm text-muted-foreground">
          Usa el asa para arrastrar y cambiar el orden de los vídeos.
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
