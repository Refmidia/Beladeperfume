import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { parseBelaCatalogCsv, splitSemicolonCsvLine } from "../src/lib/import/bela-catalog-csv";

describe("bela catalog CSV", () => {
  it("parses semicolon fields with quoted observacao", () => {
    const cells = splitSemicolonCsvLine(
      'Yara Rose;Lattafa;;160;235,20;244,80;revisar;"Confirmar se é Yara Pink; possível duplicata"',
    );
    assert.equal(cells.length, 8);
    assert.match(cells[7]!, /Yara Pink/);
  });

  it("loads 58 perfumes from project CSV without errors", () => {
    const raw = readFileSync(join(process.cwd(), "data", "bela_de_perfume_catalogo.csv"), "utf8");
    const { rows, issues } = parseBelaCatalogCsv(raw);
    const errors = issues.filter((i) => i.severity === "error");
    assert.equal(errors.length, 0, errors.map((e) => e.message).join("; "));
    assert.equal(rows.length, 58);
    const yaraRose = rows.find((r) => r.supplierName === "Yara Rose");
    assert.ok(yaraRose?.duplicateReview);
    assert.equal(yaraRose?.volumeMl, null);
    assert.equal(yaraRose?.volumePending, true);
    const yaraCandy = rows.find((r) => r.supplierName === "Yara Candy");
    assert.equal(yaraCandy?.volumeMl, 100);
  });
});
