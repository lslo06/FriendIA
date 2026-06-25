Prompt para Figma AI — FriendIA (Web App + Landing Page)
Design a complete web app UI kit and clickable prototype for a mental wellness platform called "FriendIA". The app helps users identify, express, and process their daily emotions through an AI-powered chatbot companion. Target audience: Spanish-speaking young adults and adults in Mexico. Style: calm, professional, empathetic, and modern. NOT clinical or cold.
The logo is a speech bubble icon with a human face silhouette on the left side and a heartbeat/pulse line on the right. Use it consistently across all screens. The brand name is "FriendIA" — style it as "Friend" in light text + "IA" in accent blue (#5B88B2).
This is a WEB APP (desktop browser), not mobile. All screens must be designed for desktop viewport (1440px wide). After the landing page, the app lives inside a sidebar layout — NOT a bottom navigation bar.

Color Palette — Dark Mode (primary):

Background primary: #121820
Background secondary / surfaces: #1A2332
Text & light surfaces: #E2E8F0
Muted text / subtle elements: #94A3B8
Accent / interactive / CTA: #5B88B2

Color Palette — Light Mode (toggle option):

Background primary: #F4F7FA
Background secondary: #FFFFFF
Text dark: #2C3E50
Muted text: #7F8C8D
Accent / interactive: #5B88B2

Typography: Inter or DM Sans. Headlines: 28–36px bold. Section titles: 20–24px semibold. Body: 15–16px regular. Labels/captions: 12–13px medium. Border radius throughout: 10–16px. Soft, minimal shadows. No harsh borders.

SCREEN 1 — Landing Page (public, desktop, 1440px)
Top navigation bar (sticky): Logo left ("FriendIA"), nav links center (Funcionalidades / Cómo funciona / Para consultorios), CTA buttons right ("Iniciar sesión" ghost + "Comenzar gratis" filled accent).
Hero section: badge pill ("Bienestar emocional · Con IA"), large headline "Tu compañero emocional siempre disponible", subtext explaining the app purpose, two CTA buttons ("Empezar ahora" filled + "Ver demo" outline), and a desktop browser mockup showing the dashboard UI on the right side.
Features section: section label, title "Todo lo que necesitas para tu bienestar", subtitle, 6-card grid (2 rows × 3 columns): Calendario emocional / IA conversacional / Diario emocional / Estadísticas semanales / Ayuda profesional / Privacidad total. Each card: icon, title, description.
How it works section: 3 horizontal steps with icons: "Regístrate y cuéntanos sobre ti" → "Habla con tu Guía emocional cada día" → "Visualiza tu progreso y busca apoyo".
For consultories section: card explaining the B2B angle — clinics and psychologists can use FriendIA as a complementary tool for their patients. CTA: "Contactar para consultorios".
Footer: logo, tagline, links (Privacidad / Términos / Contacto), disclaimer "FriendIA no sustituye la atención psicológica profesional."

SCREEN 2 — Login / Sign Up (desktop, centered card)
Centered auth card on dark background. Logo + app name at top. Title "Bienvenido de vuelta" (login) or "Crea tu cuenta" (sign up). "Continuar con Google" button (full width). Divider "o con correo". Email + password fields. Forgot password link. Primary CTA button. Footer link to switch between login/signup. Both states (login and signup) as separate frames.

SCREEN 3 — Initial Survey (desktop, step-by-step, 6 frames)
After signup only. Centered card layout on dark background with the nav bar visible. Progress bar at top with step counter ("Paso X de 6"). One question per frame. Each frame has: question title (large), hint text (muted, smaller), answer area, "Siguiente" primary button + "Omitir" ghost button + "← Atrás" ghost button.
Frame 1 — Name: text input field. Question: "¿Cómo te gustaría que te llamemos?"
Frame 2 — Gender: 4 option buttons (pill style, one selectable): Mujer / Hombre / No binario o género diverso / Prefiero no decir. Question: "¿Con qué género te identificas?"
Frame 3 — Disability: 5 option buttons: Visual / Auditiva / Motriz / Ninguna / Prefiero no decir. Question: "¿Tienes alguna discapacidad que debamos considerar?"
Frame 4 — Concerns: multi-select chips (toggleable): Estrés laboral / Relaciones / Ansiedad / Tristeza / Autoestima / Sueño / Identidad / Otro. Question: "¿Cuáles son tus principales preocupaciones?" Hint: "Puedes elegir varias."
Frame 5 — Cycle sensitivity (conditional, shown only if gender = Mujer): 4 option buttons: Sí, frecuentemente / A veces / No mucho / Prefiero no responder. Question: "¿Sueles sentirte más sensible emocionalmente en ciertos momentos del mes?" Include a soft note card below: "Esta información es completamente privada y nos ayuda a personalizar tu experiencia." with a lock icon.
Frame 6 — Chatbot tone: 3 option cards with emoji + label + short description: Cálido y amistoso 🤗 "Como hablar con un amigo cercano" / Calmado y neutro 🧘 "Reflexivo y sin juicios" / Motivador 💪 "Te impulsa a seguir adelante". Question: "¿Con qué tono prefieres que tu Guía te hable?" Note: "Puedes cambiarlo después en Configuración."

POST-LOGIN LAYOUT — Sidebar + Main Content (all app screens)
Fixed left sidebar (220px wide, dark surface #1A2332): Logo + app name at top. Navigation links with icons: Inicio / Diario / Hablar con IA / Ayuda. Spacer. Bottom links: Perfil / Configuración / Cerrar sesión. Active state: accent color background pill + accent text. Inactive: muted text. The sidebar is persistent across all app screens below.

SCREEN 4 — Home / Dashboard (desktop, sidebar layout)
Top of content area: greeting "Hola, [Nombre] 👋" + today's date subtitle.
Stats row (3 metric cards): Días activos / Entradas en diario / Racha actual. Numbers in accent or semantic colors.
Two-column card grid: Left card "Estado de hoy" — large emoji + mood label + muted prompt "¿Cómo te sientes ahora?". Right card "Tu semana emocional" — 7 circles for each day of the week, color-coded: green (😊 bien) / yellow (😐 neutral) / red (😔 difícil) / empty for future days.
Full-width card "Entradas recientes del diario": 2–3 diary entry rows, each with: short text preview, date, and emotion tag pill (e.g. "Estrés", "Bienestar", "Ansiedad").
Large CTA button at bottom: "💬 Hablar con mi Guía emocional" in accent color, full width, rounded, with chatbot icon.

SCREEN 5 — AI Chat (desktop, sidebar layout)
Header: bot avatar (small logo icon) + "Tu Guía Emocional" + "Disponible" status dot.
Chat area: scrollable conversation view. Bot messages: left-aligned, soft accent background bubble, rounded corners with flat top-left. User messages: right-aligned, accent color solid bubble. Bot's first message pre-loaded: "Hola [Nombre], me alegra que estés aquí. ¿Cómo te has sentido hoy? 💙". Show a realistic 3-message conversation as example state.
Bottom bar: text input ("Escribe cómo te sientes...") + send button (icon).
Below chat area: subtle warning card "Si estás en crisis, contacta ayuda profesional aquí." with red-tinted border and link.
Session timer visible in header: "Sesión de hoy: 8 min".

SCREEN 6 — Emotional Diary (desktop, sidebar layout)
Header with title "Mi Diario Emocional" + "Nueva entrada +" button (accent, top right).
Filter tab row: Todos / Esta semana / Este mes (underline active style).
List of diary entry cards, each showing: date + time, short text preview (2 lines), emotion tag pill, chevron right icon. Alternate between different emotion tags and dates. Show 4–5 entries.
Empty state design (separate frame): illustration or icon, "Aún no tienes entradas. ¿Cómo estuvo tu día hoy?", CTA button "Escribir primera entrada".

SCREEN 7 — Help / Ayuda (desktop, sidebar layout)
Header: "Ayuda y apoyo".
Emergency card (red-tinted border, #E24B4A accent): title "Líneas de crisis" with alert icon, short text, two buttons: "📞 SAPTEL: 55 5259-8121" and "📞 CONASAMA: 800-290-0024".
Section title "Psicólogos disponibles". 3 professional cards, each: avatar circle with initials, name, specialty tags, "Contactar" button (accent filled). Professionals are placeholders.
Disclaimer card at bottom: muted text "FriendIA no sustituye la atención psicológica profesional. Ante cualquier emergencia, busca apoyo."

SCREEN 8 — Profile (desktop, sidebar layout)
Top profile card: avatar circle with initial, name, email, "Cuenta activa desde [mes año]" label in accent.
Stats row (same as dashboard): Días activos / Entradas / Racha.
Editable fields section "Mis datos": Nombre preferido + Correo + "Guardar cambios" button.
"Exportar reporte PDF semanal" button (outline style, full width).

SCREEN 9 — Settings / Configuración (desktop, sidebar layout)
Grouped setting sections, each with a muted uppercase label:
Apariencia: "Modo oscuro" toggle (on) / "Tamaño de texto" selector dropdown.
Notificaciones: "Check-in diario" toggle / "Hora del recordatorio" time picker.
Privacidad: "Guardar historial de chat" toggle / "Borrar todo mi historial" row (red label, destructive, with chevron).
Cuenta: "Cerrar sesión" row / "Eliminar cuenta" row (red text, smallest, at bottom).
Each setting row: label left, control right, separated by very subtle border.

SCREEN 10 — Emergency Modal (overlay, appears over any screen)
Semi-transparent dark overlay. Centered modal card: soft blue icon at top, title "Parece que estás pasando por algo difícil 💙", subtitle "Estamos aquí contigo. Estas opciones pueden ayudarte ahora mismo.", two primary buttons stacked: "Hablar con un psicólogo" / "Ver líneas de crisis", ghost link "Volver al chat". Border: subtle blue-tinted.

Component Library (separate page in Figma):

Buttons: primary filled / ghost / outline / danger / disabled states. Input fields: default / focus / error states. Cards: standard / highlighted / emergency variants. Chips: unselected / selected. Toggle switches: on / off. Sidebar nav items: active / inactive / hover. Emotion dots: green / yellow / red / empty. Diary entry row component. Psychologist card component. Chat bubble: bot / user variants. Modal overlay. Progress bar variants (survey).
Design tokens page: all colors (dark + light mode), typography scale, spacing scale, border radius values, shadow styles.
Prototype connections: Landing → Login → Survey step 1–6 → Dashboard. Sidebar links connect all app screens. Emergency modal triggers from chat screen.