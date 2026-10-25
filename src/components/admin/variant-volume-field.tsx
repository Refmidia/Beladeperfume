"use client";
import { adminCopy as t } from "@/lib/admin/copy";

const PRESETS = [30, 50, 80, 100, 150, 200, 250] as const;

export function VariantVolumeField({
  sizeMl,
  onChange,
  error,
}: {
  sizeMl: number | null;
  onChange: (ml: number | null, sizeLabel: string) => void;
  error?: string;
}) {
  const customActive =
    sizeMl != null && !(PRESETS as readonly number[]).includes(sizeMl);

  return (
    <div className="admin-field admin-volume-field span-2">
      <span>{t.productEditor.sizeMl}</span>
      <div className="admin-volume-chips" role="group" aria-label={t.productEditor.volumePresets}>
        <button
          type="button"
          className="admin-chip-btn"
          data-on={sizeMl == null || undefined}
          onClick={() => onChange(null, t.productEditor.volumePendingLabel)}
        >
          {t.productEditor.volumePendingShort}
        </button>
        {PRESETS.map((ml) => (
          <button
            key={ml}
            type="button"
            className="admin-chip-btn"
            data-on={sizeMl === ml || undefined}
            onClick={() => onChange(ml, `${ml} ml`)}
          >
            {ml} ml
          </button>
        ))}
      </div>
      <label className="admin-field admin-volume-custom">
        <span>{t.productEditor.volumeCustom}</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={5000}
          step={1}
          placeholder={t.productEditor.volumeCustomPlaceholder}
          value={customActive ? (sizeMl ?? "") : ""}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            const v = e.target.value.trim();
            if (!v) return;
            const n = Number(v);
            if (Number.isInteger(n) && n > 0) onChange(n, `${n} ml`);
          }}
        />
      </label>
      {error && <span className="admin-field-error">{error}</span>}
    </div>
  );
}
