import sharp from "sharp";
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MIME_TO_FORMAT: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function validateImage(bytes: Uint8Array, mime: string) {
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES)
    throw new Error("Choose an image under 5 MB.");
  const image = sharp(bytes, { limitInputPixels: 40_000_000, animated: false });
  const metadata = await image.metadata();
  const detected = metadata.format;
  if (!detected || !["jpeg", "png", "webp"].includes(detected))
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if ((metadata.pages ?? 1) > 1)
    throw new Error("Choose a JPEG, PNG or WebP image.");
  const fromMime = MIME_TO_FORMAT[mime];
  if (fromMime && fromMime !== detected)
    throw new Error("The image format does not match its file type.");
  return image
    .rotate()
    .resize({
      width: 1600,
      height: 1600,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 85 })
    .toBuffer();
}
