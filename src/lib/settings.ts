import { supabase } from "./supabase";
import { getProfileId } from "./profiles";
import type { UserSettings } from "./types";

const LOCAL_KEY = "friendia_settings";

export const DEFAULT_SETTINGS: Omit<UserSettings, "id_configuracion_usuario" | "id_perfil" | "actualizado_en"> = {
  modo_oscuro: false,
  tamano_fuente: 14,
  registro_diario_activo: true,
  hora_registro: "20:00",
  guardar_historial_chat: true,
  idioma: "es",
};

function cacheSettings(settings: UserSettings): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
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
    cacheSettings(data);
    return data;
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
  cacheSettings(created);
  return created;
}

export async function saveSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, "id_configuracion_usuario" | "id_perfil" | "actualizado_en">>
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
  cacheSettings(data);
  return data;
}

export async function deleteChatHistory(userId: string): Promise<void> {
  const profileId = await getProfileId(userId);
  if (!profileId) return;

  const { data: sessions, error: sessionsError } = await supabase
    .from("sesiones_chat")
    .select("id_sesion_chat")
    .eq("id_perfil", profileId);

  if (sessionsError) throw sessionsError;

  const sessionIds = (sessions ?? []).map((session: { id_sesion_chat: string }) => session.id_sesion_chat);
  if (sessionIds.length === 0) return;

  const { error } = await supabase
    .from("mensajes_chat")
    .delete()
    .in("id_sesion_chat", sessionIds);

  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc("delete_own_account");
  if (error) throw error;
}
