/**
 * Converte fotos do seu PC em arquivos leves em public/catalog/ (WebP).
 * No admin, use "Adicionar por URL" com o caminho impresso (ex.: /catalog/maahir.webp).
 *
 *   1. Coloque JPEG/PNG/WebP em ./fotos-produtos/
 *   2. npm run images:import
 *   3. git add public/catalog && git push
 *   4. Admin → produto → Imagens → Adicionar por URL → /catalog/nome.webp
 */
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";
import "../src/db/load-env";

const SOURCE = process.argv[2] ?? join(process.cwd(), "fotos-produtos");
const OUT = join(process.cwd(), "public", "catalog");
const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "https://beladeperfume.vercel.app").replace(
  /\/$/,
  "",
);

function slug(name: string) {
  return name
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Pasta não encontrada: ${SOURCE}`);
    console.error("Crie a pasta fotos-produtos/ na raiz do projeto e coloque as fotos lá.");
    process.exitCode = 1;
    return;
  }
  mkdirSync(OUT, { recursive: true });
  const files = readdirSync(SOURCE).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (!files.length) {
    console.error(`Nenhuma imagem em ${SOURCE}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Origem: ${SOURCE}\nDestino: public/catalog/\n`);
  for (const file of files) {
    const base = slug(basename(file, extname(file)));
    const outName = `${base}.webp`;
    const dest = join(OUT, outName);
    await sharp(join(SOURCE, file), { limitInputPixels: 40_000_000, animated: false })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(dest);
    const path = `/catalog/${outName}`;
    console.log(`${file}`);
    console.log(`  Admin (URL): ${path}`);
    console.log(`  Site:        ${APP_URL}${path}\n`);
  }
  console.log("Próximo passo: git add public/catalog && git commit && git push origin main");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
