"use client";
import { storeConfig } from "../../store.config";
import { copy } from "@/lib/storefront/copy";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="store-width empty-state">
      <p className="store-logo">{storeConfig.store.name}</p>
      <h1>{copy.errors.pageLoad}</h1>
      <p>{copy.errors.tryAgain}</p>
      <button className="button primary" onClick={reset}>
        {copy.errors.retry}
      </button>
    </div>
  );
}
