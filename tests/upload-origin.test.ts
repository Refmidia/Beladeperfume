import test from "node:test";
import assert from "node:assert/strict";

test("upload origin allows Vercel host when APP_URL is localhost", async () => {
  process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
  process.env.VERCEL_URL = "beladeperfume.vercel.app";
  const { isAllowedUploadOrigin } = await import("../src/lib/upload-origin");
  const req = new Request("https://beladeperfume.vercel.app/api/uploads", {
    method: "POST",
    headers: { origin: "https://beladeperfume.vercel.app" },
  });
  assert.equal(isAllowedUploadOrigin(req), true);
});

test("resolveCatalogImageUrl prefixes CDN", async () => {
  process.env.NEXT_PUBLIC_CATALOG_CDN = "https://cdn.example.com";
  const { resolveCatalogImageUrl } = await import("../src/lib/storage/image-url");
  assert.equal(
    resolveCatalogImageUrl("/catalog/foo.webp"),
    "https://cdn.example.com/catalog/foo.webp",
  );
  assert.equal(
    resolveCatalogImageUrl("https://other/x.webp"),
    "https://other/x.webp",
  );
});
