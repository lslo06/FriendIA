# FriendIA — Guía para agregar funcionalidades con ChatGPT Codex

Este proyecto es la interfaz visual completa de **FriendIA**, una app web de bienestar emocional con IA. El diseño y la estructura ya están listos. Esta guía te explica qué funcionalidades faltan y cómo pedírselas a ChatGPT Codex.

---

## ¿Qué ya está listo?

| Pantalla | Estado |
|---|---|
| Landing page | ✅ Completo |
| Login / Registro | ✅ UI lista (sin backend) |
| Encuesta inicial (6 pasos) | ✅ Completo |
| Dashboard | ✅ Con datos de ejemplo |
| Chat con IA | ✅ UI lista (respuestas estáticas) |
| Diario emocional | ✅ UI lista (datos de ejemplo) |
| Ayuda / Líneas de crisis | ✅ Completo |
| Perfil | ✅ UI lista (sin guardar) |
| Configuración | ✅ UI lista (sin guardar) |
| Modal de emergencia | ✅ Completo |

---

## Funcionalidades que necesitas agregar con Codex

### 1. Autenticación real (Supabase Auth)

**Prompt para Codex:**
> "Integra Supabase Auth en el archivo `src/app/components/Auth.tsx`. El componente ya tiene el formulario de login y registro con email/password. Conecta el botón de 'Continuar con Google' usando `supabase.auth.signInWithOAuth({ provider: 'google' })` y el formulario de email usando `supabase.auth.signInWithPassword()` y `supabase.auth.signUp()`. Si el login es exitoso llama a `onSuccess(user.user_metadata.full_name)`. Usa el cliente de Supabase de `src/lib/supabase.ts`."

---

### 2. Guardar entradas del diario en base de datos

**Prompt para Codex:**
> "En `src/app/components/Diary.tsx`, conecta el formulario de nueva entrada a Supabase. Crea una tabla `diary_entries` con columnas: `id (uuid)`, `user_id (uuid)`, `text (text)`, `mood (text)`, `tag (text)`, `created_at (timestamp)`. Al guardar una entrada nueva, inserta en Supabase con `supabase.from('diary_entries').insert(...)`. Al cargar el componente, obtén las entradas del usuario actual con `supabase.from('diary_entries').select('*').eq('user_id', userId).order('created_at', { ascending: false })`."

---

### 3. Chat con IA real (API de OpenAI o Claude)

**Prompt para Codex:**
> "En `src/app/components/Chat.tsx`, reemplaza la respuesta estática del bot con una llamada real a la API de Anthropic. Cuando el usuario envíe un mensaje, llama al endpoint `/api/chat` (créalo como Supabase Edge Function). La Edge Function debe enviar el historial de mensajes al modelo `claude-haiku-4-5-20251001` con el siguiente system prompt: 'Eres una guía emocional empática llamada FriendIA. Respondes en español de México, con tono cálido y sin juicios. No eres terapeuta, pero acompañas emocionalmente al usuario. Si detectas señales de crisis, recomienda buscar ayuda profesional.' Devuelve la respuesta como JSON `{ reply: string }`."

---

### 4. Guardar respuestas de la encuesta inicial

**Prompt para Codex:**
> "En `src/app/App.tsx`, cuando se llama a `handleSurveyComplete(data)`, guarda los datos del survey en Supabase en una tabla llamada `user_profiles` con columnas: `user_id`, `preferred_name`, `gender`, `disability`, `concerns (text[])`, `cycle_sensitive`, `tone`. Verifica si ya existe un perfil y usa upsert. Luego carga este perfil al iniciar sesión para personalizar la experiencia."

---

### 5. Estadísticas reales en el Dashboard

**Prompt para Codex:**
> "En `src/app/components/Dashboard.tsx`, reemplaza los datos hardcodeados de estadísticas con consultas reales a Supabase. `Días activos` = contar días únicos en `diary_entries` para el usuario. `Entradas en diario` = count de registros en `diary_entries`. `Racha actual` = calcular días consecutivos de actividad. `Semana emocional` = obtener las entradas de los últimos 7 días y mapear el mood a color. Ejecuta estas consultas al montar el componente."

---

### 6. Perfil editable con persistencia

**Prompt para Codex:**
> "En `src/app/components/Profile.tsx`, conecta el botón 'Guardar cambios' a Supabase. Actualiza `preferred_name` y `email` en la tabla `user_profiles`. Para el email, usa `supabase.auth.updateUser({ email: newEmail })`. Muestra un toast de éxito usando la librería `sonner` (ya instalada): `import { toast } from 'sonner'` y luego `toast.success('Cambios guardados')`. Para el botón de exportar PDF, genera un reporte de las entradas del mes usando la librería `jspdf`."

---

### 7. Configuración con persistencia

**Prompt para Codex:**
> "En `src/app/components/AppSettings.tsx`, guarda los cambios de configuración en `localStorage` y también en la tabla `user_settings` de Supabase. Al montar el componente, carga la configuración guardada. El toggle de 'Modo oscuro' ya no necesita funcionalidad (el diseño es dark-only por ahora). El toggle 'Guardar historial de chat' debe controlar si los mensajes del chat se persisten en la BD. El botón 'Borrar todo mi historial' debe eliminar todos los registros en `chat_messages` del usuario con confirmación."

---

### 8. Notificaciones push (check-in diario)

**Prompt para Codex:**
> "Implementa notificaciones push para el check-in diario. Usa la Web Push API del navegador. Crea una Supabase Edge Function que se ejecute diariamente a la hora configurada por el usuario (guardada en `user_settings.reminder_time`). La notificación debe decir: '¡Hola [nombre]! ¿Cómo te sientes hoy? Tómate un momento para ti. 💙'. Guarda los tokens de push en la tabla `push_subscriptions`."

---

## Estructura de archivos importante

```
src/
├── app/
│   ├── App.tsx              ← Navegación principal y estado global
│   └── components/
│       ├── Landing.tsx      ← Página pública
│       ├── Auth.tsx         ← Login / Registro
│       ├── Survey.tsx       ← Encuesta inicial (6 pasos)
│       ├── Sidebar.tsx      ← Navegación lateral del app
│       ├── Dashboard.tsx    ← Pantalla de inicio
│       ├── Chat.tsx         ← Chat con IA
│       ├── Diary.tsx        ← Diario emocional
│       ├── Help.tsx         ← Ayuda y psicólogos
│       ├── Profile.tsx      ← Perfil del usuario
│       ├── AppSettings.tsx  ← Configuración
│       ├── EmergencyModal.tsx ← Modal de crisis
│       └── Logo.tsx         ← Logo reutilizable
├── styles/
│   ├── theme.css            ← Colores y tokens del diseño
│   └── fonts.css            ← DM Sans desde Google Fonts
```

---

## Paleta de colores (para referencia en Codex)

| Token | Valor | Uso |
|---|---|---|
| Background | `#121820` | Fondo principal |
| Surface | `#1A2332` | Cards y sidebar |
| Accent | `#5B88B2` | CTAs, links, activo |
| Text | `#E2E8F0` | Texto principal |
| Muted | `#94A3B8` | Texto secundario |
| Success | `#4CD964` | Estado "bien" |
| Warning | `#F5A623` | Estado "neutral" |
| Danger | `#E24B4A` | Emergencias |

---

## Dependencias ya instaladas (no reinstalar)

- `react`, `react-dom` — Framework base
- `lucide-react` — Iconos
- `tailwindcss` v4 — Estilos
- `sonner` — Toasts/notificaciones
- `recharts` — Gráficas (para estadísticas)
- `react-hook-form` — Formularios
- `motion` — Animaciones

---

## Próximos pasos recomendados

1. **Conecta Supabase** (auth + base de datos) — empieza por aquí
2. **Integra la API de Claude** para el chat (prioridad alta, es el core del producto)
3. **Guarda el diario** en la base de datos
4. **Agrega estadísticas reales** al dashboard
5. **Deploy** en Vercel o similar

---

> 💡 **Tip para Codex:** Al dar cada prompt, incluye el archivo completo que debe modificar junto con el contexto de arriba. Codex funciona mejor cuando le das el código existente + la instrucción específica de qué cambiar.
