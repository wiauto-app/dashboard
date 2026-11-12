const HEIC_HEIF_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

const HEIC_HEIF_EXTENSIONS = new Set([".heic", ".heif"]);

const CLIENT_PREVIEW_JPEG_QUALITY = 0.82;
const CLIENT_PREVIEW_MAX_EDGE_PX = 1200;

const getFileExtension = (fileName: string): string => {
  const lower = fileName.toLowerCase();
  const dot = lower.lastIndexOf(".");
  if (dot < 0) return "";
  return lower.slice(dot);
};

export const fileNeedsClientHeicPreview = (file: File): boolean => {
  const mime = file.type.trim().toLowerCase();
  if (HEIC_HEIF_MIMES.has(mime)) {
    return true;
  }
  return HEIC_HEIF_EXTENSIONS.has(getFileExtension(file.name));
};

const downscaleJpegBlob = async (
  blob: Blob,
  maxEdge: number,
): Promise<Blob> => {
  if (typeof document === "undefined") {
    return blob;
  }

  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo decodificar la vista previa"));
      img.src = objectUrl;
    });

    const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return blob;
    }

    context.drawImage(image, 0, 0, width, height);

    const downscaled = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (result) => resolve(result),
        "image/jpeg",
        CLIENT_PREVIEW_JPEG_QUALITY,
      );
    });

    return downscaled ?? blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

let previewQueue: Promise<void> = Promise.resolve();

const enqueuePreviewTask = <T>(task: () => Promise<T>): Promise<T> => {
  const run = previewQueue.then(task, task);
  previewQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
};

const convertHeicToPreviewBlob = async (file: File): Promise<Blob> => {
  const { default: heic2any } = await import("heic2any");
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: CLIENT_PREVIEW_JPEG_QUALITY,
  });

  const jpegBlob = Array.isArray(result) ? result[0] : result;
  if (!(jpegBlob instanceof Blob)) {
    throw new Error("Conversión HEIC sin resultado");
  }

  return downscaleJpegBlob(jpegBlob, CLIENT_PREVIEW_MAX_EDGE_PX);
};

export const createVehicleImagePreviewUrl = (file: File): Promise<string> => {
  if (!fileNeedsClientHeicPreview(file)) {
    return Promise.resolve(URL.createObjectURL(file));
  }

  return enqueuePreviewTask(async () => {
    const blob = await convertHeicToPreviewBlob(file);
    return URL.createObjectURL(blob);
  });
};
