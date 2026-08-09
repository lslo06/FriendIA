-- FriendIA: historial privado del ciclo menstrual.
-- Las fechas permanecen en Supabase y no se exponen mediante vistas public.

ALTER TABLE "Group_By".perfiles
  ADD COLUMN IF NOT EXISTS consentimiento_ciclo_version TEXT;

-- Las respuestas antiguas sobre sensibilidad emocional no equivalen a un
-- consentimiento explícito para registrar fechas menstruales.
UPDATE "Group_By".perfiles
SET seguimiento_ciclo_activo = FALSE,
    actualizado_en = NOW()
WHERE seguimiento_ciclo_activo = TRUE
  AND consentimiento_ciclo_version IS NULL;

CREATE TABLE IF NOT EXISTS "Group_By".registros_ciclo (
  id_registro_ciclo UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_perfil UUID NOT NULL
    REFERENCES "Group_By".perfiles(id_perfil) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT registros_ciclo_fin_valido
    CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
  CONSTRAINT registros_ciclo_inicio_no_futuro
    CHECK (fecha_inicio <= CURRENT_DATE),
  CONSTRAINT registros_ciclo_fin_no_futuro
    CHECK (fecha_fin IS NULL OR fecha_fin <= CURRENT_DATE),
  CONSTRAINT registros_ciclo_inicio_unico
    UNIQUE (id_perfil, fecha_inicio)
);

CREATE INDEX IF NOT EXISTS idx_registros_ciclo_perfil_fecha
  ON "Group_By".registros_ciclo (id_perfil, fecha_inicio DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_registros_ciclo_un_periodo_abierto
  ON "Group_By".registros_ciclo (id_perfil)
  WHERE fecha_fin IS NULL;

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'registros_ciclo_sin_solapamiento'
      AND conrelid = '"Group_By".registros_ciclo'::regclass
  ) THEN
    ALTER TABLE "Group_By".registros_ciclo
      ADD CONSTRAINT registros_ciclo_sin_solapamiento
      EXCLUDE USING gist (
        id_perfil WITH =,
        daterange(
          fecha_inicio,
          COALESCE(fecha_fin, 'infinity'::date),
          '[]'
        ) WITH &&
      );
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS set_registros_ciclo_updated_at
  ON "Group_By".registros_ciclo;
CREATE TRIGGER set_registros_ciclo_updated_at
  BEFORE UPDATE ON "Group_By".registros_ciclo
  FOR EACH ROW EXECUTE FUNCTION "Group_By".set_updated_at();

GRANT USAGE ON SCHEMA "Group_By" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE "Group_By".registros_ciclo
  TO authenticated;

ALTER TABLE "Group_By".registros_ciclo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ciclo_select_propio ON "Group_By".registros_ciclo;
DROP POLICY IF EXISTS ciclo_insert_propio ON "Group_By".registros_ciclo;
DROP POLICY IF EXISTS ciclo_update_propio ON "Group_By".registros_ciclo;
DROP POLICY IF EXISTS ciclo_delete_propio ON "Group_By".registros_ciclo;

CREATE POLICY ciclo_select_propio
ON "Group_By".registros_ciclo
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_ciclo.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY ciclo_insert_propio
ON "Group_By".registros_ciclo
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_ciclo.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
      AND p.seguimiento_ciclo_activo = TRUE
      AND p.consentimiento_ciclo_version = '2026-08-09'
  )
);

CREATE POLICY ciclo_update_propio
ON "Group_By".registros_ciclo
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_ciclo.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
      AND p.seguimiento_ciclo_activo = TRUE
      AND p.consentimiento_ciclo_version = '2026-08-09'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_ciclo.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
      AND p.seguimiento_ciclo_activo = TRUE
      AND p.consentimiento_ciclo_version = '2026-08-09'
  )
);

CREATE POLICY ciclo_delete_propio
ON "Group_By".registros_ciclo
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_ciclo.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);
