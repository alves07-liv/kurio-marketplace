# Kurio Marketplace

Marketplace demonstrativo de NFTs desenvolvido para o desafio da Jungle Gaming. A API REST, a sessão e os eventos em tempo real são simulados no navegador com MSW; não há backend nem pagamento real.

## Acessos

- Aplicação publicada: https://nft-commerce-junglegaming.vercel.app
- E-mail de teste: `joao@jungle.test`
- Senha: `test123`

## Executar localmente

Requer Node.js 24 e npm.

```bash
npm ci
npm run dev
```

Acesse `http://127.0.0.1:5173`.

## Verificações

- `npm run typecheck`: valida os tipos TypeScript.
- `npm run lint`: verifica a qualidade estática do código.
- `npm run build`: gera o build de produção em `dist`.
- `npm test`: executa testes Playwright desktop e mobile.
- `npm run audit`: executa a auditoria Lighthouse do build local.

## Estrutura

```text
public/          imagens, favicon e service worker
scripts/         auditoria Lighthouse
src/
  components/    componentes compartilhados
  data/          catálogo dos NFTs
  mocks/         API, persistência e eventos simulados
  pages/         páginas e fluxos da aplicação
tests/           testes funcionais e visuais
```

O mapa técnico detalhado está em [architecture.md](architecture.md).

## Dados e cenários de teste

O estado fica no `localStorage`. `POST /api/reset` restaura contas, carrinho, favoritos, pedidos e cenário. Para simular falhas, defina `localStorage.setItem('kurio-scenario', '<nome>')` no console e recarregue.

Cenários disponíveis: `empty`, `slow`, `offline`, `server-error`, `session-expired`, `declined`, `pending` e `order-timeout`. Os cupons `KURIO10` e `EXPIRED` testam desconto e expiração; os demais são inválidos.

## Deploy

O projeto está configurado para a Vercel em `vercel.json`. O build usa `npm run build`, publica `dist` e redireciona as rotas da SPA para `index.html`.
