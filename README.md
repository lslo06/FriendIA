# FriendIA

FriendIA es una app web de bienestar emocional con IA. La interfaz ya incluye autenticacion, encuesta inicial, dashboard, chat, diario, perfil y configuracion; el siguiente bloque de trabajo es conectar estas pantallas con Supabase y las funciones de IA.

## Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Supabase
- pnpm

## Requisitos

- Node.js 24.14.0 recomendado
- pnpm 11.x
- Una cuenta/proyecto de Supabase para variables de entorno

## Instalacion

```powershell
pnpm install
```

Copia el archivo de variables de entorno:

```powershell
Copy-Item .env.example .env.local
```

Completa `.env.local`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Desarrollo

```powershell
pnpm run dev
```

Validar TypeScript:

```powershell
pnpm run typecheck
```

Crear build de produccion:

```powershell
pnpm run build
```

Previsualizar build:

```powershell
pnpm run preview
```

## Flujo de trabajo recomendado

- `main` debe mantenerse estable.
- Cada cambio se trabaja en una rama: `feature/nombre-corto`, `fix/nombre-corto` o `chore/nombre-corto`.
- Los cambios entran por Pull Request.
- Antes de abrir PR, correr `pnpm run typecheck` y `pnpm run build`.
- No subir `.env`, `.env.local`, claves de Supabase ni llaves de APIs.

## Proximas prioridades

1. Autenticacion real con Supabase Auth.
2. Guardar encuesta inicial en `perfiles`.
3. Chat real mediante Supabase Edge Function.
4. Diario emocional persistente.
5. Dashboard con estadisticas reales.
