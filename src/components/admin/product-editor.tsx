"use client";
import Image from "next/image";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  GripVertical,
  ImagePlus,
  Link2,
  LoaderCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { saveProduct } from "@/lib/admin/actions";
import type { ActionResult, ProductInput } from "@/lib/admin/schema";
import { formatMoney } from "@/lib/money";
import { slugify } from "@/lib/slug";
import { humanize } from "@/lib/admin/format";
import {
  ChipChoice,
  FieldError,
  MarkdownField,
  MoneyReaisField,
  Result,
  SwitchField,
  uploadImage,
  useUnsavedGuard,
} from "./fields";
import { VariantVolumeField } from "./variant-volume-field";
import { Combobox } from "./combobox";
import { InlineCreate, type Choices } from "./entity-editor";
import { PageHeader, Panel } from "./ui";
import { adminCopy as pe } from "@/lib/admin/copy";
import { applyCostToVariantPricing } from "@/lib/pricing/apply";
import { pricingFromCost } from "@/lib/pricing/supplier";
import { storeConfig } from "../../../store.config";
const blankVariant = () => ({
  sku: "",
  sizeMl: null as number | null,
  sizeLabel: pe.productEditor.volumePendingLabel,
  retailPrice: 0,
  price: 0,
  cardPrice: 0,
  costPrice: null as number | null,
  supplierSuggestedPrice: null as number | null,
  markupPixPercent: 47,
  markupCardPercent: 53,
  stockQuantity: 0,
  barcode: null,
  isDefault: false,
  isActive: true,
});
const empty: ProductInput = {
  name: "",
  slug: "",
  brandId: "",
  collectionName: null,
  description: "",
  gender: "unisex",
  concentration: "edp",
  packaging: "standard",
  fragranceFamily: null,
  perfumer: null,
  launchYear: null,
  countryOfOrigin: null,
  groundShippingOnly: false,
  isFeatured: false,
  isActive: true,
  variants: [{ ...blankVariant(), isDefault: true }],
  images: [],
  notes: [],
};
const TABS = ["basics", "variants", "images", "notes"] as const;
type Tab = (typeof TABS)[number];
const TAB_LABEL: Record<Tab, string> = {
  basics: pe.productEditor.tabs.basics,
  variants: pe.productEditor.tabs.variants,
  images: pe.productEditor.tabs.images,
  notes: pe.productEditor.tabs.notes,
};
const NOTE_POSITIONS = ["top", "heart", "base"] as const;
const CONCENTRATIONS = ["edt", "edp", "parfum", "extrait", "edc", "oil", "attar"] as const;
const PACKAGING = ["standard", "tester", "sample", "mini", "gift_set"] as const;
const GENDERS = ["men", "women", "unisex"] as const;
function slug(value: string) {
  try {
    return slugify(value);
  } catch {
    return "";
  }
}
function tabOf(key: string): Tab {
  if (key.startsWith("variants")) return "variants";
  if (key.startsWith("images")) return "images";
  if (key.startsWith("notes")) return "notes";
  return "basics";
}
export function ProductEditor({
  id,
  initial,
  choices,
}: {
  id?: string;
  initial?: ProductInput;
  choices: Choices;
}) {
  const [data, setData] = useState(initial ?? empty);
  const [saved, setSaved] = useState(() => JSON.stringify(initial ?? empty));
  const [tab, setTab] = useState<Tab>("basics");
  const [result, setResult] = useState<ActionResult>();
  const [pending, start] = useTransition();
  const router = useRouter();
  const dirty = JSON.stringify(data) !== saved;
  useUnsavedGuard(dirty && !pending);
  const errors = result?.ok === false ? (result.errors ?? {}) : {};
  const errorTabs = new Set(Object.keys(errors).map(tabOf));
  function set<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setData((d) => ({
      ...d,
      [key]: value,
      ...(key === "name" && !id && (!d.slug || d.slug === slug(d.name))
        ? { slug: slug(String(value)) }
        : {}),
    }));
  }
  function variant(index: number, key: string, value: unknown) {
    setData((d) => ({
      ...d,
      variants: d.variants.map((v, i) =>
        i === index
          ? { ...v, [key]: value }
          : key === "isDefault"
            ? { ...v, isDefault: false }
            : v,
      ),
    }));
  }
  function setVariantVolume(index: number, ml: number | null, sizeLabel: string) {
    setData((d) => ({
      ...d,
      variants: d.variants.map((v, i) =>
        i === index ? { ...v, sizeMl: ml, sizeLabel } : v,
      ),
    }));
  }
  function recalcVariantPricing(
    vv: ProductInput["variants"][number],
    patch: Partial<ProductInput["variants"][number]>,
  ) {
    const merged = { ...vv, ...patch };
    if (merged.costPrice == null || merged.costPrice < 0) return merged;
    const priced = applyCostToVariantPricing({
      costPrice: merged.costPrice,
      markupPixPercent: merged.markupPixPercent,
      markupCardPercent: merged.markupCardPercent,
      price: merged.price,
      retailPrice: merged.retailPrice,
      cardPrice: merged.cardPrice,
      supplierSuggestedPrice: merged.supplierSuggestedPrice,
    });
    return { ...merged, ...priced };
  }
  function patchVariant(index: number, patch: Partial<ProductInput["variants"][number]>) {
    setData((d) => ({
      ...d,
      variants: d.variants.map((vv, idx) =>
        idx === index ? recalcVariantPricing(vv, patch) : vv,
      ),
    }));
  }
  function moveImage(from: number, to: number) {
    if (to < 0 || to >= data.images.length) return;
    const rows = [...data.images];
    rows.splice(to, 0, rows.splice(from, 1)[0]);
    set("images", rows);
  }
  function save(overrides: Partial<ProductInput> = {}) {
    const payload = { ...data, ...overrides };
    setData(payload);
    start(async () => {
      try {
        const r = await saveProduct(id, payload);
        setResult(r);
        if (r.ok) {
          setSaved(JSON.stringify(payload));
          toast.success(r.message);
          router.replace(`/admin/products/${r.id}`);
          router.refresh();
        } else {
          toast.error(r.message);
          const first = Object.keys(r.errors ?? {})[0];
          if (first) setTab(tabOf(first));
        }
      } catch {
        setResult({ ok: false, message: pe.messages.saveFailedRetry });
        toast.error(pe.messages.saveFailedRetry);
      }
    });
  }
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const [drag, setDrag] = useState<number>();
  const [uploading, setUploading] = useState(0);
  const uploader = useRef<HTMLInputElement>(null);
  async function addFiles(files: FileList | File[]) {
    const list = [...files];
    setUploading((n) => n + list.length);
    for (const file of list) {
      try {
        const url = await uploadImage(file);
        setData((d) => ({ ...d, images: [...d.images, { url, alt: d.name || pe.productEditor.productImageAlt }] }));
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }
  const brand = choices.brands.find((b) => b.id === data.brandId);
  const activeVariants = data.variants.filter((v) => v.isActive);
  const prices = activeVariants.map((v) => v.price);
  const stock = activeVariants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);
  const counts: Record<Tab, number | undefined> = {
    basics: undefined,
    variants: data.variants.length,
    images: data.images.length,
    notes: data.notes.length,
  };
  const actions = (
    <>
      {id && initial && (
        <a className="admin-btn ghost" href={`/products/${initial.slug}`} target="_blank" rel="noreferrer">
          {pe.productEditor.viewStore} <ArrowUpRight size={15} />
        </a>
      )}
      {id ? (
        <button className="admin-btn primary" disabled={pending} onClick={() => save()}>
          {pending && <LoaderCircle size={16} className="admin-spin" />}
          {pe.productEditor.saveChanges}
        </button>
      ) : (
        <>
          <button className="admin-btn" disabled={pending} onClick={() => save({ isActive: false })}>
            {pe.productEditor.saveDraft}
          </button>
          <button className="admin-btn primary" disabled={pending} onClick={() => save({ isActive: true })}>
            {pending && <LoaderCircle size={16} className="admin-spin" />}
            {pe.productEditor.publish}
          </button>
        </>
      )}
    </>
  );
  return (
    <div className="admin-editor">
      <PageHeader
        crumbs={[[pe.productEditor.crumbs, "/admin/products"]]}
        title={id ? data.name || pe.productEditor.untitled : pe.productEditor.addNew}
        description={
          id ? (
            <span className="admin-inline">
              <span className="admin-tag" data-tone={data.isActive ? "good" : "neutral"}>
                {data.isActive ? pe.productEditor.visible : pe.productEditor.hidden}
              </span>
              {brand?.name}
            </span>
          ) : (
            pe.productEditor.addNewHint
          )
        }
        actions={actions}
      />
      <div className="admin-segments" role="tablist" aria-label={pe.productEditor.tablist}>
        {TABS.map((t) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === t}
            aria-controls={`product-${t}`}
            key={t}
            onClick={() => setTab(t)}
          >
            {TAB_LABEL[t]}
            {counts[t] !== undefined && <span className="admin-count">{counts[t]}</span>}
            {errorTabs.has(t) && <span className="admin-error-dot" aria-label={pe.productEditor.hasErrors} />}
          </button>
        ))}
      </div>
      {result && !result.ok && <Result result={result} />}
      <div className="admin-editor-grid">
        <div className="admin-stack" id={`product-${tab}`} role="tabpanel">
          {tab === "basics" && (
            <>
              <Panel title={pe.productEditor.detailsTitle}>
                <div className="admin-form">
                  <label className="admin-field">
                    <span>{pe.productEditor.productName}</span>
                    <input
                      value={data.name}
                      maxLength={500}
                      placeholder={pe.productEditor.namePlaceholder}
                      aria-invalid={Boolean(errors.name)}
                      onChange={(e) => set("name", e.target.value)}
                    />
                    <FieldError error={errors.name} />
                  </label>
                  <label className="admin-field">
                    <span>{pe.productEditor.urlHandle}</span>
                    <span className="admin-input-affix">
                      <em>{pe.productEditor.urlPrefix}</em>
                      <input
                        value={data.slug}
                        maxLength={160}
                        aria-invalid={Boolean(errors.slug)}
                        onChange={(e) => set("slug", e.target.value)}
                      />
                    </span>
                    <FieldError error={errors.slug} />
                  </label>
                  <MarkdownField
                    label={pe.productEditor.description}
                    value={data.description}
                    onChange={(v) => set("description", v)}
                  />
                  <FieldError error={errors.description} />
                </div>
              </Panel>
              <Panel title={pe.productEditor.attributesTitle} description={pe.productEditor.attributesDesc}>
                <div className="admin-form">
                  <ChipChoice label={pe.productEditor.gender} value={data.gender} options={GENDERS} onChange={(v) => set("gender", v)} format={humanize} />
                  <ChipChoice
                    label={pe.productEditor.concentration}
                    value={data.concentration}
                    options={CONCENTRATIONS}
                    onChange={(v) => set("concentration", v)}
                    format={humanize}
                  />
                  <ChipChoice label={pe.productEditor.packaging} value={data.packaging} options={PACKAGING} onChange={(v) => set("packaging", v)} format={humanize} />
                  <div className="admin-form-grid three">
                    <label className="admin-field">
                      <span>{pe.productEditor.perfumer}</span>
                      <input value={data.perfumer ?? ""} maxLength={500} onChange={(e) => set("perfumer", e.target.value || null)} />
                      <FieldError error={errors.perfumer} />
                    </label>
                    <label className="admin-field">
                      <span>{pe.productEditor.launchYear}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={1700}
                        max={2200}
                        value={data.launchYear ?? ""}
                        onChange={(e) => set("launchYear", e.target.value ? Number(e.target.value) : null)}
                      />
                      <FieldError error={errors.launchYear} />
                    </label>
                    <label className="admin-field">
                      <span>{pe.productEditor.country}</span>
                      <input value={data.countryOfOrigin ?? ""} maxLength={500} onChange={(e) => set("countryOfOrigin", e.target.value || null)} />
                      <FieldError error={errors.countryOfOrigin} />
                    </label>
                  </div>
                </div>
              </Panel>
            </>
          )}

          {tab === "variants" && (
            <Panel
              title={pe.productEditor.pricingTitle}
              description={pe.productEditor.pricingDesc()}
            >
              <div className="admin-variants">
                {data.variants.map((v, i) => {
                  const off = v.retailPrice > 0 && v.price < v.retailPrice ? Math.round((1 - v.price / v.retailPrice) * 100) : 0;
                  const err = (key: string) => errors[`variants.${i}.${key}`];
                  return (
                    <fieldset key={v.id ?? i} className="admin-variant" data-inactive={!v.isActive || undefined}>
                      <legend className="admin-sr-only">{pe.productEditor.variantLegend(i + 1)}</legend>
                      <div className="admin-variant-head">
                        <span className="admin-variant-title">
                          <strong>
                            {v.sizeLabel ||
                              (v.sizeMl != null ? `${v.sizeMl} ml` : pe.productEditor.volumePendingLabel)}
                          </strong>
                          {off > 0 && <span className="admin-tag" data-tone="info">−{off}%</span>}
                        </span>
                        <label className="admin-radio-pill">
                          <input type="radio" name="default-variant" checked={v.isDefault} onChange={() => variant(i, "isDefault", true)} />
                          {pe.productEditor.defaultSize}
                        </label>
                        <label className="admin-switch-inline">
                          <input type="checkbox" role="switch" className="admin-switch" checked={v.isActive} onChange={(e) => variant(i, "isActive", e.target.checked)} />
                          {pe.productEditor.active}
                        </label>
                        <button
                          type="button"
                          className="admin-btn icon sm ghost"
                          disabled={data.variants.length === 1}
                          aria-label={pe.productEditor.removeVariant(i + 1)}
                          onClick={() => set("variants", data.variants.filter((_, n) => n !== i))}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <div className="admin-form-grid four">
                        <VariantVolumeField
                          sizeMl={v.sizeMl}
                          error={err("sizeMl")}
                          onChange={(ml, label) => setVariantVolume(i, ml, label)}
                        />
                        <label className="admin-field">
                          <span>{pe.productEditor.label}</span>
                          <input
                            value={v.sizeLabel ?? ""}
                            onChange={(e) => variant(i, "sizeLabel", e.target.value)}
                            placeholder={pe.productEditor.volumeCustomPlaceholder}
                          />
                          <FieldError error={err("sizeLabel")} />
                        </label>
                        <label className="admin-field span-2">
                          <span>{pe.productEditor.sku}</span>
                          <span className="admin-input-affix">
                            <input value={v.sku} onChange={(e) => variant(i, "sku", e.target.value)} aria-invalid={Boolean(err("sku"))} className="admin-mono" />
                            <button
                              type="button"
                              className="admin-affix-btn"
                              title={pe.productEditor.suggestSku}
                              aria-label={pe.productEditor.suggestSku}
                              onClick={() =>
                                variant(i, "sku", `${slug(brand?.name ?? "brand")}-${slug(data.name) || "product"}-${v.sizeMl}`.toUpperCase())
                              }
                            >
                              <Sparkles size={15} />
                            </button>
                          </span>
                          <FieldError error={err("sku")} />
                        </label>
                        <MoneyReaisField
                          label={pe.productEditor.costLabel}
                          valueMinor={v.costPrice}
                          optional
                          onChange={(minor) => patchVariant(i, { costPrice: minor })}
                        />
                        <label className="admin-field">
                          <span>{pe.productEditor.markupPix}</span>
                          <span className="admin-input-affix">
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={500}
                              step={1}
                              value={v.markupPixPercent}
                              onChange={(e) =>
                                patchVariant(i, {
                                  markupPixPercent: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                            />
                            <em>%</em>
                          </span>
                        </label>
                        <label className="admin-field">
                          <span>{pe.productEditor.markupCard}</span>
                          <span className="admin-input-affix">
                            <input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={500}
                              step={1}
                              value={v.markupCardPercent}
                              onChange={(e) =>
                                patchVariant(i, {
                                  markupCardPercent: Math.max(0, Number(e.target.value) || 0),
                                })
                              }
                            />
                            <em>%</em>
                          </span>
                          <small className="admin-muted">{pe.productEditor.costHint}</small>
                        </label>
                        <MoneyReaisField
                          label={pe.productEditor.supplierSuggested}
                          valueMinor={v.supplierSuggestedPrice}
                          optional
                          onChange={(minor) => variant(i, "supplierSuggestedPrice", minor)}
                        />
                        <MoneyReaisField
                          label={pe.productEditor.pricePix}
                          valueMinor={v.price}
                          error={err("price")}
                          onChange={(minor) => variant(i, "price", minor ?? 0)}
                        />
                        <MoneyReaisField
                          label={pe.productEditor.priceCard}
                          valueMinor={v.cardPrice ?? v.retailPrice}
                          error={err("cardPrice")}
                          onChange={(minor) => {
                            const m = minor ?? 0;
                            variant(i, "cardPrice", m);
                            variant(i, "retailPrice", m);
                          }}
                        />
                        {v.costPrice != null && v.costPrice > 0 && (() => {
                          const p = pricingFromCost({
                            costMinor: v.costPrice,
                            markupPixPercent: v.markupPixPercent,
                            markupCardPercent: v.markupCardPercent,
                          });
                          return (
                            <p className="admin-muted" style={{ gridColumn: "1 / -1", margin: 0 }}>
                              {pe.productEditor.profitPreview(
                                formatMoney(p.grossProfitPixMinor),
                                formatMoney(p.grossProfitCardMinor),
                              )}
                            </p>
                          );
                        })()}
                        <label className="admin-field">
                          <span>{pe.productEditor.inStock}</span>
                          <input type="number" inputMode="numeric" min={0} step={1} value={v.stockQuantity} onChange={(e) => variant(i, "stockQuantity", Number(e.target.value))} aria-invalid={Boolean(err("stockQuantity"))} />
                          <FieldError error={err("stockQuantity")} />
                        </label>
                        <label className="admin-field">
                          <span>{pe.productEditor.barcode}</span>
                          <input value={v.barcode ?? ""} onChange={(e) => variant(i, "barcode", e.target.value)} className="admin-mono" />
                          <FieldError error={err("barcode")} />
                        </label>
                      </div>
                    </fieldset>
                  );
                })}
                <button type="button" className="admin-add-tile" onClick={() => set("variants", [...data.variants, blankVariant()])}>
                  <Plus size={16} /> {pe.productEditor.addSize}
                </button>
              </div>
              <FieldError error={errors.variants} />
            </Panel>
          )}

          {tab === "images" && (
            <Panel
              title={pe.productEditor.imagesTitle}
              description={pe.productEditor.imagesDesc}
              actions={
                <button
                  type="button"
                  className="admin-btn sm"
                  onClick={() => set("images", [...data.images, { url: "", alt: data.name }])}
                >
                  <Link2 size={14} /> {pe.productEditor.addByUrl}
                </button>
              }
            >
              <div
                className="admin-gallery"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  if (drag === undefined && e.dataTransfer.files.length) {
                    e.preventDefault();
                    void addFiles(e.dataTransfer.files);
                  }
                }}
              >
                {data.images.map((image, i) => (
                  <figure
                    className="admin-gallery-item"
                    key={i}
                    draggable
                    data-dragging={drag === i || undefined}
                    onDragStart={() => setDrag(i)}
                    onDragEnd={() => setDrag(undefined)}
                    onDrop={(e) => {
                      if (drag === undefined) return;
                      e.preventDefault();
                      e.stopPropagation();
                      moveImage(drag, i);
                      setDrag(undefined);
                    }}
                  >
                    <div className="admin-gallery-media">
                      {image.url ? (
                        <Image unoptimized fill sizes="240px" src={image.url} alt={image.alt} />
                      ) : (
                        <span className="admin-muted">{pe.productEditor.noImage}</span>
                      )}
                      {i < 2 && (
                        <span className="admin-gallery-badge">
                          {i === 0 ? pe.productEditor.primaryBadge : pe.productEditor.hoverBadge}
                        </span>
                      )}
                      <span className="admin-gallery-grip" aria-hidden>
                        <GripVertical size={14} />
                      </span>
                    </div>
                    <figcaption>
                      {!image.url.startsWith("/uploads/") && (
                        <input
                          value={image.url}
                          aria-label={pe.productEditor.imageUrl(i + 1)}
                          placeholder="/catalog/nome.webp ou https://…"
                          onChange={(e) => set("images", data.images.map((row, n) => (n === i ? { ...row, url: e.target.value } : row)))}
                        />
                      )}
                      <input
                        value={image.alt}
                        aria-label={pe.productEditor.imageAlt(i + 1)}
                        placeholder={pe.productEditor.altPlaceholder}
                        onChange={(e) => set("images", data.images.map((row, n) => (n === i ? { ...row, alt: e.target.value } : row)))}
                      />
                      <FieldError error={errors[`images.${i}.url`] ?? errors[`images.${i}.alt`]} />
                      <div className="admin-gallery-actions">
                        <button type="button" className="admin-btn icon sm ghost" disabled={i === 0} aria-label={pe.productEditor.moveEarlier(i + 1)} onClick={() => moveImage(i, i - 1)}>
                          <ArrowUp size={14} />
                        </button>
                        <button type="button" className="admin-btn icon sm ghost" disabled={i === data.images.length - 1} aria-label={pe.productEditor.moveLater(i + 1)} onClick={() => moveImage(i, i + 1)}>
                          <ArrowDown size={14} />
                        </button>
                        <button type="button" className="admin-btn icon sm ghost danger-text" aria-label={pe.productEditor.removeImage(i + 1)} onClick={() => set("images", data.images.filter((_, n) => n !== i))}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
                <button type="button" className="admin-gallery-add" onClick={() => uploader.current?.click()} disabled={uploading > 0}>
                  <span className="admin-icon-tile">
                    {uploading ? <LoaderCircle size={18} className="admin-spin" /> : <ImagePlus size={18} />}
                  </span>
                  <strong>{uploading ? pe.productEditor.uploading(uploading) : pe.productEditor.addImages}</strong>
                  <small>{pe.productEditor.addImagesHint}</small>
                </button>
              </div>
            </Panel>
          )}

          {tab === "notes" && (
            <Panel
              title={pe.productEditor.pyramidTitle}
              description={pe.productEditor.pyramidDesc}
              actions={
                <InlineCreate
                  entity="notes"
                  choices={choices}
                  onCreated={(noteId) => set("notes", [...data.notes, { noteId, position: "top" }])}
                />
              }
            >
              <div className="admin-pyramid">
                {NOTE_POSITIONS.map((position) => {
                  const { title, blurb } = pe.productEditor.notePositions[position];
                  const layer = title.toLowerCase();
                  const picked = data.notes.filter((n) => n.position === position);
                  return (
                    <div key={position} className="admin-pyramid-tier">
                      <div className="admin-pyramid-head">
                        <strong>{title}</strong>
                        <small>{blurb}</small>
                      </div>
                      <div className="admin-chips">
                        {picked.map((n) => {
                          const note = choices.notes.find((c) => c.id === n.noteId);
                          return (
                            <span className="admin-chip on" key={n.noteId}>
                              {note?.name ?? pe.productEditor.unknownNote}
                              <button
                                type="button"
                                aria-label={pe.productEditor.removeNote(note?.name ?? "", layer)}
                                onClick={() => set("notes", data.notes.filter((v) => v.noteId !== n.noteId || v.position !== position))}
                              >
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                        {!picked.length && <small className="admin-muted">{pe.productEditor.noneYet}</small>}
                      </div>
                      <Combobox
                        label={pe.productEditor.addNote(layer)}
                        hideLabel
                        placeholder={pe.productEditor.addNotePlaceholder(layer)}
                        options={choices.notes
                          .filter((c) => !picked.some((p) => p.noteId === c.id))
                          .map((c) => ({ value: c.id, label: c.name, hint: humanize(c.group) }))}
                        onSelect={(noteId) => set("notes", [...data.notes, { noteId, position }])}
                      />
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}
        </div>

        <aside className="admin-stack admin-editor-rail">
          <Panel
            title={pe.productEditor.mediaTitle}
            actions={
              tab !== "images" && (
                <button type="button" className="admin-btn sm ghost" onClick={() => setTab("images")}>
                  {pe.productEditor.manage}
                </button>
              )
            }
          >
            <div className="admin-media-preview">
              <button type="button" className="admin-media-main" onClick={() => setTab("images")} aria-label={pe.productEditor.manageImages}>
                {data.images[0]?.url ? (
                  <Image unoptimized fill sizes="320px" src={data.images[0].url} alt={data.images[0].alt} />
                ) : (
                  <span>
                    <ImagePlus size={22} />
                    {pe.productEditor.addPrimary}
                  </span>
                )}
              </button>
              <div className="admin-media-thumbs">
                {data.images.slice(1, 3).map((img, i) => (
                  <button type="button" key={i} onClick={() => setTab("images")} aria-label={pe.productEditor.imageN(i + 2)}>
                    {img.url && <Image unoptimized fill sizes="96px" src={img.url} alt="" />}
                  </button>
                ))}
                <button type="button" className="admin-media-add" onClick={() => { setTab("images"); uploader.current?.click(); }} aria-label={pe.productEditor.addImages}>
                  {data.images.length > 3 ? `+${data.images.length - 3}` : <Plus size={18} />}
                </button>
              </div>
            </div>
          </Panel>

          <Panel title={pe.productEditor.orgTitle}>
            <div className="admin-form">
              <div className="admin-field">
                <Combobox
                  label={pe.productEditor.brand}
                  value={data.brandId}
                  placeholder={pe.productEditor.searchBrands}
                  options={choices.brands.map((b) => ({ value: b.id, label: b.name }))}
                  onSelect={(v) => set("brandId", v)}
                />
                <FieldError error={errors.brandId} />
                <InlineCreate entity="brands" choices={choices} onCreated={(v) => set("brandId", v)} />
              </div>
              <label className="admin-field">
                <span>{pe.productEditor.fragranceFamily}</span>
                <input
                  list="admin-families"
                  value={data.fragranceFamily ?? ""}
                  maxLength={500}
                  placeholder={pe.productEditor.familyPlaceholder}
                  onChange={(e) => set("fragranceFamily", e.target.value || null)}
                />
                <datalist id="admin-families">
                  {choices.families.map((f) => (
                    <option key={f} value={f} />
                  ))}
                </datalist>
              </label>
              <label className="admin-field">
                <span>{pe.productEditor.collectionName}</span>
                <input value={data.collectionName ?? ""} maxLength={500} placeholder={pe.productEditor.collectionPlaceholder} onChange={(e) => set("collectionName", e.target.value || null)} />
              </label>
            </div>
          </Panel>

          <Panel title={pe.productEditor.visibilityTitle}>
            <div className="admin-switch-list">
              {id && (
                <SwitchField label={pe.productEditor.visibleLabel} description={pe.productEditor.visibleDesc} checked={data.isActive} onChange={(v) => set("isActive", v)} />
              )}
              <SwitchField label={pe.productEditor.featuredLabel} description={pe.productEditor.featuredDesc} checked={data.isFeatured} onChange={(v) => set("isFeatured", v)} />
              <SwitchField label={pe.productEditor.groundOnlyLabel} description={pe.productEditor.groundOnlyDesc} checked={data.groundShippingOnly} onChange={(v) => set("groundShippingOnly", v)} />
            </div>
          </Panel>

          <Panel title={pe.productEditor.summaryTitle}>
            <dl className="admin-meta">
              <div>
                <dt>{pe.productEditor.summaryPrice}</dt>
                <dd>{prices.length ? (Math.min(...prices) === Math.max(...prices) ? formatMoney(prices[0]) : `${formatMoney(Math.min(...prices))} – ${formatMoney(Math.max(...prices))}`) : "—"}</dd>
              </div>
              <div>
                <dt>{pe.productEditor.summaryStock}</dt>
                <dd>{pe.productEditor.stockSummary(stock, activeVariants.length)}</dd>
              </div>
              <div>
                <dt>{pe.productEditor.summaryNotes}</dt>
                <dd>{data.notes.length || pe.productEditor.summaryNone}</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
      <input
        ref={uploader}
        type="file"
        hidden
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          if (e.target.files) void addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <div className="admin-savebar" data-visible={dirty || undefined}>
        <span>
          <i aria-hidden /> {pe.productEditor.unsaved}
          <kbd className="admin-hide-sm">⌘S</kbd>
        </span>
        <div>
          {id ? (
            <button className="admin-btn primary sm" disabled={pending} onClick={() => save()}>
              {pending && <LoaderCircle size={14} className="admin-spin" />}
              {pe.productEditor.saveChanges}
            </button>
          ) : (
            <button className="admin-btn primary sm" disabled={pending} onClick={() => save({ isActive: true })}>
              {pe.productEditor.publish}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
