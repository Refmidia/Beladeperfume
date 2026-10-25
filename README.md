# Bela de Perfume

Loja virtual premium de perfumes árabes construída com Next.js 15+, React, TypeScript e Tailwind CSS 4.

## Stack Tecnológico

- **Framework:** Next.js 15+ (App Router)
- **Linguagem:** TypeScript (strict mode)
- **Estilização:** Tailwind CSS 4
- **Componentes:** Radix UI + componentes customizados
- **Ícones:** Lucide React
- **Animações:** Framer Motion
- **Backend (planejado):** Supabase (PostgreSQL, Auth, Storage)
- **Pagamento (planejado):** Mercado Pago
- **Frete (planejado):** Melhor Envio

## Funcionalidades Implementadas

### Design System
- Paleta de cores premium (creme, dourado, tons terrosos)
- Tipografia serifada (Cormorant Garamond) + sans-serif (Manrope)
- Componentes responsivos Mobile First
- Animações suaves com Framer Motion

### Páginas
- **Home:** Hero com imagem, Best Sellers, Banners de Categorias, Novidades, Pronta Entrega, Quiz de Fragrâncias, Benefícios
- **Catálogo:** Grid responsivo (2 colunas mobile, 4 desktop), Filtros funcionais, Ordenação
- **Produto:** Detalhes com galeria, pirâmide olfativa, produtos relacionados
- **Carrinho:** Página placeholder

### Componentes Chave
- **ProductCard:** Design premium com moldura arredondada, selo de desconto, botões de ação
- **Header:** Responsivo com menu mobile em drawer
- **Footer:** Newsletter, links úteis, redes sociais
- **Filtros:** Drawer mobile, sidebar desktop

## Configuração Central

O nome da loja e configurações estão centralizados em `src/lib/config.ts`:

```typescript
import { siteConfig } from "@/lib/config";

// Uso:
siteConfig.name        // "Bela de Perfume"
siteConfig.tagline     // "Perfumes Árabes Premium"
siteConfig.contact     // email, phone, whatsapp
siteConfig.social      // instagram, facebook, whatsapp
```

## Começando

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build de produção
npm run build
```

## Estrutura do Projeto

```
src/
├── app/                    # App Router pages
│   ├── page.tsx           # Home
│   ├── catalogo/          # Catálogo com filtros
│   ├── produto/[slug]/    # Página de produto
│   └── carrinho/          # Carrinho
├── components/
│   ├── home/              # Componentes da home
│   ├── layout/            # Header, Footer
│   └── product/           # Cards, Grid, Filtros
├── data/
│   └── demo-products.ts   # Dados demonstrativos
├── lib/
│   ├── config.ts          # Configuração central da loja
│   └── utils.ts           # Utilitários
└── types/
    └── index.ts           # Tipos TypeScript
```

## Imagens

As imagens dos produtos são de [Unsplash](https://unsplash.com) com licença livre para uso comercial. Em produção, substituir pelas imagens reais dos produtos.

## Dados Demonstrativos

Os produtos exibidos são **FICTÍCIOS** e criados apenas para demonstração. Não representam produtos reais.

## Mobile First

- Grid de catálogo: 2 colunas no mobile, 3 no tablet, 4 no desktop
- Cards com padding interno e bordas arredondadas (17px)
- Header sticky com ícones elegantes
- Filtros em drawer no mobile

## Próximos Passos

- [ ] Integração Supabase (banco, auth, storage)
- [ ] Integração Mercado Pago
- [ ] Integração Melhor Envio
- [ ] Carrinho funcional
- [ ] Checkout completo
- [ ] Área do cliente
