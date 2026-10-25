# Bela de Perfume — R2 (seu bucket `beledeperfume`)

Valores fixos do seu painel Cloudflare (out/2025):

| Variável | Valor |
|----------|--------|
| `STORAGE_ADAPTER` | `s3` |
| `S3_ENDPOINT` | `https://38c48df65ccae0bf9ed7eea9fbb693fa.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_BUCKET` | `beledeperfume` |
| `S3_PUBLIC_URL` | `https://pub-8b60d14c67e44896af88661fc2e5e7a3.r2.dev` |
| `S3_ACCESS_KEY_ID` | *(token R2)* |
| `S3_SECRET_ACCESS_KEY` | *(token R2 — secreto)* |

**Importante:** `S3_ENDPOINT` é só até `.com`, **sem** `/beledeperfume` no final.

## 1. URL pública (obrigatório)

Bucket **beledeperfume** → **Configurações** → **URL de desenvolvimento público** → **Habilitar** → copie algo como `https://pub-xxxx.r2.dev` → `S3_PUBLIC_URL`.

## 2. Token de API

R2 → **Gerenciar tokens de API do R2** → criar com **Read & Write** no bucket `beledeperfume`.

## 3. `.env` local (não commitar)

```env
STORAGE_ADAPTER=s3
S3_ENDPOINT=https://38c48df65ccae0bf9ed7eea9fbb693fa.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=beledeperfume
S3_ACCESS_KEY_ID=coloque_aqui
S3_SECRET_ACCESS_KEY="coloque_aqui"
S3_PUBLIC_URL=https://pub-xxxx.r2.dev
```

## 4. Enviar para Vercel

```bash
node scripts/sync-r2-env-vercel.mjs
```

Depois **Redeploy** em [vercel.com](https://vercel.com) → projeto beladeperfume.

## 5. Testar

Admin → produto → Imagens → escolher foto → deve enviar e aparecer na loja após salvar.
