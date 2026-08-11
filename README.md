# FriendIA

FriendIA es una aplicación web de acompañamiento y bienestar emocional. Incluye
autenticación, encuesta inicial, check-in emocional, diario, estadísticas,
perfil, configuración y un chat personalizado con Gemini.

FriendIA no diagnostica ni reemplaza la atención psicológica profesional.

## Estado actual

| Área | Estado |
|---|---|
| Autenticación con Supabase | Implementada |
| Perfil y encuesta inicial | Implementados |
| Diario y check-ins | Implementados |
| Dashboard con datos reales | Implementado |
| Chat con Gemini | Implementado; requiere backend y API key |
| Historial y memorias del chat | Implementados; requieren migraciones 008 y 009 |
| Lista de espera móvil | Implementada; requiere migración 010 |
| Pruebas automatizadas | Verificación inicial de salud del backend |
| App móvil | Pendiente |
| Notificaciones push | Pendientes |

## Requisitos

- Node.js 24
- pnpm 11.2.2
- Un proyecto de Supabase
- Una API key de Gemini

## Configuración local

1. Instala las dependencias:

   ```bash
   pnpm install
   npm --prefix backend install
   ```

2. Configura el frontend en `.env`:

   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_anon_key
   VITE_API_URL=http://localhost:3000
   ```

3. Copia `backend/.env.example` como `backend/.env` y completa sus secretos.
   Nunca uses el prefijo `VITE_` para `GEMINI_API_KEY` o la service role key.

4. Ejecuta las migraciones de `supabase/migrations` en orden numérico. Para el
   chat, la lista móvil y la limpieza de instalaciones anteriores son
   especialmente necesarias:

   - `008_chat_history_schema.sql`
   - `009_chat_memories.sql`
   - `010_mobile_waitlist.sql`
   - `012_cleanup_deprecated_profile_data.sql`

5. Inicia toda la aplicación desde la raíz:

   ```bash
   npm run dev
   ```

   Este comando inicia tanto Vite como el backend. El frontend queda
   normalmente en `http://localhost:5173` y la API en
   `http://localhost:3000`. Puedes comprobarla en `/api/health`.

## Comandos

```bash
npm run dev             # frontend y backend
npm run dev:frontend    # solo Vite
npm run dev:backend     # solo API
npm run typecheck       # valida TypeScript
npm run build           # genera el frontend de producción
npm run check           # tipos, build y pruebas del backend
```

## Configuración de producción

- Define `VITE_API_URL` con la URL HTTPS pública del backend.
- Define `ALLOWED_ORIGINS` en el backend con los orígenes permitidos separados
  por comas.
- Mantén `SUPABASE_SERVICE_ROLE_KEY` y `GEMINI_API_KEY` solo en el servidor.
- Ajusta `CHAT_RATE_LIMIT` si el límite predeterminado de 20 solicitudes por
  minuto no es adecuado.
- Ejecuta `npm run check` antes de desplegar.

## Arquitectura móvil recomendada

La futura aplicación móvil puede reutilizar el mismo proyecto Supabase y la
misma API. Expo con React Native permite conservar TypeScript y buena parte de
la lógica de `src/lib`, pero las pantallas web deberán adaptarse a componentes
nativos.
