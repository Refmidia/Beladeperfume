import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { storeConfig } from "../../../store.config";
import { contrastForeground } from "@/lib/theme";

/** Store initials, e.g. "Attar Demo Store" → "AD". */
function initials(name: string) {
  const words = name.split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}

async function logoDataUrl() {
  const logo = storeConfig.store.logo;
  if (!logo?.startsWith("/")) return null;
  const filePath = join(process.cwd(), "public", logo.slice(1));
  try {
    const buf = await readFile(filePath);
    const ext = logo.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Favicon, apple-touch e PWA: logo da loja (store.config → store.logo) ou iniciais.
 */
export async function appIcon(size: number) {
  const src = await logoDataUrl();
  const pad = Math.round(size * 0.1);
  const inner = size - pad * 2;

  if (src) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#faf8f5",
            padding: pad,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- OG ImageResponse */}
          <img
            src={src}
            width={inner}
            height={inner}
            alt=""
            style={{ objectFit: "contain" }}
          />
        </div>
      ),
      { width: size, height: size },
    );
  }

  const { primary } = storeConfig.theme;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: primary,
          color: contrastForeground(primary),
          fontSize: size * 0.36,
          fontWeight: 600,
          letterSpacing: -size * 0.012,
        }}
      >
        {initials(storeConfig.store.name)}
      </div>
    ),
    { width: size, height: size },
  );
}
