import { runSupplierCatalogImport, previewBelaCatalogImport, loadBelaCatalogCsv } from "../src/db/import-supplier-catalog";
import { closeDb } from "../src/db";

const dryRun = process.argv.includes("--dry-run");
const fileArg = process.argv.find((a) => a.startsWith("--file="));
const csvPath = fileArg?.slice("--file=".length);

async function main() {
  const csvRaw = loadBelaCatalogCsv(csvPath);
  if (dryRun) {
    const preview = await previewBelaCatalogImport(csvRaw);
    console.log(
      `Prévia (${preview.hash}): ${preview.creates} criar, ${preview.updates} atualizar, ${preview.skips} ignorar, ${preview.total} linhas.`,
    );
    if (preview.errors.length) {
      console.error("Erros:");
      for (const e of preview.errors) console.error(`  L${e.line}: ${e.message}`);
    }
    if (preview.warnings.length) {
      console.warn("Avisos:");
      for (const w of preview.warnings.slice(0, 15)) console.warn(`  L${w.line}: ${w.message}`);
      if (preview.warnings.length > 15) console.warn(`  … +${preview.warnings.length - 15} avisos`);
    }
    return;
  }
  const r = await runSupplierCatalogImport({ csvPath });
  if (r.errors.length) {
    console.error("Importação abortada:", r.errors[0]?.message);
    process.exit(1);
  }
  console.log(
    `Importação concluída: ${r.created} criados, ${r.updated} atualizados, ${r.skipped} ignorados (${r.total} linhas).`,
  );
  if (r.warnings.length) console.warn(`${r.warnings.length} aviso(s) — revise no admin (filtro Revisão pendente).`);
}

main()
  .then(() => closeDb())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
