import { replaceCatalogWithSupplier } from "../src/db/import-supplier-catalog";
import { closeDb } from "../src/db";

replaceCatalogWithSupplier()
  .then((r) => {
    console.log(
      `Catálogo substituído: ${r.deleted} produto(s) removido(s); ${r.created} criados, ${r.updated} atualizados (${r.total} linhas do fornecedor).`,
    );
    console.log("Todos começam inativos, estoque 0, sem fotos — ative no admin quando estiver pronto.");
  })
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closeDb);
