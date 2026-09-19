# Grehem Browser

Grehem é um navegador desktop Electron + Chromium da Sazam Tecnologia. Esta branch mantém navegação web real, abas, SQLite local, histórico, favoritos e pesquisa configurável.

## Desenvolvimento e validação local

```bash
npm install
npm run typecheck
npm test
npm run build
npm run package:win
```

A validação desses comandos e a execução manual do Electron devem ser feitas localmente. O banco é criado em `app.getPath('userData')/grehem.sqlite`; o `postinstall` recompila dependências nativas para o Electron via `electron-builder install-app-deps`.

Funcionalidades avançadas como downloads persistentes, perfis com troca de sessão, modo privado, permissões por site, internacionalização completa e diagnósticos permanecem etapas de desenvolvimento posteriores e não são apresentadas como implementadas nesta base.
