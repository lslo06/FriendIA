-- Normaliza las tablas de chat creadas por las primeras versiones del esquema.
-- Ejecutar una vez antes de habilitar el historial del chat con Gemini.

ALTER TABLE "Group_By".sesiones_chat
  ADD COLUMN IF NOT EXISTS nombre_sesion TEXT,
  ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE "Group_By".mensajes_chat
  ADD COLUMN IF NOT EXISTS id_perfil UUID;

UPDATE "Group_By".mensajes_chat AS mensaje
SET id_perfil = sesion.id_perfil
FROM "Group_By".sesiones_chat AS sesion
WHERE mensaje.id_sesion_chat = sesion.id_sesion_chat
  AND mensaje.id_perfil IS NULL;

-- Asigna nombre también a las conversaciones creadas antes de esta migración.
-- Usa el primer mensaje del usuario, igual que hace el backend para chats nuevos.
UPDATE "Group_By".sesiones_chat AS sesion
SET nombre_sesion = LEFT(
  TRIM(
    (
      SELECT mensaje.contenido
      FROM "Group_By".mensajes_chat AS mensaje
      WHERE mensaje.id_sesion_chat = sesion.id_sesion_chat
        AND mensaje.rol = 'user'
      ORDER BY mensaje.creado_en ASC
      LIMIT 1
    )
  ),
  60
)
WHERE (sesion.nombre_sesion IS NULL OR TRIM(sesion.nombre_sesion) = '')
  AND EXISTS (
    SELECT 1
    FROM "Group_By".mensajes_chat AS mensaje
    WHERE mensaje.id_sesion_chat = sesion.id_sesion_chat
      AND mensaje.rol = 'user'
  );

ALTER TABLE "Group_By".mensajes_chat
  ALTER COLUMN id_perfil SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_mensaje_chat_perfil'
      AND conrelid = '"Group_By".mensajes_chat'::regclass
  ) THEN
    ALTER TABLE "Group_By".mensajes_chat
      ADD CONSTRAINT fk_mensaje_chat_perfil
      FOREIGN KEY (id_perfil)
      REFERENCES "Group_By".perfiles(id_perfil)
      ON DELETE CASCADE;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_mensajes_chat_id_perfil
  ON "Group_By".mensajes_chat(id_perfil);

GRANT SELECT, INSERT, DELETE ON TABLE
  "Group_By".sesiones_chat,
  "Group_By".mensajes_chat
TO authenticated;

DROP POLICY IF EXISTS "Usuarios pueden ver sus mensajes de chat"
  ON "Group_By".mensajes_chat;
CREATE POLICY "Usuarios pueden ver sus mensajes de chat"
  ON "Group_By".mensajes_chat
  FOR SELECT TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden crear mensajes de chat"
  ON "Group_By".mensajes_chat;
CREATE POLICY "Usuarios pueden crear mensajes de chat"
  ON "Group_By".mensajes_chat
  FOR INSERT TO authenticated
  WITH CHECK (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden borrar sus mensajes de chat"
  ON "Group_By".mensajes_chat;
CREATE POLICY "Usuarios pueden borrar sus mensajes de chat"
  ON "Group_By".mensajes_chat
  FOR DELETE TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

NOTIFY pgrst, 'reload schema';
