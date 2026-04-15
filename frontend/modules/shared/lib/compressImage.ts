import imageCompression from "browser-image-compression";

const OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp" as const,
  onProgress: (p: number) => console.debug(`Compressing: ${p}%`),
};

export async function compressImage(file: File): Promise<File> {
  if (file.size < 200 * 1024) return file;
  return imageCompression(file, OPTIONS);
}