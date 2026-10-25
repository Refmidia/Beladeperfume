"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { importSupplierCatalog, recalculateAllPricing } from "@/lib/admin/actions";

export function SupplierPricingToolbar() {
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (action: () => Promise<{ ok: boolean; message: string }>) => {
    start(async () => {
      try {
        const r = await action();
        if (r.ok) toast.success(r.message);
        else toast.error(r.message);
        router.refresh();
      } catch {
        toast.error("Não foi possível concluir a operação.");
      }
    });
  };
  return (
    <div className="admin-toolbar" style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8 }}>
      <button type="button" className="admin-btn dark" disabled={pending} onClick={() => run(importSupplierCatalog)}>
        Importar catálogo fornecedor
      </button>
      <button type="button" className="admin-btn ghost" disabled={pending} onClick={() => run(recalculateAllPricing)}>
        Recalcular Pix/cartão (47% / 53%)
      </button>
    </div>
  );
}
