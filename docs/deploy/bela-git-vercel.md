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

## Imagens de produto (Vercel)

Na **Vercel**, arrastar arquivo no admin **não funciona** com armazenamento local (disco só leitura). Você verá erro de upload. Duas opções:

### Opção A — Fotos do PC como link leve (recomendado agora)

1. Coloque JPEG/PNG/WebP na pasta **`fotos-produtos/`** (na raiz do projeto).
2. Rode:

```bash
npm run images:import
```

3. Isso gera WebP em **`public/catalog/`** (leve, servido pelo próprio site).
4. Publique no Git:

```bash
git add public/catalog
git commit -m "Imagens de produto"
git push origin main
```

5. No admin → produto → **Imagens** → **Adicionar por URL** → cole, por exemplo:  
   **`/catalog/maahir.webp`** (o script imprime o caminho certo para cada arquivo).
6. **Salvar alterações**.

URLs externas (`https://…`) também funcionam em **Adicionar por URL**, desde que sejam públicas.

### Opção B — Upload direto no admin (bucket)

Configure **Cloudflare R2** ou Supabase Storage e defina `STORAGE_ADAPTER=s3` na Vercel. Passo a passo: [storage.md](storage.md).

## Banners / hero (upload local no PC)

Upload no admin grava em `.data/uploads` **só no seu PC**. Para aparecer no site publicado:

```bash
npm run images:publish-local   # copia para public/hero e atualiza Neon
git add public/hero
git commit -m "Publicar imagens do hero"
git push origin main
```
