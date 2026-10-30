# Arquitetura

O Kurio é uma SPA React. A interface consome uma API REST simulada pelo MSW no próprio navegador; não existe backend nem pagamento real.

## Pastas

- `src/pages`: telas associadas às rotas da aplicação.
- `src/components`: elementos reutilizados por mais de uma tela.
- `src/components/ui`: componentes visuais básicos.
- `src/data`: catálogo estático usado pela API simulada.
- `src/mocks`: estado local, endpoints REST e eventos em tempo real simulados.
- `public`: imagens e arquivos copiados diretamente para o build.
- `tests`: testes funcionais, de acessibilidade, responsividade e regressão visual.
- `scripts`: automações auxiliares, atualmente a auditoria Lighthouse.

## Arquivos centrais

- `src/main.tsx`: inicializa React, MSW, Query Client e o roteador.
- `src/routes.tsx`: relaciona URLs às páginas.
- `src/api.ts`: cliente HTTP e funções de acesso à API.
- `src/contracts.ts`: tipos compartilhados entre interface e API simulada.
- `src/style.css`: estilos desktop, mobile e estados visuais.
- `vercel.json`: configura build, instalação e fallback das rotas na Vercel.

## Fluxo dos dados

As páginas chamam `src/api.ts` por meio do TanStack Query. O Axios envia as requisições, o MSW intercepta em `src/mocks/handlers.ts` e o estado é persistido no `localStorage` por `src/mocks/store.ts`. Alterações de catálogo e pedidos também podem emitir eventos simulados definidos em `src/mocks/events.ts`.
