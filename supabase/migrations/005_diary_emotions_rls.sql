-- FriendIA: acceso seguro desde el frontend a diario y emociones.
-- Requiere que el schema Group_By esté incluido en los schemas expuestos
-- de la API de Supabase (Project Settings > API > Exposed schemas).

GRANT USAGE ON SCHEMA "Group_By" TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE "Group_By".entradas_diario
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE "Group_By".registros_emociones
  TO authenticated;

ALTER TABLE "Group_By".entradas_diario ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Group_By".registros_emociones ENABLE ROW LEVEL SECURITY;

-- La app ya no usa la vista public creada por migraciones antiguas. Se revocan
-- sus permisos para evitar que una vista propiedad de postgres omita el RLS.
DO $$
BEGIN
  IF to_regclass('public.entradas_diario') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON TABLE public.entradas_diario FROM anon, authenticated';
  END IF;
END;
$$;

DROP POLICY IF EXISTS diario_select_propio ON "Group_By".entradas_diario;
DROP POLICY IF EXISTS diario_insert_propio ON "Group_By".entradas_diario;
DROP POLICY IF EXISTS diario_update_propio ON "Group_By".entradas_diario;
DROP POLICY IF EXISTS diario_delete_propio ON "Group_By".entradas_diario;

CREATE POLICY diario_select_propio
ON "Group_By".entradas_diario
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = entradas_diario.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY diario_insert_propio
ON "Group_By".entradas_diario
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = entradas_diario.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY diario_update_propio
ON "Group_By".entradas_diario
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = entradas_diario.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = entradas_diario.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY diario_delete_propio
ON "Group_By".entradas_diario
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = entradas_diario.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS emociones_select_propias ON "Group_By".registros_emociones;
DROP POLICY IF EXISTS emociones_insert_propias ON "Group_By".registros_emociones;
DROP POLICY IF EXISTS emociones_update_propias ON "Group_By".registros_emociones;
DROP POLICY IF EXISTS emociones_delete_propias ON "Group_By".registros_emociones;

CREATE POLICY emociones_select_propias
ON "Group_By".registros_emociones
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_emociones.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY emociones_insert_propias
ON "Group_By".registros_emociones
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_emociones.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY emociones_update_propias
ON "Group_By".registros_emociones
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_emociones.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_emociones.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE POLICY emociones_delete_propias
ON "Group_By".registros_emociones
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM "Group_By".perfiles AS p
    WHERE p.id_perfil = registros_emociones.id_perfil
      AND p.usuario_autenticacion_id = (SELECT auth.uid())
  )
);

CREATE INDEX IF NOT EXISTS idx_entradas_diario_perfil_fecha
  ON "Group_By".entradas_diario (id_perfil, creado_en DESC);

CREATE INDEX IF NOT EXISTS idx_registros_emociones_perfil_fecha
  ON "Group_By".registros_emociones (id_perfil, fecha_registro DESC, creado_en DESC);
