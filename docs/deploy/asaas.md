# Asaas (PIX) — Bela de Perfume

Use a **mesma conta Asaas** de outro projeto: cada cobrança leva `externalReference` com o número do pedido (`BDP-…`). Configure **outro webhook** apontando para este domínio.

## O site manda mensagem pro cliente?

- **Attar:** notificações (`NOTIFY_ADAPTER`) vão só para **você** (log, Telegram ou e-mail da loja). O cliente **não** recebe e-mail automático do site ao comprar.
- **Asaas:** ao criar o pagador, enviamos `notificationDisabled: true` — a Asaas **não** dispara e-mail/SMS/WhatsApp de cobrança para o cliente. Confirmação de envio continua por telefone, como hoje.

## Ativar

1. `.env` (e Vercel → Environment Variables):

   ```env
   PAYMENT_ADAPTER=asaas
   ASAAS_API_KEY=sua_chave
   ASAAS_ENVIRONMENT=production
   ASAAS_WEBHOOK_TOKEN=token_longo_aleatorio
   ```

2. `store.config.ts` → `checkout.paymentProvider: "asaas"`.

3. Asaas → **Integrações → Webhooks** → URL  
   `https://beladeperfume.vercel.app/api/asaas/webhook`  
   Eventos de pagamento recebidos / confirmados. Use o mesmo token em `ASAAS_WEBHOOK_TOKEN`.

4. Redeploy.

## Fluxo

- Cliente escolhe **PIX**, informa **CPF/CNPJ** (exigência Asaas).
- Pedido é criado; a loja gera cobrança PIX e mostra **QR + copia e cola** na página de confirmação.
- Webhook marca `paymentVerified` no admin; status do pedido segue **pendente** até você confirmar por telefone (como antes).
- **Cartão** — cobrança `CREDIT_CARD` na Asaas; na confirmação do pedido o cliente abre a **fatura Asaas** (crédito ou débito). Valor = preço cartão do catálogo. Mesmo webhook confirma o pagamento.

## Sandbox

`ASAAS_API_KEY` do sandbox + `ASAAS_ENVIRONMENT=sandbox`.
