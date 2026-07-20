import { supabase } from "./supabase";
import type { UserProfile } from "./types";
import type { SurveyData } from "@/app/components/Survey";

interface ProfileDefaults {
  email?: string | null;
  fullName?: string | null;
}

function getDefaultName(defaults: ProfileDefaults): string | null {
  const fullName = defaults.fullName?.trim();
  if (fullName) return fullName;

  const emailName = defaults.email?.split("@")[0]?.trim();
  return emailName || null;
}

function mapProfile(data: any): UserProfile {
  return {
    ...data,
    survey_completed: Boolean(data.tono_preferido),
  };
}

// Simplificamos las consultas eliminando el .or() en las vistas
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .schema("Group_By")
    .from("perfiles")
    .select("*")
    .eq("usuario_autenticacion_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapProfile(data) : null;
}

export async function ensureProfile(
  userId: string,
  defaults: ProfileDefaults = {}
): Promise<UserProfile> {
  const existing = await fetchProfile(userId);
  if (existing) return existing;

  const { data, error } = await supabase
    .schema("Group_By")
    .from("perfiles")
    .insert({
      id_perfil: userId,
      usuario_autenticacion_id: userId,
      nombre: getDefaultName(defaults),
      apellido_pat: null,
      apellido_mat: null,
      genero: null,
      tono_preferido: null,
      seguimiento_ciclo_activo: false,
      preocupaciones: [],
      url_avatar: null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
    }
    throw error;
  }

  return mapProfile(data);
}

// Lógica blindada: Primero actualiza; si no hay fila previa, inserta
export async function saveSurveyProfile(userId: string, survey: SurveyData): Promise<UserProfile> {
  const payload = {
    usuario_autenticacion_id: userId,
    nombre: survey.name.trim() || null,
    apellido_pat: survey.apellido_pat.trim(),
    apellido_mat: survey.apellido_mat.trim(),
    genero: survey.gender || null,
    tono_preferido: survey.tone || null,
    seguimiento_ciclo_activo:
      survey.cycleSensitive === "Sí, frecuentemente" || survey.cycleSensitive === "A veces",
    preocupaciones: survey.concerns ?? [],
    actualizado_en: new Date().toISOString(),
  };

  // 1. Intentamos actualizar primero el perfil existente
  const { data: updateData } = await supabase
    .schema("Group_By")
    .from("perfiles")
    .update(payload)
    .eq("usuario_autenticacion_id", userId)
    .select()
    .maybeSingle();

  // 2. Si se actualizó correctamente, lo devolvemos de inmediato
  if (updateData) {
    return mapProfile(updateData);
  }

  // 3. Si no existía nada, hacemos el insert inyectando la llave primaria explícita
  const { data: insertData, error: insertError } = await supabase
   .schema("Group_By")
    .from("perfiles")
    .insert({
      id_perfil: userId,
      ...payload
    })
    .select()
    .single();

  if (insertError) throw insertError;
  return mapProfile(insertData);
}

export async function updateProfile(
  userId: string,
  updates: { preferred_name?: string | null }
): Promise<UserProfile> {
  const normalizedUpdates = {
    nombre:
      typeof updates.preferred_name === "string"
        ? updates.preferred_name.trim() || null
        : updates.preferred_name,
  };

  const { data, error } = await supabase
   .schema("Group_By")
    .from("perfiles")
    .update({ ...normalizedUpdates, actualizado_en: new Date().toISOString() })
    .eq("usuario_autenticacion_id", userId)
    .select()
    .single();

  if (error) throw error;
  return mapProfile(data);
}

export async function getProfileId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
   .schema("Group_By")
    .from("perfiles")
    .select("id_perfil")
    .eq("usuario_autenticacion_id", userId)
    .maybeSingle();

  if (error) throw error;
  return data?.id_perfil ?? null;
}

export function getDisplayName(profile: UserProfile | null, email?: string | null): string {
  if (profile?.nombre?.trim()) return profile.nombre.trim();
  if (email) return email.split("@")[0];
  return "Usuario";
}