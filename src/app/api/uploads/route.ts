import { randomUUID } from "node:crypto";
import { adminSession } from "@/lib/admin/session";
import { getStorage } from "@/lib/storage";
import { publishCatalogWebp } from "@/lib/storage/catalog";
import { MAX_UPLOAD_BYTES, validateImage } from "@/lib/storage/image";
import { takeRateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";
import { putSandboxUpload, SandboxUploadError } from "@/lib/demo/uploads";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await adminSession(request.headers);
  if (!session)
    return Response.json(
      { error: "Sign in as an administrator." },
      { status: 401 },
    );
  if (request.headers.get("origin") !== new URL(env.NEXT_PUBLIC_APP_URL).origin)
    return Response.json({ error: "Invalid origin." }, { status: 403 });
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
    // Bound streaming bodies as well as requests with a Content-Length header.
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing image.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > MAX_UPLOAD_BYTES + 65536) {
        await reader.cancel();
        return Response.json(
          { error: "Choose an image under 5 MB." },
          { status: 413 },
        );
      }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const data = await new Response(body, {
      headers: { "Content-Type": request.headers.get("content-type") ?? "" },
    }).formData();
    const file = data.get("file");
    if (!(file instanceof File)) throw new Error("Missing image.");
    const bytes = await validateImage(
      new Uint8Array(await file.arrayBuffer()),
      file.type,
    );
    // Demo visitors (DEMO_MODE) upload into their own sandbox, never to storage.
    if (env.DEMO_MODE && session.user.role === "demo") return Response.json(await putSandboxUpload(bytes));
    const catalogSlug = data.get("catalogSlug");
    if (typeof catalogSlug === "string" && catalogSlug.trim()) {
      const url = await publishCatalogWebp(bytes, catalogSlug.trim());
      return Response.json({ url, catalog: true });
    }
    const key = `${randomUUID()}.webp`;
    const url = await getStorage().putObject(bytes, key);
    return Response.json({ url, key });
  } catch (error) {
    if (error instanceof SandboxUploadError) return Response.json({ error: error.message }, { status: 400 });
    const message = error instanceof Error ? error.message : "";
    if (message === "STORAGE_CLOUD") {
      return Response.json(
        {
          error:
            "Para enviar foto pelo celular, configure armazenamento na nuvem (Cloudflare R2 ou Supabase — grátis). Enquanto isso, cole um link https:// público da imagem.",
        },
        { status: 503 },
      );
    }
    const onVercel = Boolean(process.env.VERCEL);
    return Response.json(
      {
        error: onVercel
          ? "Não foi possível enviar a foto. Configure bucket S3/R2 (docs/deploy/storage.md) ou cole um link https:// da imagem."
          : "Falha no envio. Use JPEG, PNG ou WebP com até 5 MB ou confira STORAGE_ADAPTER no .env.",
      },
      { status: 400 },
    );
  }
}
