# Configura o banco Neon: migrate + admin + catálogo fornecedor (58 perfumes).
# Pré-requisito: DATABASE_URL preenchido em .env
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)
$envFile = Join-Path (Get-Location) ".env"
if (-not (Test-Path $envFile)) { throw "Arquivo .env não encontrado." }
$content = Get-Content $envFile -Raw
if ($content -match 'DATABASE_URL=\s*$' -or $content -notmatch 'DATABASE_URL=postgres') {
  throw @"
DATABASE_URL ainda vazio no .env.
1. Abra https://console.neon.tech/app/projects/floral-breeze-10552439
2. Connect → Connection string → Pooled (com sslmode=require)
3. Cole em DATABASE_URL= no .env e rode este script de novo.
"@
}
Write-Host "Migrando schema..." -ForegroundColor Cyan
npm run db:migrate
Write-Host "Criando admin (sem demo)..." -ForegroundColor Cyan
npm run db:seed -- --admin-only
Write-Host "Importando catálogo Bela (58 produtos)..." -ForegroundColor Cyan
npm run db:replace-bela-catalog
Write-Host "Pronto. Admin: /admin com ADMIN_EMAIL e ADMIN_PASSWORD do .env" -ForegroundColor Green
