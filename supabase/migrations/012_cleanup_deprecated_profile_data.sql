-- Removes the retired sensitive-data feature from existing installations.

DROP TABLE IF EXISTS "Group_By".registros_ciclo CASCADE;

ALTER TABLE IF EXISTS "Group_By".perfiles
  DROP COLUMN IF EXISTS consentimiento_ciclo_version CASCADE,
  DROP COLUMN IF EXISTS seguimiento_ciclo_activo CASCADE;

-- Dropping a referenced column can remove the legacy public view. Recreate it
-- without the retired fields so older integrations continue to work.
CREATE OR REPLACE VIEW public.perfiles AS
  SELECT * FROM "Group_By".perfiles;

CREATE OR REPLACE FUNCTION public.insert_perfiles()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Group_By".perfiles VALUES (NEW.*);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_perfiles()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Group_By".perfiles SET
    usuario_autenticacion_id = NEW.usuario_autenticacion_id,
    nombre = NEW.nombre,
    apellido_pat = NEW.apellido_pat,
    apellido_mat = NEW.apellido_mat,
    genero = NEW.genero,
    tono_preferido = NEW.tono_preferido,
    preocupaciones = NEW.preocupaciones,
    url_avatar = NEW.url_avatar,
    actualizado_en = NEW.actualizado_en
  WHERE id_perfil = OLD.id_perfil;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.delete_perfiles()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "Group_By".perfiles WHERE id_perfil = OLD.id_perfil;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_perfiles_trigger ON public.perfiles;
CREATE TRIGGER insert_perfiles_trigger
  INSTEAD OF INSERT ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.insert_perfiles();

DROP TRIGGER IF EXISTS update_perfiles_trigger ON public.perfiles;
CREATE TRIGGER update_perfiles_trigger
  INSTEAD OF UPDATE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.update_perfiles();

DROP TRIGGER IF EXISTS delete_perfiles_trigger ON public.perfiles;
CREATE TRIGGER delete_perfiles_trigger
  INSTEAD OF DELETE ON public.perfiles
  FOR EACH ROW EXECUTE FUNCTION public.delete_perfiles();
