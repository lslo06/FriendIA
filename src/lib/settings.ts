import { supabase } from "./supabase";
import { getProfileId } from "./profiles";
import type { UserSettings } from "./types";

const LOCAL_KEY_PREFIX = "friendia_settings";

export type SettingsUpdates = Partial<
  Omit<UserSettings, "id_configuracion_usuario" | "id_perfil" | "actualizado_en">
>;

export const DEFAULT_SETTINGS: Omit<UserSettings, "id_configuracion_usuario" | "id_perfil" | "actualizado_en"> = {
  modo_oscuro: false,
  tamano_fuente: 14,
  registro_diario_activo: true,
  hora_registro: "20:00",
  guardar_historial_chat: true,
  idioma: "es",
};

export function normalizeFontSize(value: number): number {
  if (value === 0) return 13;
  if (value === 1) return 14;
  if (value === 2) return 16;
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.tamano_fuente;
  return Math.min(20, Math.max(12, value));
}

function normalizeSettings(settings: UserSettings): UserSettings {
  return {
    ...settings,
    modo_oscuro: Boolean(settings.modo_oscuro),
    tamano_fuente: normalizeFontSize(settings.tamano_fuente),
    registro_diario_activo: Boolean(settings.registro_diario_activo),
    hora_registro: settings.hora_registro?.slice(0, 5) || "20:00",
    guardar_historial_chat: Boolean(settings.guardar_historial_chat),
    idioma: settings.idioma || "es",
  };
}

function cacheSettings(userId: string, settings: UserSettings): void {
  localStorage.setItem(`${LOCAL_KEY_PREFIX}:${userId}`, JSON.stringify(settings));
}

export function applySettings(settings: UserSettings | null): void {
  const darkMode = settings?.modo_oscuro ?? true;
  const fontSize = normalizeFontSize(
    settings?.tamano_fuente ?? DEFAULT_SETTINGS.tamano_fuente
  );
  const fontScale = fontSize / DEFAULT_SETTINGS.tamano_fuente;
  const root = document.documentElement;

  root.dataset.friendiaTheme = darkMode ? "dark" : "light";
  root.classList.toggle("dark", darkMode);
  root.style.colorScheme = darkMode ? "dark" : "light";
  root.style.setProperty("--app-font-scale", fontScale.toFixed(3));
  root.style.setProperty("--font-size", `${16 * fontScale}px`);
}

export async function fetchSettings(userId: string): Promise<UserSettings> {
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const { data, error } = await supabase
    .schema("Group_By")
    .from("configuraciones_usuario")
    .select("*")
    .eq("id_perfil", profileId)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    const settings = normalizeSettings(data as UserSettings);
    cacheSettings(userId, settings);
    return settings;
  }

  const { data: created, error: createError } = await supabase
    .schema("Group_By")
    .from("configuraciones_usuario")
    .insert({
      id_perfil: profileId,
      modo_oscuro: DEFAULT_SETTINGS.modo_oscuro,
      tamano_fuente: DEFAULT_SETTINGS.tamano_fuente,
      registro_diario_activo: DEFAULT_SETTINGS.registro_diario_activo,
      hora_registro: DEFAULT_SETTINGS.hora_registro,
      guardar_historial_chat: DEFAULT_SETTINGS.guardar_historial_chat,
      idioma: DEFAULT_SETTINGS.idioma,
    })
    .select()
    .single();

  if (createError) throw createError;
  const settings = normalizeSettings(created as UserSettings);
  cacheSettings(userId, settings);
  return settings;
}

export async function saveSettings(
  userId: string,
  updates: SettingsUpdates
): Promise<UserSettings> {
  const profileId = await getProfileId(userId);
  if (!profileId) throw new Error("Perfil no encontrado");

  const { data, error } = await supabase
    .schema("Group_By")
    .from("configuraciones_usuario")
    .upsert(
      {
        id_perfil: profileId,
        ...updates,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "id_perfil" }
    )
    .select()
    .single();

  if (error) throw error;
  const settings = normalizeSettings(data as UserSettings);
  cacheSettings(userId, settings);
  return settings;
}

export async function deleteChatHistory(userId: string): Promise<void> {
  const profileId = await getProfileId(userId);
  if (!profileId) return;

  const { data: sessions, error: sessionsError } = await supabase
    .schema("Group_By")
    .from("sesiones_chat")
    .select("id_sesion_chat")
    .eq("id_perfil", profileId);

  if (sessionsError) throw sessionsError;

  const sessionIds = (sessions ?? []).map((session: { id_sesion_chat: string }) => session.id_sesion_chat);
  if (sessionIds.length === 0) return;

  const { error } = await supabase
    .schema("Group_By")
    .from("mensajes_chat")
    .delete()
    .in("id_sesion_chat", sessionIds);

  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;
}
