import { supabase } from "./supabase";
import type { UserProfile } from "./types";
import type { SurveyData } from "@/app/components/Survey";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface ProfileDefaults {
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}

export interface PersonalDetails {
  nombre: string;
  apellido_pat: string;
  apellido_mat: string;
}

export interface PersonalDetailsSaveResult {
  profile: UserProfile;
  updated: boolean;
}

export interface ProfileUpdates {
  nombre?: string | null;
  apellido_pat?: string | null;
  apellido_mat?: string | null;
  genero?: string | null;
  tono_preferido?: string | null;
  seguimiento_ciclo_activo?: boolean;
  preocupaciones?: string[];
  url_avatar?: string | null;
}

function getDefaultName(defaults: ProfileDefaults): string | null {
  const fullName = defaults.fullName?.trim();
  if (fullName) return fullName;

  const emailName = defaults.email?.split("@")[0]?.trim();
  return emailName || null;
}

function getDefaultAvatar(defaults: ProfileDefaults): string | null {
  const avatarUrl = defaults.avatarUrl?.trim();
  return avatarUrl || null;
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
  const googleAvatar = getDefaultAvatar(defaults);

  if (existing) {
    // Importamos la foto de Google sólo si el usuario aún no eligió una
    // propia desde su perfil.
    if (!existing.url_avatar?.trim() && googleAvatar) {
      const { data, error } = await supabase
        .schema("Group_By")
        .from("perfiles")
        .update({
          url_avatar: googleAvatar,
          actualizado_en: new Date().toISOString(),
        })
        .eq("usuario_autenticacion_id", userId)
        .select()
        .single();

      if (error) throw error;
      return mapProfile(data);
    }

    return existing;
  }

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
      url_avatar: googleAvatar,
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

function hasCompletePersonalDetails(profile: UserProfile) {
  return Boolean(
    profile.nombre?.trim() &&
      profile.apellido_pat?.trim() &&
      profile.apellido_mat?.trim()
  );
}

/**
 * Conserva los datos capturados antes de una redirección OAuth. Un perfil que
 * ya tiene nombre y apellidos no se reemplaza, para no modificar cuentas
 * existentes que sólo están agregando otro método de acceso.
 */
export async function savePersonalDetails(
  userId: string,
  details: PersonalDetails
): Promise<PersonalDetailsSaveResult> {
  const payload = {
    nombre: details.nombre.trim(),
    apellido_pat: details.apellido_pat.trim(),
    apellido_mat: details.apellido_mat.trim(),
    actualizado_en: new Date().toISOString(),
  };

  if (!payload.nombre || !payload.apellido_pat || !payload.apellido_mat) {
    throw new Error("El nombre y los dos apellidos son obligatorios");
  }

  const existing = await fetchProfile(userId);

  if (existing && hasCompletePersonalDetails(existing)) {
    return { profile: existing, updated: false };
  }

  if (existing) {
    const { data, error } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .update(payload)
      .eq("usuario_autenticacion_id", userId)
      .select()
      .single();

    if (error) throw error;
    return { profile: mapProfile(data), updated: true };
  }

  const { data, error } = await supabase
    .schema("Group_By")
    .from("perfiles")
    .insert({
      id_perfil: userId,
      usuario_autenticacion_id: userId,
      ...payload,
      genero: null,
      tono_preferido: null,
      seguimiento_ciclo_activo: false,
      preocupaciones: [],
      url_avatar: null,
    })
    .select()
    .single();

  if (error) {
    // AuthContext puede crear el perfil al mismo tiempo que termina OAuth.
    // Si ganó esa carrera, actualizamos la fila recién creada.
    if (error.code === "23505") {
      const { data: racedData, error: racedError } = await supabase
        .schema("Group_By")
        .from("perfiles")
        .update(payload)
        .eq("usuario_autenticacion_id", userId)
        .select()
        .single();

      if (racedError) throw racedError;
      return { profile: mapProfile(racedData), updated: true };
    }

    throw error;
  }

  return { profile: mapProfile(data), updated: true };
}

export async function fetchProfileDisability(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay una sesión activa");

  const response = await fetch(`${API_URL}/api/perfiles/discapacidad`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "No se pudo cargar la discapacidad");
  }

  return typeof result.disability === "string" ? result.disability : "";
}

export async function saveProfileDisability(disability: string): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) throw new Error("No hay una sesión activa");

  const response = await fetch(`${API_URL}/api/perfiles/discapacidad`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ disability }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "No se pudo guardar la discapacidad");
  }

  return typeof result.disability === "string" ? result.disability : "";
}

// Lógica blindada: Primero actualiza; si no hay fila previa, inserta
export async function saveSurveyProfile(
  userId: string,
  survey: SurveyData
): Promise<UserProfile> {
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
  const { data: updateData, error: updateError } = await supabase
    .schema("Group_By")
    .from("perfiles")
    .update(payload)
    .eq("usuario_autenticacion_id", userId)
    .select()
    .maybeSingle();

  if (updateError) throw updateError;

  let savedProfile: UserProfile;

  // 2. Si se actualizó correctamente, conservamos el resultado
  if (updateData) {
    savedProfile = mapProfile(updateData);
  } else {
    // 3. Si no existía nada, hacemos el insert con la llave primaria explícita
    const { data: insertData, error: insertError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .insert({
        id_perfil: userId,
        ...payload,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    savedProfile = mapProfile(insertData);
  }

  await saveProfileDisability(survey.disability);
  return savedProfile;
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdates
): Promise<UserProfile> {
  const normalizedUpdates: ProfileUpdates = {};

  for (const field of [
    "nombre",
    "apellido_pat",
    "apellido_mat",
    "genero",
    "tono_preferido",
    "url_avatar",
  ] as const) {
    if (field in updates) {
      const value = updates[field];
      normalizedUpdates[field] =
        typeof value === "string" ? value.trim() || null : value;
    }
  }

  if ("seguimiento_ciclo_activo" in updates) {
    normalizedUpdates.seguimiento_ciclo_activo = Boolean(
      updates.seguimiento_ciclo_activo
    );
  }

  if ("preocupaciones" in updates) {
    normalizedUpdates.preocupaciones = Array.from(
      new Set(
        (updates.preocupaciones ?? [])
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

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
