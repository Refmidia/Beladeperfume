# Bela de Perfume — Git → Vercel

Fluxo oficial: **sempre commitar e dar push no GitHub**; a Vercel publica a partir do repositório.

Repositório: **https://github.com/Refmidia/Beladeperfume** (branch `main`).

## Dia a dia

```bash
git add .
git status          # confira: .env NÃO deve aparecer
git commit -m "Descrição do que mudou"
git push origin main
```

1. Aguarde o deploy em [Vercel → beladeperfume → Deployments](https://vercel.com/refmidias-projects/beladeperfume).
2. Site: **https://beladeperfume.vercel.app**

Se o projeto Vercel estiver ligado ao GitHub, cada push em `main` gera deploy de produção sozinho. Evite `vercel deploy --prod` manual, salvo emergência.

## Variáveis secretas

- **Nunca** commite `.env` (Neon, Asaas, admin).
- Alterou env? Atualize em **Vercel → Settings → Environment Variables** (ou `npm run asaas:sync-vercel` só para Asaas).

## Fotos do admin (celular / produção)

Upload no admin grava em `.data/uploads` **só no seu PC**. Para aparecer no site publicado:

```bash
npm run images:publish-local   # copia para public/hero e atualiza Neon
git add public/hero
git commit -m "Publicar imagens do hero"
git push origin main
```

Para muitas fotos de produto no futuro, use bucket S3/R2 — ver [storage.md](storage.md).
