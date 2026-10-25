"use client";
import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@base-ui/react/select";
import { Check, ChevronDown, LoaderCircle, Search, SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { label } from "@/lib/catalog/labels";
import { copy } from "@/lib/storefront/copy";
import { storeConfig } from "../../../store.config";
import { SheetGrabber } from "./sheet-drag";

type Facets = Record<string, { value: string; label: string; count: number; group?: string }[]>;
const facetNames = copy.filters.facetNames;
const COLLAPSED_OPTIONS = 6;
const filterKeys = [...Object.keys(facetNames), "minPrice", "maxPrice", "inStock", "deal", "new"];
const countSelected = (params: URLSearchParams) =>
  filterKeys.reduce((n, key) => n + params.getAll(key).filter(Boolean).length, 0);

function FilterForm({ facets, mobile, onApplied }: { facets: Facets; mobile: boolean; onApplied: () => void }) {
  const search = useSearchParams(),
    pathname = usePathname(),
    router = useRouter();
  const [draft, setDraft] = useState(() => new URLSearchParams(search));
  const [brandSearch, setBrandSearch] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const count = countSelected(draft);
  const dirty = draft.toString() !== new URLSearchParams(search).toString();
  const id = mobile ? "m" : "d";
  function change(key: string, value: string, checked?: boolean) {
    const next = new URLSearchParams(draft);
    if (checked === undefined) {
      next.delete(key);
      if (value) next.set(key, value);
    } else if (checked) next.append(key, value);
    else next.delete(key, value);
    setDraft(next);
    setError("");
  }
  return (
    <form
      aria-label={mobile ? copy.filters.mobile : copy.filters.product}
      aria-busy={pending}
      className="filter-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (draft.get("minPrice") && draft.get("maxPrice") && Number(draft.get("minPrice")) > Number(draft.get("maxPrice"))) {
          setError(copy.filters.priceError);
          return;
        }
        const next = new URLSearchParams(draft);
        next.delete("page");
        startTransition(() => {
          router.push(`${pathname}?${next}`, { scroll: false });
          onApplied();
        });
      }}
    >
      <div className="filter-scroll">
        {!mobile && (
          <div className="filter-head">
            <h2>{copy.filters.title}</h2>
            {count > 0 && <span className="count-pill">{count}</span>}
          </div>
        )}
        <div className="filter-toggles">
          {[
            ["inStock", copy.filters.inStockOnly],
            ["deal", copy.filters.onSale],
          ].map(([key, text]) => (
            <label key={key} className="switch-row">
              <span>{text}</span>
              <input
                type="checkbox"
                role="switch"
                className="switch"
                name={key}
                checked={draft.get(key) === "true"}
                onChange={(e) => change(key, e.target.checked ? "true" : "")}
              />
            </label>
          ))}
        </div>
        <fieldset className="filter-group filter-price">
          <legend>{copy.filters.price}</legend>
          <div className="price-inputs">
            {[
              ["minPrice", copy.filters.minPrice, "0"],
              ["maxPrice", copy.filters.maxPrice, copy.filters.any],
            ].map(([key, text, placeholder]) => (
              <label key={key} className="input-affix">
                <span className="sr-only">{text}</span>
                <em aria-hidden>{storeConfig.currency.symbol}</em>
                <input
                  name={key}
                  type="number"
                  min="0"
                  max="2147483647"
                  step="1"
                  inputMode="numeric"
                  value={draft.get(key) ?? ""}
                  placeholder={placeholder}
                  onChange={(e) => change(key, e.target.value)}
                  aria-describedby={error ? `price-error-${id}` : undefined}
                  aria-invalid={!!error}
                />
              </label>
            ))}
          </div>
          {error && (
            <p id={`price-error-${id}`} role="alert" className="field-error">
              {error}
            </p>
          )}
        </fieldset>
        {Object.entries(facetNames)
          .filter(([key]) => facets[key]?.length)
          .map(([key, title]) => {
            const options = [
              ...facets[key],
              ...draft
                .getAll(key)
                .filter((value) => !facets[key].some((o) => o.value === value))
                .map((value) => ({ value, label: value, count: 0, group: undefined })),
            ];
            const selected = draft.getAll(key);
            const matches = options.filter(
              (o) => key !== "brand" || o.label.toLowerCase().includes(brandSearch.toLowerCase()),
            );
            const collapsible = matches.length > COLLAPSED_OPTIONS + 1 && !(key === "brand" && brandSearch);
            const isExpanded = !collapsible || expanded.includes(key);
            const visible = isExpanded
              ? matches
              : matches.filter((o, index) => index < COLLAPSED_OPTIONS || selected.includes(o.value));
            return (
              <details key={key} className="filter-group" open={["gender", "brand"].includes(key) || selected.length > 0}>
                <summary>
                  {title}
                  {selected.length > 0 && <span className="count-pill">{selected.length}</span>}
                  <ChevronDown size={16} aria-hidden className="filter-chevron" />
                </summary>
                {key === "brand" && options.length > 6 && (
                  <label className="input-affix filter-search">
                    <Search size={15} aria-hidden />
                    <span className="sr-only">{copy.filters.findBrand}</span>
                    <input
                      type="search"
                      placeholder={copy.filters.findBrand}
                      value={brandSearch}
                      onChange={(e) => setBrandSearch(e.target.value)}
                    />
                  </label>
                )}
                <div className="filter-options">
                  {visible.map((option, index) => (
                    <div key={option.value}>
                      {option.group && option.group !== visible[index - 1]?.group && (
                        <p className="filter-subhead">{label(option.group)}</p>
                      )}
                      <label className="filter-option">
                        <input
                          type="checkbox"
                          className="checkbox"
                          name={key}
                          value={option.value}
                          checked={selected.includes(option.value)}
                          onChange={(e) => change(key, option.value, e.target.checked)}
                        />
                        <span>{label(option.label)}</span>
                        <span className="filter-count">{option.count}</span>
                      </label>
                    </div>
                  ))}
                  {!visible.length && <p className="filter-empty">{copy.filters.noBrandMatch(brandSearch)}</p>}
                </div>
                {collapsible && (
                  <button
                    type="button"
                    className="filter-more"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpanded((keys) => (isExpanded ? keys.filter((k) => k !== key) : [...keys, key]))
                    }
                  >
                    {isExpanded ? copy.filters.showFewer : copy.filters.showAll(matches.length)}
                    <ChevronDown size={15} aria-hidden />
                  </button>
                )}
              </details>
            );
          })}
      </div>
      <div className="filter-actions" data-dirty={dirty || undefined}>
        <button
          type="button"
          className="button ghost"
          disabled={pending || !count}
          onClick={() => {
            const next = new URLSearchParams(draft);
            filterKeys.forEach((key) => next.delete(key));
            setDraft(next);
            setError("");
          }}
        >
          {copy.filters.reset}
        </button>
        <button type="submit" className="button primary" disabled={pending || (!mobile && !dirty)}>
          {pending ? copy.filters.applying : copy.filters.showResults}
        </button>
      </div>
    </form>
  );
}

/** Desktop sidebar. */
export function Filters({ facets }: { facets: Facets }) {
  const search = useSearchParams();
  return (
    <aside className="filter-sidebar" aria-label={copy.filters.sidebar}>
      <FilterForm key={search.toString()} facets={facets} mobile={false} onApplied={() => {}} />
    </aside>
  );
}

/** Mobile/tablet trigger that opens the same form in a bottom sheet. */
export function MobileFilters({ facets }: { facets: Facets }) {
  const search = useSearchParams();
  const [open, setOpen] = useState(false);
  const count = countSelected(search);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="button mobile-filter-button">
        <SlidersHorizontal size={16} aria-hidden />
        {copy.filters.title}
        {count > 0 && <span className="count-pill">{count}</span>}
      </SheetTrigger>
      <SheetContent side="bottom" className="store-sheet filter-sheet">
        <SheetGrabber onDismiss={() => setOpen(false)} />
        <SheetTitle>{copy.filters.title}</SheetTitle>
        <SheetDescription className="sr-only">{copy.filters.sheetDesc}</SheetDescription>
        <FilterForm key={`${search}-${open}`} facets={facets} mobile onApplied={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

const sortOptions = [
  { value: "newest", label: copy.sort.newest },
  { value: "price-asc", label: copy.sort.priceAsc },
  { value: "price-desc", label: copy.sort.priceDesc },
  { value: "discount", label: copy.sort.discount },
  { value: "name", label: copy.sort.name },
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter(),
    pathname = usePathname(),
    params = useSearchParams();
  const [sorting, startSorting] = useTransition();
  return (
    <Select.Root
      items={sortOptions}
      value={value}
      onValueChange={(sort) => {
        if (!sort) return;
        const next = new URLSearchParams(params);
        next.set("sort", sort);
        next.delete("page");
        startSorting(() => router.push(`${pathname}?${next}`, { scroll: false }));
      }}
    >
      <Select.Trigger className="sort-select" aria-label={copy.sort.label} aria-busy={sorting} data-pending={sorting || undefined}>
        <span className="sort-label">{copy.filters.sortShort}</span>
        <Select.Value className="sort-value" />
        <Select.Icon className="sort-icon">
          {sorting ? <LoaderCircle size={15} className="spin" aria-hidden /> : <ChevronDown size={15} aria-hidden />}
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner className="sort-positioner" side="bottom" align="end" sideOffset={8} alignItemWithTrigger={false}>
          <Select.Popup className="sort-popup">
            <Select.List>
              {sortOptions.map((option) => (
                <Select.Item key={option.value} value={option.value} className="sort-option">
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator className="sort-check">
                    <Check size={15} aria-hidden />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.List>
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}
