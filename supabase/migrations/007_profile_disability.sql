-- Completa las tablas relacionadas con discapacidad para instalaciones nuevas.
-- Es segura de ejecutar si las tablas ya existen.

CREATE TABLE IF NOT EXISTS "Group_By".tipo_discapacidad (
  id_tipo_discapacidad SMALLINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS "Group_By".perfil_discapacidad (
  id_perfil UUID NOT NULL REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  id_tipo_discapacidad SMALLINT NOT NULL REFERENCES "Group_By".tipo_discapacidad(id_tipo_discapacidad),
  PRIMARY KEY (id_perfil, id_tipo_discapacidad)
);

INSERT INTO "Group_By".tipo_discapacidad (nombre)
VALUES
  ('visual'),
  ('auditiva'),
  ('motriz'),
  ('ninguna'),
  ('prefiero no decir')
ON CONFLICT (nombre) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_perfil_discapacidad_perfil
  ON "Group_By".perfil_discapacidad(id_perfil);

ALTER TABLE "Group_By".tipo_discapacidad ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".perfil_discapacidad ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE "Group_By".tipo_discapacidad TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE "Group_By".perfil_discapacidad TO authenticated;

DROP POLICY IF EXISTS "Usuarios pueden ver tipos de discapacidad"
  ON "Group_By".tipo_discapacidad;
CREATE POLICY "Usuarios pueden ver tipos de discapacidad"
  ON "Group_By".tipo_discapacidad
  FOR SELECT
  TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "Usuarios pueden ver su discapacidad"
  ON "Group_By".perfil_discapacidad;
CREATE POLICY "Usuarios pueden ver su discapacidad"
  ON "Group_By".perfil_discapacidad
  FOR SELECT
  TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Usuarios pueden guardar su discapacidad"
  ON "Group_By".perfil_discapacidad;
CREATE POLICY "Usuarios pueden guardar su discapacidad"
  ON "Group_By".perfil_discapacidad
  FOR ALL
  TO authenticated
  USING (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    id_perfil IN (
      SELECT id_perfil
      FROM "Group_By".perfiles
      WHERE usuario_autenticacion_id = (SELECT auth.uid())
    )
  );
