import { randomUUID } from "node:crypto";
import { adminSession } from "@/lib/admin/session";
import { getStorage } from "@/lib/storage";
import {
  catalogUploadErrorMessage,
  uploadCatalogBytes,
} from "@/lib/admin/catalog-upload";
import { MAX_UPLOAD_BYTES } from "@/lib/storage/image";
import { takeRateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { putSandboxUpload, SandboxUploadError } from "@/lib/demo/uploads";
import { isAllowedUploadOrigin } from "@/lib/upload-origin";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await adminSession(request.headers);
  if (!session)
    return Response.json(
      { error: "Sign in as an administrator." },
      { status: 401 },
    );
  if (!isAllowedUploadOrigin(request))
    return Response.json(
      {
        error:
          "Origem inválida para envio de foto. Confira NEXT_PUBLIC_APP_URL na Vercel (https://beladeperfume.vercel.app).",
      },
      { status: 403 },
    );
  if (!(await takeRateLimit("upload", session.user.id, 60)))
    return Response.json(
      { error: "Too many uploads. Try again later." },
      { status: 429 },
    );
  const length = Number(request.headers.get("content-length"));
  if (length > MAX_UPLOAD_BYTES + 65536)
    return Response.json(
      { error: "Choose an image under 5 MB." },
      { status: 413 },
    );
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof Blob)) throw new Error("Missing image.");
    if (file.size > MAX_UPLOAD_BYTES + 65536)
      return Response.json(
        { error: "Choose an image under 5 MB." },
        { status: 413 },
      );
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (env.DEMO_MODE && session.user.role === "demo")
      return Response.json(await putSandboxUpload(bytes));
    const catalogSlug = data.get("catalogSlug");
    if (typeof catalogSlug === "string" && catalogSlug.trim()) {
      const url = await uploadCatalogBytes(
        bytes,
        file.type || "image/webp",
        catalogSlug.trim(),
      );
      return Response.json({ url, catalog: true });
    }
    const key = `${randomUUID()}.webp`;
    const url = await getStorage().putObject(bytes, key);
    return Response.json({ url, key });
  } catch (error) {
    if (error instanceof SandboxUploadError)
      return Response.json({ error: error.message }, { status: 400 });
    return Response.json(
      { error: catalogUploadErrorMessage(error) },
      { status: 400 },
    );
  }
}
