# Fotos de produto pelo celular (Bela de Perfume)

Na Vercel o disco do servidor é só leitura. Para **escolher foto no admin pelo celular** e ela aparecer na loja na hora, configure armazenamento na nuvem **uma vez**:

## Opção recomendada: Cloudflare R2

Siga [storage.md](./storage.md) (seção R2) e defina na Vercel:

- `STORAGE_ADAPTER=s3`
- `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`

Redeploy. Depois, no admin → produto → **Imagens** → escolha a foto no celular. O site envia, converte para WebP e salva o link no produto.

## Sem nuvem (temporário)

Cole um link **https://** público da imagem (Imgur, link direto do Google Drive, etc.) em **Adicionar por URL** ou no pop-up quando o envio automático falhar.

## Só no computador

Pasta `fotos-produtos/` → `npm run images:import` → `git push` (não precisa no dia a dia se a nuvem estiver ativa).
