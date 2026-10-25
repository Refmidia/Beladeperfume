"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Link2, LoaderCircle, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { uploadCatalogImage } from "./fields";
import { slugify } from "@/lib/slug";
import { adminCopy as t } from "@/lib/admin/copy";

export function catalogPathFromFileName(fileName: string, fallbackSlug: string) {
  const base = fileName.replace(/\.[^.]+$/i, "");
  let slug = "";
  try {
    slug = slugify(base);
  } catch {
    slug = fallbackSlug;
  }
  if (!slug) slug = fallbackSlug || "imagem";
  return `/catalog/${slug}.webp`;
}

export type PendingCatalogLink = {
  file: File;
  previewUrl: string;
  url: string;
  alt: string;
  fileName: string;
  uploadError?: string;
};

export function CatalogLinkDialog({
  pending,
  onConfirm,
  onCancel,
}: {
  pending: PendingCatalogLink | null;
  onConfirm: (url: string, alt: string) => void;
  onCancel: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setUrl(pending.url);
    setAlt(pending.alt);
    dialog.current?.showModal();

    let cancelled = false;
    void (async () => {
      setUploading(true);
      try {
        const slug = pending.url
          .replace(/^\/catalog\//, "")
          .replace(/\.webp$/i, "");
        const uploaded = await uploadCatalogImage(
          pending.file,
          slug || "imagem",
        );
        if (cancelled) return;
        setUrl(uploaded);
        toast.success(t.productEditor.catalogUploadOk);
        onConfirm(uploaded, pending.alt);
        dialog.current?.close();
      } catch (e) {
        if (!cancelled) toast.error((e as Error).message);
      } finally {
        if (!cancelled) setUploading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pending]);

  function close() {
    dialog.current?.close();
    onCancel();
  }

  if (!pending) return null;

  return (
    <dialog
      ref={dialog}
      className="admin-dialog"
      onClose={() => onCancel()}
    >
      <div className="admin-dialog-head">
        <div>
          <strong>{t.productEditor.catalogLinkTitle}</strong>
          <p className="admin-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
            {t.productEditor.catalogLinkSubtitle}
          </p>
        </div>
        <button type="button" className="admin-btn icon ghost" onClick={close} aria-label="Fechar">
          <X size={16} />
        </button>
      </div>
      <div className="admin-dialog-body">
        <div className="admin-catalog-link-preview">
          <Image unoptimized fill src={pending.previewUrl} alt="" sizes="320px" />
        </div>
        <p className="admin-muted admin-hint">{t.productEditor.catalogLinkFile(pending.fileName)}</p>
        <label className="admin-field">
          <span>{t.productEditor.catalogLinkUrlLabel}</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/catalog/nome.webp"
            className="admin-mono"
            autoFocus
          />
        </label>
        <label className="admin-field">
          <span>{t.productEditor.imageAlt(1)}</span>
          <input value={alt} onChange={(e) => setAlt(e.target.value)} />
        </label>
        {pending.uploadError && (
          <p className="admin-field-error" role="alert">
            {pending.uploadError}
          </p>
        )}
        <p className="admin-hint">{t.productEditor.catalogLinkHintMobile}</p>
        <p className="admin-hint admin-muted">{t.productEditor.catalogLinkHintDesktop}</p>
      </div>
      <div className="admin-dialog-foot">
        <button type="button" className="admin-btn" onClick={close}>
          {t.common.cancel}
        </button>
        <button
          type="button"
          className="admin-btn"
          disabled={uploading}
          onClick={async () => {
            setUploading(true);
            try {
              const slug = url.replace(/^\/catalog\//, "").replace(/\.webp$/i, "");
              const uploaded = await uploadCatalogImage(pending.file, slug || "imagem");
              setUrl(uploaded);
              toast.success(t.productEditor.catalogUploadOk);
            } catch (e) {
              toast.error((e as Error).message);
            } finally {
              setUploading(false);
            }
          }}
        >
          {uploading ? (
            <LoaderCircle size={14} className="admin-spin" />
          ) : (
            <Upload size={14} />
          )}{" "}
          {t.productEditor.catalogUploadRetry}
        </button>
        <button
          type="button"
          className="admin-btn primary"
          disabled={
            uploading ||
            (!/^https?:\/\//i.test(url.trim()) &&
              url.trim().startsWith("/catalog/"))
          }
          onClick={() => {
            const trimmed = url.trim();
            if (!trimmed.startsWith("/") && !/^https?:\/\//i.test(trimmed)) {
              toast.error("Use um caminho /catalog/… ou https://…");
              return;
            }
            if (
              trimmed.startsWith("/catalog/") &&
              !/^https?:\/\//i.test(trimmed)
            ) {
              toast.error(
                "Envie a foto primeiro (URL deve começar com https://).",
              );
              return;
            }
            onConfirm(trimmed, alt.trim() || pending.alt);
            dialog.current?.close();
          }}
        >
          <Link2 size={14} /> {t.productEditor.catalogLinkConfirm}
        </button>
      </div>
    </dialog>
  );
}
