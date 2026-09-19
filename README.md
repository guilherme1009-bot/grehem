# Grehem Browser

Base da Fase 1: um navegador desktop Electron + Chromium com navegação real, múltiplas abas e uma interface clara.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Verificações

```bash
npm run typecheck
npm test
npm run build
```

A criação do instalador Windows fica disponível com `npm run package:win`.

## Arquitetura inicial

- `src/main`: processo principal, janelas e gerenciamento seguro de abas Chromium.
- `src/preload`: ponte IPC mínima e validada.
- `src/renderer`: interface React da barra de navegação e nova aba.
- `src/shared`: contratos compartilhados entre os processos.
