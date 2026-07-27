-- Memoria de largo plazo para FriendIA. Se guarda separada del historial
-- para poder reutilizar hechos importantes entre conversaciones.

CREATE TABLE IF NOT EXISTS "Group_By".memorias_chat (
  id_memoria UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_perfil UUID NOT NULL REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  contenido TEXT NOT NULL CHECK (char_length(contenido) BETWEEN 1 AND 500),
  contenido_normalizado TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'otro',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (id_perfil, contenido_normalizado)
);

CREATE INDEX IF NOT EXISTS idx_memorias_chat_perfil_actualizacion
  ON "Group_By".memorias_chat(id_perfil, actualizado_en DESC);

ALTER TABLE "Group_By".memorias_chat ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE "Group_By".memorias_chat TO authenticated;

CREATE POLICY "Usuarios pueden ver sus memorias"
  ON "Group_By".memorias_chat FOR SELECT TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Usuarios pueden crear sus memorias"
  ON "Group_By".memorias_chat FOR INSERT TO authenticated
  WITH CHECK (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Usuarios pueden actualizar sus memorias"
  ON "Group_By".memorias_chat FOR UPDATE TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Usuarios pueden borrar sus memorias"
  ON "Group_By".memorias_chat FOR DELETE TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

NOTIFY pgrst, 'reload schema';
