# Grehem Browser

Electron + Chromium do Grehem Browser, com banco SQLite local, pesquisa configurável, histórico e favoritos persistentes.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificação local pendente

```bash
npm run typecheck
npm test
npm run build
```

Esta revisão endurece a navegação para aceitar somente `http`, `https` e `grehem`, valida associação de perfil em favoritos/pastas/mecanismos, evita duplicações consecutivas de histórico e prepara o rebuild de `better-sqlite3` pelo `electron-builder`. Os comandos acima ainda precisam ser executados em um ambiente local compatível com Electron 33.
