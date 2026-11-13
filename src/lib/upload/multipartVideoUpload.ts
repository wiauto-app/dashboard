import type { apiResponse } from "@/services/api";
import {
  filesService,
  type CompleteVehicleVideoUploadResponse,
} from "@/services/files/filesService";

/**
 * Subida multipart directa a R2 de vídeos de vehículo.
 *
 * Flujo: init → URLs prefirmadas por lotes (≤ 20) → PUT de cada parte por XHR
 * (concurrencia 4, 3 reintentos con backoff, se guarda el `ETag`) → complete.
 * Reanudar: con una sesión previa se consulta `GET /parts` y solo se suben las
 * partes que faltan. Cancelar ⇒ `abortMultipartVideoUpload` (`DELETE`).
 *
 * Requiere que el CORS del bucket exponga la cabecera `ETag`.
 */

export const VEHICLE_VIDEO_MAX_BYTES = 300 * 1024 * 1024;
export const VEHICLE_VIDEO_MAX_DURATION_SECONDS = 120;

const PART_CONCURRENCY = 4;
const PART_URL_BATCH_SIZE = 20;
const PART_MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1_000;

/** MIME admitidos por el backend (`VEHICLE_VIDEO_MIME_TO_EXTENSION`). */
const SUPPORTED_MIME_TYPES = new Set([
  "video/mp4",
  "video/x-m4v",
  "video/quicktime",
  "video/mov",
  "video/webm",
  "video/x-matroska",
  "video/mkv",
  "video/x-msvideo",
  "video/avi",
  "video/3gpp",
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/x-m4v",
  mov: "video/quicktime",
  webm: "video/webm",
  mkv: "video/x-matroska",
  avi: "video/x-msvideo",
  "3gp": "video/3gpp",
};

/** MIME a enviar al backend, o `null` si el formato no se admite. */
export const resolveVehicleVideoMimeType = (file: File): string | null => {
  const type = file.type.trim().toLowerCase().split(";")[0];
  if (type && SUPPORTED_MIME_TYPES.has(type)) return type;
  const extension = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : undefined;
  return extension ? (EXTENSION_TO_MIME[extension] ?? null) : null;
};

/** Datos mínimos para reanudar una subida ya iniciada. */
export interface MultipartVideoUploadSession {
  upload_id: string;
  part_size: number;
  part_count: number;
}

export type MultipartVideoUploadPhase = "initiating" | "uploading" | "completing";

export interface MultipartVideoUploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  /** 0-100 */
  percent: number;
}

export interface MultipartVideoUploadOptions {
  file: File;
  /** Sesión previa: si existe, se reanuda en lugar de iniciar otra. */
  session?: MultipartVideoUploadSession | null;
  signal?: AbortSignal;
  /** Se llama en cuanto hay sesión (para poder reanudar o cancelar luego). */
  onSession?: (session: MultipartVideoUploadSession) => void;
  onPhase?: (phase: MultipartVideoUploadPhase) => void;
  onProgress?: (progress: MultipartVideoUploadProgress) => void;
}

export type MultipartVideoUploadResult = CompleteVehicleVideoUploadResponse;

export class MultipartVideoUploadError extends Error {
  readonly status?: number;
  /** `true` si reintentar (reanudar) puede funcionar. */
  readonly retryable: boolean;

  constructor(message: string, opts: { status?: number; retryable: boolean }) {
    super(message);
    this.name = "MultipartVideoUploadError";
    this.status = opts.status;
    this.retryable = opts.retryable;
  }
}

export const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const createAbortError = () =>
  new DOMException("Subida cancelada.", "AbortError");

const throwIfAborted = (signal?: AbortSignal) => {
  if (signal?.aborted) throw createAbortError();
};

const wait = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, ms);
    const handleAbort = () => {
      clearTimeout(timer);
      reject(createAbortError());
    };
    signal?.addEventListener("abort", handleAbort, { once: true });
  });

const backoffDelay = (attempt: number) =>
  RETRY_BASE_DELAY_MS * 2 ** attempt + Math.round(Math.random() * 250);

/** 4xx distintos de 408/429 no se arreglan reintentando. */
const isRetryableStatus = (status: number) =>
  status === 0 || status === 408 || status === 429 || status >= 500;

/** Llama al API y convierte errores HTTP / de red en `MultipartVideoUploadError`. */
const callApi = async <T>(
  request: () => Promise<apiResponse<T>>,
  fallbackMessage: string,
): Promise<T> => {
  let response: apiResponse<T>;
  try {
    response = await request();
  } catch {
    throw new MultipartVideoUploadError(
      "Error de conexión con el servidor.",
      { retryable: true },
    );
  }
  if (!response.ok) {
    throw new MultipartVideoUploadError(response.message || fallbackMessage, {
      status: response.status,
      retryable: isRetryableStatus(response.status),
    });
  }
  return response.data;
};

const partByteRange = (
  partNumber: number,
  partSize: number,
  totalBytes: number,
) => {
  const start = (partNumber - 1) * partSize;
  return { start, end: Math.min(start + partSize, totalBytes) };
};

class PartUploadHttpError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`HTTP ${status}`);
    this.status = status;
  }
}

/** PUT de una parte por XHR (progreso fino). Devuelve el `ETag`. */
const putPart = (
  url: string,
  body: Blob,
  signal: AbortSignal | undefined,
  onLoaded: (loaded: number) => void,
) =>
  new Promise<string>((resolve, reject) => {
    if (signal?.aborted) {
      reject(createAbortError());
      return;
    }
    const xhr = new XMLHttpRequest();
    const handleAbort = () => xhr.abort();
    const cleanup = () => signal?.removeEventListener("abort", handleAbort);
    signal?.addEventListener("abort", handleAbort, { once: true });

    xhr.upload.addEventListener("progress", (event) => {
      onLoaded(event.loaded);
    });
    xhr.addEventListener("load", () => {
      cleanup();
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new PartUploadHttpError(xhr.status));
        return;
      }
      const etag = xhr.getResponseHeader("ETag");
      if (!etag) {
        reject(
          new MultipartVideoUploadError(
            "El almacenamiento no expone la cabecera ETag (revisa el CORS del bucket).",
            { retryable: false },
          ),
        );
        return;
      }
      resolve(etag);
    });
    xhr.addEventListener("error", () => {
      cleanup();
      reject(new PartUploadHttpError(0));
    });
    xhr.addEventListener("timeout", () => {
      cleanup();
      reject(new PartUploadHttpError(0));
    });
    xhr.addEventListener("abort", () => {
      cleanup();
      reject(createAbortError());
    });

    xhr.open("PUT", url);
    xhr.send(body);
  });

const initSession = async (file: File): Promise<MultipartVideoUploadSession> => {
  const mimeType = resolveVehicleVideoMimeType(file);
  if (!mimeType) {
    throw new MultipartVideoUploadError(
      "Formato de vídeo no admitido. Usa MP4, MOV, WEBM, MKV o AVI.",
      { retryable: false },
    );
  }
  const data = await callApi(
    () =>
      filesService.initVehicleVideoUpload({
        mime_type: mimeType,
        size_bytes: file.size,
        original_filename: file.name,
      }),
    "No se pudo iniciar la subida del vídeo.",
  );
  return {
    upload_id: data.upload_id,
    part_size: data.part_size,
    part_count: data.part_count,
  };
};

/** Partes ya subidas de una sesión previa; `null` si la sesión ya no sirve. */
const fetchUploadedParts = async (
  session: MultipartVideoUploadSession,
  file: File,
): Promise<Map<number, string> | null> => {
  try {
    const data = await callApi(
      () => filesService.listVehicleVideoUploadParts(session.upload_id),
      "No se pudo consultar el estado de la subida.",
    );
    const done = new Map<number, string>();
    for (const part of data.parts ?? []) {
      const { start, end } = partByteRange(
        part.part_number,
        session.part_size,
        file.size,
      );
      // Solo damos por buena una parte completa del tamaño esperado.
      if (part.size === end - start) done.set(part.part_number, part.etag);
    }
    return done;
  } catch (error) {
    // 404 / 409: sesión caducada, completada o ajena ⇒ empezar de cero.
    if (
      error instanceof MultipartVideoUploadError &&
      (error.status === 404 || error.status === 409)
    ) {
      return null;
    }
    throw error;
  }
};

/**
 * Sube `file` por multipart y lo completa. Lanza `AbortError` (DOMException)
 * si se aborta con `signal`, o `MultipartVideoUploadError` si falla.
 */
export const uploadVehicleVideoMultipart = async ({
  file,
  session: previousSession,
  signal,
  onSession,
  onPhase,
  onProgress,
}: MultipartVideoUploadOptions): Promise<MultipartVideoUploadResult> => {
  throwIfAborted(signal);
  const totalBytes = file.size;

  onPhase?.("initiating");
  let session: MultipartVideoUploadSession | null = null;
  let completedParts = new Map<number, string>();

  if (previousSession) {
    const uploaded = await fetchUploadedParts(previousSession, file);
    if (uploaded) {
      session = previousSession;
      completedParts = uploaded;
    }
  }
  throwIfAborted(signal);
  if (!session) {
    session = await initSession(file);
  }
  onSession?.(session);
  const activeSession = session;

  // --- Progreso: bytes confirmados + bytes en vuelo ---
  const inFlightBytes = new Map<number, number>();
  let confirmedBytes = 0;
  for (const partNumber of completedParts.keys()) {
    const { start, end } = partByteRange(
      partNumber,
      activeSession.part_size,
      totalBytes,
    );
    confirmedBytes += end - start;
  }
  const emitProgress = () => {
    let uploadedBytes = confirmedBytes;
    for (const bytes of inFlightBytes.values()) uploadedBytes += bytes;
    uploadedBytes = Math.min(uploadedBytes, totalBytes);
    onProgress?.({
      uploadedBytes,
      totalBytes,
      percent: totalBytes > 0 ? Math.floor((uploadedBytes / totalBytes) * 100) : 100,
    });
  };

  onPhase?.("uploading");
  emitProgress();

  const pendingParts: number[] = [];
  for (let part = 1; part <= activeSession.part_count; part += 1) {
    if (!completedParts.has(part)) pendingParts.push(part);
  }

  // --- URLs prefirmadas por lotes, pedidas bajo demanda ---
  const urlCache = new Map<number, string>();
  const urlRequests = new Map<number, Promise<void>>();

  const requestUrlBatch = (fromIndex: number) => {
    const batch = pendingParts
      .slice(fromIndex)
      .filter((part) => !urlCache.has(part) && !urlRequests.has(part))
      .slice(0, PART_URL_BATCH_SIZE);
    const request = callApi(
      () => filesService.getVehicleVideoPartUrls(activeSession.upload_id, batch),
      "No se pudieron obtener las URLs de subida.",
    ).then((data) => {
      for (const item of data.urls) urlCache.set(item.part_number, item.url);
    });
    const tracked = request.finally(() => {
      for (const part of batch) urlRequests.delete(part);
    });
    for (const part of batch) urlRequests.set(part, tracked);
    return tracked;
  };

  const getPartUrl = async (partNumber: number, index: number) => {
    const cached = urlCache.get(partNumber);
    if (cached) return cached;
    await (urlRequests.get(partNumber) ?? requestUrlBatch(index));
    const url = urlCache.get(partNumber);
    if (!url) {
      throw new MultipartVideoUploadError(
        "No se pudo obtener la URL de subida de una parte.",
        { retryable: true },
      );
    }
    return url;
  };

  const uploadPart = async (partNumber: number, index: number) => {
    const { start, end } = partByteRange(
      partNumber,
      activeSession.part_size,
      totalBytes,
    );
    const body = file.slice(start, end);

    for (let attempt = 0; ; attempt += 1) {
      throwIfAborted(signal);
      try {
        const url = await getPartUrl(partNumber, index);
        const etag = await putPart(url, body, signal, (loaded) => {
          inFlightBytes.set(partNumber, loaded);
          emitProgress();
        });
        inFlightBytes.delete(partNumber);
        completedParts.set(partNumber, etag);
        confirmedBytes += end - start;
        emitProgress();
        return;
      } catch (error) {
        inFlightBytes.delete(partNumber);
        emitProgress();
        if (isAbortError(error)) throw error;

        const retryable =
          error instanceof PartUploadHttpError
            ? isRetryableStatus(error.status) || error.status === 403
            : error instanceof MultipartVideoUploadError
              ? error.retryable
              : true;
        if (!retryable || attempt >= PART_MAX_RETRIES) {
          if (error instanceof MultipartVideoUploadError) throw error;
          throw new MultipartVideoUploadError(
            "No se pudo subir una parte del vídeo. Revisa la conexión y reintenta.",
            {
              status: error instanceof PartUploadHttpError ? error.status : undefined,
              retryable: true,
            },
          );
        }
        // URL caducada o rechazada: pedir una nueva en el siguiente intento.
        urlCache.delete(partNumber);
        await wait(backoffDelay(attempt), signal);
      }
    }
  };

  // --- Pool de concurrencia ---
  let nextIndex = 0;
  let failed = false;
  const worker = async () => {
    while (!failed && nextIndex < pendingParts.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        await uploadPart(pendingParts[index], index);
      } catch (error) {
        failed = true;
        throw error;
      }
    }
  };

  // Si una parte falla definitivamente, los demás workers no cogen partes nuevas.
  const results = await Promise.allSettled(
    Array.from(
      { length: Math.min(PART_CONCURRENCY, pendingParts.length) },
      () => worker(),
    ),
  );
  throwIfAborted(signal);
  const rejection = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  );
  if (rejection) throw rejection.reason;

  // --- Complete ---
  onPhase?.("completing");
  const parts = [...completedParts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([part_number, etag]) => ({ part_number, etag }));

  for (let attempt = 0; ; attempt += 1) {
    throwIfAborted(signal);
    try {
      return await callApi(
        () => filesService.completeVehicleVideoUpload(activeSession.upload_id, parts),
        "No se pudo completar la subida del vídeo.",
      );
    } catch (error) {
      // Complete es idempotente en el backend: reintentar tras un fallo de red es seguro.
      const retryable =
        error instanceof MultipartVideoUploadError && error.retryable;
      if (!retryable || attempt >= PART_MAX_RETRIES) throw error;
      await wait(backoffDelay(attempt), signal);
    }
  }
};

/** Cancela la sesión en el backend (best-effort). */
export const abortMultipartVideoUpload = async (uploadId: string) => {
  try {
    await filesService.abortVehicleVideoUpload(uploadId);
  } catch {
    // Best-effort: el backend limpia sesiones caducadas.
  }
};
