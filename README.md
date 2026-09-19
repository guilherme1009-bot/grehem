# Grehem Browser

Electron + Chromium do Grehem Browser, com banco SQLite local, pesquisa configurável, histórico e favoritos persistentes.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificação local

```bash
npm run typecheck
npm test
npm run build
```

A Fase 2B conecta a fundação SQLite/IPC à interface: o usuário pode pesquisar usando o mecanismo padrão, consultar e limpar histórico, adicionar/remover favoritos e alterar configurações básicas. A validação desses comandos permanece pendente no ambiente local.
