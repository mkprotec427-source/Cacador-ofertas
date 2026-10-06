# Caçador de Ofertas

Ferramenta de curadoria assistida para canal de promoções no WhatsApp.
Fluxo: oferta cadastrada manualmente → desconto, cupom e score → mensagem pronta → revisão → cópia e publicação manual.

Não faz scraping de marketplaces, não automatiza WhatsApp e não converte links de afiliado.

## Stack
Next.js 14, TypeScript, Tailwind e Supabase.

## Como rodar
1. No Supabase (SQL Editor), execute `supabase/schema.sql`. Em um banco que já tinha a tabela, execute `supabase/migrations/002_curadoria_assistida.sql`.
2. Copie `.env.example` para `.env.local` e preencha as variáveis. Nunca faça commit do `.env.local`.
3. Instale e inicie:
```bash
npm install
npm run dev   # http://localhost:3000
```

## Variáveis de ambiente (somente servidor)
- `SUPABASE_URL` (obrigatória)
- `SUPABASE_SERVICE_ROLE_KEY` (obrigatória, chave secreta do Supabase)
- `ANTHROPIC_API_KEY` (opcional; sem ela a mensagem usa o template local)

## Scripts
`npm run dev`, `npm run build`, `npm run typecheck`, `npm test`

## Aviso
O app não tem autenticação. Não o publique em endereço aberto sem adicionar login.
