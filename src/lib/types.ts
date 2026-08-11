export interface UserProfile {
  id_perfil: string;
  usuario_autenticacion_id: string;
  nombre: string | null;
  apellido_pat: string | null;
  apellido_mat: string | null;
  genero: string | null;
  tono_preferido: string | null;
  preocupaciones: string[];
  url_avatar: string | null;
  creado_en: string;
  actualizado_en: string;
  survey_completed?: boolean;
}

export interface DiaryEntry {
  id: string;
  user_id: string;
  text: string;
  mood: string | null;
  mood_score: number | null;
  tag: string | null;
  created_at: string;
}

export interface EmotionRecord {
  id: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  primary_emotion: string;
  emotions: string[];
  notes: string | null;
  created_at: string;
}

export interface UserSettings {
  id_configuracion_usuario: string;
  id_perfil: string;
  modo_oscuro: boolean;
  tamano_fuente: number;
  registro_diario_activo: boolean;
  hora_registro: string | null;
  guardar_historial_chat: boolean;
  idioma: string;
  actualizado_en: string;
}

export interface DiaryStats {
  activeDays: number;
  totalEntries: number;
  currentStreak: number;
}

export interface WeekDayMood {
  label: string;
  color: string | null;
  emotion: string | null;
}
