# Grehem Browser

Grehem é um navegador desktop Electron + Chromium da Sazam Tecnologia, com navegação real, SQLite local, histórico, favoritos e pesquisa configurável.

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

O banco é criado em `app.getPath('userData')/grehem.sqlite`. O preload expõe uma API explícita via `contextBridge`, enquanto o conteúdo web permanece sandboxed, sem Node integration. O histórico, favoritos, pastas e mecanismos de pesquisa são persistidos por perfil local.

A validação de instalação, typecheck, testes, build e execução manual do Electron deve ser feita em um ambiente local compatível com Electron 33 e Windows 10/11.
