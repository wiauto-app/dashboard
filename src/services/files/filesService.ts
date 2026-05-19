import { objectToQueryString } from "@/lib/utils";
import { apiDelete, apiGet, apiPost, uploadSignedFile } from "../api";
import {
  CONFIRM_VIDEO_UPLOAD,
  GENERATE_FILE_SIGNED_URL,
  GENERATE_READ_FILE_SIGNED_URL,
  REMOVE_FILES,
} from "./route.constants";
import { toast } from "sonner";

export type BucketName = "files" | "vehicles-videos" | "vehicles-images" | "profile-images" | "dealership-images";

const bucket_names_allowlist: BucketName[] = [
  "files",
  "vehicles-videos",
  "vehicles-images",
  "profile-images",
  "dealership-images",
];

/** Convierte `bucket/object/key` tal como guarda la subida en `uploadFile`. */
export const split_storage_compound_path = (
  compound_path: string,
): { bucket_name: BucketName; object_key: string } => {
  const first_slash = compound_path.indexOf("/");
  if (first_slash <= 0) {
    throw new Error('Ruta de almacén inválida: se esperaba "bucket/clave-del-objeto".');
  }
  const bucket_segment = compound_path.slice(0, first_slash);
  const object_key = compound_path.slice(first_slash + 1);
  if (!object_key) {
    throw new Error("Ruta de almacén inválida: falta la clave del objeto.");
  }
  if (!bucket_names_allowlist.includes(bucket_segment as BucketName)) {
    throw new Error(`Bucket no admitido para esta operación: ${bucket_segment}`);
  }
  return { bucket_name: bucket_segment as BucketName, object_key };
};
interface GenerateFileSignedUrlDto {
  file_key: string;
  content_type: "image/jpeg" | "image/png" | "image/jpg" | "image/webp" | "video/mp4" | "video/mov" | "video/avi" | "video/mkv" | "video/webm" | "audio/mp3" | "audio/m4a";
  bucket_name: BucketName;
}

interface GenerateReadFileSignedUrlDto {
  file_key: string;
  bucket_name: BucketName;
}
interface GenerateFileSignedUrlResponse {
  signed_url: string;
}

interface GenerateReadFileSignedUrlResponse {
  signed_url: string;
}

interface ConfirmVideoUploadResponse {
  file_key: string;
  file_key_en_storage: string;
}

interface UploadFileDto extends GenerateFileSignedUrlDto {
  file: File;
  bucket_name: BucketName;
  reference_id: string;
}

/** Tipos MIME de vídeo aceptados por el backend (`GenerateFileSignedUrlHttpDto`). */
export type VehicleVideoUploadContentType =
  | "video/mp4"
  | "video/mov"
  | "video/avi"
  | "video/mkv"
  | "video/webm";

/** Coincide con `CONTENT_TYPES` del servidor; mapea `video/quicktime` → `video/mov`. */
export function normalize_vehicle_video_upload_content_type(
  file: File,
): VehicleVideoUploadContentType | null {
  const type_key = file.type.trim().toLowerCase();
  const MIME_MAP: Record<string, VehicleVideoUploadContentType> = {
    "video/mp4": "video/mp4",
    "video/webm": "video/webm",
    "video/avi": "video/avi",
    "video/mkv": "video/mkv",
    "video/mov": "video/mov",
    "video/quicktime": "video/mov",
    "video/x-quicktime": "video/mov",
    "video/x-msvideo": "video/avi",
    "video/x-matroska": "video/mkv",
  };
  const from_mime = type_key !== "" ? MIME_MAP[type_key] : undefined;
  if (from_mime) return from_mime;

  const ext_segment = file.name.includes(".")
    ? file.name.split(".").pop()?.toLowerCase()
    : "";
  const EXT_MAP: Record<string, VehicleVideoUploadContentType> = {
    mp4: "video/mp4",
    mov: "video/mov",
    avi: "video/avi",
    mkv: "video/mkv",
    webm: "video/webm",
  };
  const from_ext =
    ext_segment !== undefined ? EXT_MAP[ext_segment] : undefined;
  return from_ext ?? null;
}

export const filesService = {
  async generateFileSignedUrl(generateFileSignedUrlDto: GenerateFileSignedUrlDto): Promise<string | null> {
    const response = await apiPost<GenerateFileSignedUrlResponse>(GENERATE_FILE_SIGNED_URL, generateFileSignedUrlDto)
    console.log(response);
    if (!response.ok) {
      return null
    }
    return response.data.signed_url
  },

  async uploadImage(url: string, image: File): Promise<string | null> {
    const response = await uploadSignedFile<string>(url, image, {
      content_type: image.type,
    })
    if (!response.ok) {
      return null
    }
    return response.data
  },

  async removeStoredFiles(remove_dto: {
    paths: string[];
    bucket_name: BucketName;
  }): Promise<{ ok: boolean; message?: string }> {
    const response = await apiDelete<void>(REMOVE_FILES, remove_dto);
    return { ok: response.ok, message: response.message };
  },

  async generateReadFileSignedUrl(generateReadFileSignedUrlDto: GenerateReadFileSignedUrlDto): Promise<string | null> {
    const queryString = objectToQueryString(generateReadFileSignedUrlDto)
    const response = await apiGet<GenerateReadFileSignedUrlResponse>(`${GENERATE_READ_FILE_SIGNED_URL}?${queryString}`)
    if (!response.ok) {
      return null
    }
    return response.data.signed_url
  },

  async uploadFile(uploadFileDto: UploadFileDto): Promise<{  path: string | null }> {
    const signedUrl = await filesService.generateFileSignedUrl({
      file_key: uploadFileDto.file_key,
      content_type: uploadFileDto.file.type as
        | "image/jpeg"
        | "image/png"
        | "image/jpg"
        | "image/webp",
      bucket_name: uploadFileDto.bucket_name,
    });
    console.log(signedUrl);
    if (!signedUrl) {
      toast.error("No se pudo generar la URL de subida");
      return { path: null };
    }
   const result = await filesService.uploadImage(signedUrl, uploadFileDto.file);
    console.log(result);
   
    return {  path: `${uploadFileDto.bucket_name}/${uploadFileDto.file_key}` };
  },

  async confirm_vehicle_video_upload(
    file_key_used_for_signed_put: string,
  ): Promise<ConfirmVideoUploadResponse | null> {
    const response = await apiPost<ConfirmVideoUploadResponse>(
      CONFIRM_VIDEO_UPLOAD,
      { file_key: file_key_used_for_signed_put },
    );
    if (!response.ok) {
      toast.error("No se pudo confirmar el vídeo tras la subida.");
      return null;
    }
    return response.data;
  },

  /** URL firmada → PUT a MinIO → cola de transcodificación (respuesta incluye la clave final esperada `.mp4`). */
  async upload_vehicle_video(file: File): Promise<{ path: string | null }> {
    const content_type = normalize_vehicle_video_upload_content_type(file);
    if (!content_type) {
      toast.error(
        `${file.name}: formato de vídeo no admitido (MP4, MOV, AVI, MKV, WEBM).`,
      );
      return { path: null };
    }

    const file_key = filesService.generateFileKey("vehicles-videos", file);
    const signed_url = await filesService.generateFileSignedUrl({
      file_key,
      content_type,
      bucket_name: "vehicles-videos",
    });

    if (!signed_url) {
      return { path: null };
    }

    const put_result = await uploadSignedFile<void>(signed_url, file, {
      content_type,
    });

    if (!put_result.ok) {
      toast.error(`No se pudo subir el vídeo (${file.name}).`);
      return { path: null };
    }

    const confirmation = await filesService.confirm_vehicle_video_upload(
      file_key,
    );
    if (!confirmation) {
      return { path: null };
    }

    return {
      path: `vehicles-videos/${confirmation.file_key_en_storage}`,
    };
  },

  generateFileKey(path: string, file: File) {
    const extension = file.name.split(".").pop();

    return `${path}/${crypto.randomUUID()}.${extension}`;
  },

}