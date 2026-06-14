import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { filesService, type BucketName } from "@/services/files/filesService";
import { getImageUrl } from "@/lib/utils";

type ImageInputProps = {
  value?: string | null;
  onChange?: (url: string | null) => void;

  label?: string;
  description?: string;

  bucketName: BucketName;
  path: string;

  accept?: string;

  referenceId?: string;
};

export const ImageInput = ({
  value,
  onChange,

  label = "Imagen",
  description = "PNG, JPG o WEBP",

  bucketName,
  path,
  referenceId,
  accept = "image/png,image/jpeg,image/jpg,image/webp,image/avif",
}: ImageInputProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [preview, setPreview] = useState<string | null>(value ?? null);

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (value) {
      setTimeout(() => {
        setPreview(getImageUrl(value));
      }, 100);
    }
  }, [value]);

  const handleUpload = async (file: File | null) => {
    if (!file) return;

    try {
      setIsUploading(true);

      const localPreview = URL.createObjectURL(file);

      setPreview(localPreview);

      const { path: uploadedPath } = await filesService.uploadFile({
        file,
        bucket_name: bucketName,
        file_key: filesService.generateFileKey(path, file),
        content_type: file.type as
          | "image/jpeg"
          | "image/png"
          | "image/jpg"
          | "image/webp",
        reference_id: referenceId ?? "",
      });
      if (!uploadedPath) {
        toast.error("No se obtuvo la ruta del archivo subido");
        return;
      }
      setPreview(getImageUrl(uploadedPath));

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
    setPreview(null);

    onChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {/* <label className="text-sm font-medium">{label}</label> */}

        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="bg-muted flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImagePlus className="text-muted-foreground h-8 w-8" />
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
          </div>

          {preview && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm transition hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
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
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </div>
            ) : preview ? (
              "Cambiar imagen"
            ) : (
              "Subir imagen"
            )}
          </button>

          {preview && !isUploading && (
            <button
              type="button"
              onClick={handleRemove}
              className="text-muted-foreground text-sm transition hover:text-foreground"
            >
              Eliminar archivo
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
