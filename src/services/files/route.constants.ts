export const GENERATE_FILE_SIGNED_URL = "v1/generate-file-signed-url";
export const CONFIRM_VIDEO_UPLOAD = "v1/confirm-video-upload";
export const REMOVE_FILES = "v1/files";
export const GENERATE_READ_FILE_SIGNED_URL = "v1/generate-read-file-signed-url";
export const TEMP_UPLOAD_VEHICLE_IMAGE = "v1/vehicle-images/temp-upload";
export const CONFIRM_TEMP_UPLOAD_VEHICLE_IMAGE = (uploadId: string) =>
  `v1/vehicle-images/temp-upload/${uploadId}/confirm`;
