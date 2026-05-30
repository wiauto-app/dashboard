import { useEffect, useRef, useState } from "react";
import { FileText, Loader2, Paperclip, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { getImageUrl } from "@/lib/utils";
import {
  filesService,
  type BucketName,
  type UploadContentType,
} from "@/services/files/filesService";

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp"]);

const extractFileName = (storagePath: string): string => {
  const segments = storagePath.split("/");
  return segments[segments.length - 1] ?? storagePath;
};

const isImagePath = (storagePath: string): boolean => {
  const extension = storagePath.split(".").pop()?.toLowerCase();
  return extension ? IMAGE_EXTENSIONS.has(extension) : false;
};

const resolveUploadContentType = (file: File): UploadContentType => {
  const normalized =
    filesService.normalize_chat_attachment_content_type(file);
  if (normalized) return normalized;
  return "application/octet-stream";
};

export const DEFAULT_FILE_INPUT_ACCEPT =
  "image/png,image/jpeg,image/jpg,image/webp,application/pdf,.doc,.docx,.txt";

type FileInputProps = {
  value?: string | null;
  onChange?: (storagePath: string | null) => void;

  label?: string;
  description?: string;

  bucketName: BucketName;
  path: string;

  accept?: string;
  referenceId?: string;
};

export const FileInput = ({
  value,
  onChange,
  label = "Archivo",
  description = "Imágenes, PDF o documentos",
  bucketName,
  path,
  referenceId,
  accept = DEFAULT_FILE_INPUT_ACCEPT,
}: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(null);
      setFileName(null);
      return;
    }

    const name = extractFileName(value);
    setFileName(name);

    if (isImagePath(value)) {
      setPreviewUrl(getImageUrl(value));
      return;
    }

    setPreviewUrl(null);
  }, [value]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setIsUploading(true);
      setFileName(file.name);

      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      const content_type = resolveUploadContentType(file);

      const { path: uploadedPath } = await filesService.uploadFile({
        file,
        bucket_name: bucketName,
        file_key: filesService.generateFileKey(path, file),
        content_type,
        reference_id: referenceId ?? "",
      });

      if (!uploadedPath) {
        toast.error("No se obtuvo la ruta del archivo subido");
        return;
      }

      setFileName(extractFileName(uploadedPath));

      if (isImagePath(uploadedPath)) {
        setPreviewUrl(getImageUrl(uploadedPath));
      }

      onChange?.(uploadedPath);
      toast.success("Archivo subido correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    setFileName(null);
    onChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const hasFile = Boolean(fileName);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">{label}</label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="bg-muted flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={fileName ?? "Vista previa"}
                className="h-full w-full object-cover"
              />
            ) : hasFile ? (
              <div className="flex flex-col items-center gap-1 px-2 text-center">
                <FileText className="text-muted-foreground h-8 w-8 shrink-0" />
                <span className="text-muted-foreground line-clamp-2 text-xs">
                  {fileName}
                </span>
              </div>
            ) : (
              <Paperclip className="text-muted-foreground h-8 w-8" />
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {hasFile && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Eliminar archivo"
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm transition hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              handleUpload(file);
            }}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="inline-flex h-10 items-center justify-center rounded-xl border px-4 text-sm font-medium transition hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </span>
            ) : hasFile ? (
              "Cambiar archivo"
            ) : (
              "Subir archivo"
            )}
          </button>

          {hasFile && !isUploading && (
            <>
              <p className="text-muted-foreground truncate text-sm">{fileName}</p>
              <button
                type="button"
                onClick={handleRemove}
                className="text-muted-foreground w-fit text-sm transition hover:text-foreground"
              >
                Eliminar archivo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
