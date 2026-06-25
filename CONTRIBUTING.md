# Contribuir a FriendIA

Gracias por ayudar a construir FriendIA. La idea es trabajar con un flujo simple, claro y revisable.

## Flujo de ramas

1. Actualiza `main`.
2. Crea una rama desde `main`.
3. Haz cambios pequenos y enfocados.
4. Corre verificaciones locales.
5. Abre Pull Request hacia `main`.

Ejemplos:

```powershell
git checkout main
git pull
git checkout -b feature/supabase-auth
```

## Commits

Usamos mensajes claros, idealmente estilo Conventional Commits:

- `feat: conecta autenticacion con supabase`
- `fix: corrige carga del logo en vite`
- `chore: agrega plantilla de pull request`
- `docs: actualiza guia de instalacion`

## Verificaciones antes de PR

```powershell
pnpm run typecheck
pnpm run build
```

## Reglas importantes

- No subir secretos ni archivos `.env`.
- Mantener los cambios relacionados con una sola tarea por PR.
- Explicar en el PR que se cambio, como se probo y si falta algo.
- Pedir revision antes de mezclar a `main`.
