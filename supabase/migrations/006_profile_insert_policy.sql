-- Permite que un usuario autenticado cree exclusivamente su propio perfil.
-- El backend usa service_role, pero esta política también protege los flujos
-- de onboarding que insertan el perfil directamente desde la aplicación.

GRANT USAGE ON SCHEMA "Group_By" TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE "Group_By".perfiles TO authenticated;

DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil"
  ON "Group_By".perfiles;

CREATE POLICY "Usuarios pueden crear su propio perfil"
  ON "Group_By".perfiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_autenticacion_id = auth.uid()
    AND id_perfil = auth.uid()
  );
