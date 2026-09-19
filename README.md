# Grehem Browser

Fundação Electron + Chromium do Grehem Browser, com dados locais e pesquisa configurável.

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

O SQLite é criado automaticamente em `app.getPath('userData')/grehem.sqlite`. A migration `001_initial` cria o perfil local, configurações, histórico, favoritos, pastas e mecanismos de pesquisa. Os dados não são gravados no código-fonte.

A Fase 2A adiciona apenas a fundação de dados e IPC. As interfaces completas de histórico, favoritos e configurações permanecem para etapas posteriores.
