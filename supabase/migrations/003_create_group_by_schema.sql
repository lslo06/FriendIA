-- FriendIA: Crear schema Group_By y tablas en español
-- Ejecutar en el SQL Editor de Supabase después de 002_complete_onboarding_rls.sql

-- Crear schema si no existe
CREATE SCHEMA IF NOT EXISTS "Group_By";

-- Tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS "Group_By".perfiles (
  id_perfil UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_autenticacion_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  apellido_pat TEXT,
  apellido_mat TEXT,
  genero TEXT,
  tono_preferido TEXT,
  seguimiento_ciclo_activo BOOLEAN DEFAULT FALSE,
  preocupaciones TEXT[] DEFAULT '{}',
  url_avatar TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de entradas del diario
CREATE TABLE IF NOT EXISTS "Group_By".entradas_diario (
  id_entrada_diario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_perfil UUID NOT NULL REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  etiquetas TEXT[] DEFAULT '{}',
  puntuacion_animo TEXT,
  esta_fijado BOOLEAN DEFAULT FALSE,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de configuraciones del usuario
CREATE TABLE IF NOT EXISTS "Group_By".configuraciones_usuario (
  id_configuracion_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_perfil UUID NOT NULL UNIQUE REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  modo_oscuro BOOLEAN DEFAULT TRUE,
  tamano_fuente INTEGER DEFAULT 14,
  registro_diario_activo BOOLEAN DEFAULT TRUE,
  hora_registro TEXT DEFAULT '20:00',
  guardar_historial_chat BOOLEAN DEFAULT TRUE,
  idioma TEXT DEFAULT 'es',
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de sesiones de chat
CREATE TABLE IF NOT EXISTS "Group_By".sesiones_chat (
  id_sesion_chat UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_perfil UUID NOT NULL REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  nombre_sesion TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de mensajes de chat
CREATE TABLE IF NOT EXISTS "Group_By".mensajes_chat (
  id_mensaje_chat UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_sesion_chat UUID NOT NULL REFERENCES "Group_By".sesiones_chat(id_sesion_chat) ON DELETE CASCADE,
  id_perfil UUID NOT NULL REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  rol TEXT NOT NULL CHECK (rol IN ('user', 'bot', 'system')),
  contenido TEXT NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_perfiles_usuario_autenticacion_id ON "Group_By".perfiles(usuario_autenticacion_id);
CREATE INDEX IF NOT EXISTS idx_entradas_diario_id_perfil ON "Group_By".entradas_diario(id_perfil);
CREATE INDEX IF NOT EXISTS idx_entradas_diario_creado_en ON "Group_By".entradas_diario(creado_en DESC);
CREATE INDEX IF NOT EXISTS idx_sesiones_chat_id_perfil ON "Group_By".sesiones_chat(id_perfil);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id_sesion_chat ON "Group_By".mensajes_chat(id_sesion_chat);
CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id_perfil ON "Group_By".mensajes_chat(id_perfil);

-- Trigger para actualizar timestamp
CREATE OR REPLACE FUNCTION "Group_By".set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_perfiles_updated_at ON "Group_By".perfiles;
CREATE TRIGGER set_perfiles_updated_at
  BEFORE UPDATE ON "Group_By".perfiles
  FOR EACH ROW EXECUTE FUNCTION "Group_By".set_updated_at();

DROP TRIGGER IF EXISTS set_configuraciones_usuario_updated_at ON "Group_By".configuraciones_usuario;
CREATE TRIGGER set_configuraciones_usuario_updated_at
  BEFORE UPDATE ON "Group_By".configuraciones_usuario
  FOR EACH ROW EXECUTE FUNCTION "Group_By".set_updated_at();

DROP TRIGGER IF EXISTS set_sesiones_chat_updated_at ON "Group_By".sesiones_chat;
CREATE TRIGGER set_sesiones_chat_updated_at
  BEFORE UPDATE ON "Group_By".sesiones_chat
  FOR EACH ROW EXECUTE FUNCTION "Group_By".set_updated_at();

-- Row Level Security (RLS)
ALTER TABLE "Group_By".perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".entradas_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".configuraciones_usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".sesiones_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".mensajes_chat ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON "Group_By".perfiles
  FOR SELECT USING (usuario_autenticacion_id = auth.uid());

CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON "Group_By".perfiles
  FOR UPDATE USING (usuario_autenticacion_id = auth.uid());

-- Políticas RLS para entradas de diario
CREATE POLICY "Usuarios pueden ver sus propias entradas de diario" ON "Group_By".entradas_diario
  FOR SELECT USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear entradas de diario" ON "Group_By".entradas_diario
  FOR INSERT WITH CHECK (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus propias entradas de diario" ON "Group_By".entradas_diario
  FOR UPDATE USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

-- Políticas RLS para configuraciones
CREATE POLICY "Usuarios pueden ver sus configuraciones" ON "Group_By".configuraciones_usuario
  FOR SELECT USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear configuraciones" ON "Group_By".configuraciones_usuario
  FOR INSERT WITH CHECK (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus configuraciones" ON "Group_By".configuraciones_usuario
  FOR UPDATE USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

-- Políticas RLS para sesiones de chat
CREATE POLICY "Usuarios pueden ver sus sesiones de chat" ON "Group_By".sesiones_chat
  FOR SELECT USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear sesiones de chat" ON "Group_By".sesiones_chat
  FOR INSERT WITH CHECK (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

-- Políticas RLS para mensajes de chat
CREATE POLICY "Usuarios pueden ver sus mensajes de chat" ON "Group_By".mensajes_chat
  FOR SELECT USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );

CREATE POLICY "Usuarios pueden crear mensajes de chat" ON "Group_By".mensajes_chat
  FOR INSERT WITH CHECK (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles WHERE usuario_autenticacion_id = auth.uid()
    )
  );
