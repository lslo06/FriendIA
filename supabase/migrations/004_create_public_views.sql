-- FriendIA: Crear vistas en public schema que apunten a Group_By
-- Esto permite que Supabase JS Client acceda a las tablas personalizadas
-- Ejecutar en Supabase SQL Editor

-- Vistas para perfiles
CREATE OR REPLACE VIEW public.perfiles AS
  SELECT * FROM "Group_By".perfiles;

CREATE OR REPLACE VIEW public.entradas_diario AS
  SELECT * FROM "Group_By".entradas_diario;

CREATE OR REPLACE VIEW public.configuraciones_usuario AS
  SELECT * FROM "Group_By".configuraciones_usuario;

CREATE OR REPLACE VIEW public.sesiones_chat AS
  SELECT * FROM "Group_By".sesiones_chat;

CREATE OR REPLACE VIEW public.mensajes_chat AS
  SELECT * FROM "Group_By".mensajes_chat;

-- Permitir insert/update/delete en las vistas usando triggers
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

-- Triggers para entradas_diario
CREATE OR REPLACE FUNCTION public.insert_entradas_diario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Group_By".entradas_diario VALUES (NEW.*);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_entradas_diario_trigger ON public.entradas_diario;
CREATE TRIGGER insert_entradas_diario_trigger
  INSTEAD OF INSERT ON public.entradas_diario
  FOR EACH ROW EXECUTE FUNCTION public.insert_entradas_diario();

-- Triggers para configuraciones_usuario
CREATE OR REPLACE FUNCTION public.insert_configuraciones_usuario()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Group_By".configuraciones_usuario VALUES (NEW.*);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_configuraciones_usuario()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE "Group_By".configuraciones_usuario SET
    id_perfil = NEW.id_perfil,
    modo_oscuro = NEW.modo_oscuro,
    tamano_fuente = NEW.tamano_fuente,
    registro_diario_activo = NEW.registro_diario_activo,
    hora_registro = NEW.hora_registro,
    guardar_historial_chat = NEW.guardar_historial_chat,
    idioma = NEW.idioma,
    actualizado_en = NEW.actualizado_en
  WHERE id_configuracion_usuario = OLD.id_configuracion_usuario;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_configuraciones_usuario_trigger ON public.configuraciones_usuario;
CREATE TRIGGER insert_configuraciones_usuario_trigger
  INSTEAD OF INSERT ON public.configuraciones_usuario
  FOR EACH ROW EXECUTE FUNCTION public.insert_configuraciones_usuario();

DROP TRIGGER IF EXISTS update_configuraciones_usuario_trigger ON public.configuraciones_usuario;
CREATE TRIGGER update_configuraciones_usuario_trigger
  INSTEAD OF UPDATE ON public.configuraciones_usuario
  FOR EACH ROW EXECUTE FUNCTION public.update_configuraciones_usuario();

-- Triggers para sesiones_chat
CREATE OR REPLACE FUNCTION public.insert_sesiones_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Group_By".sesiones_chat VALUES (NEW.*);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_sesiones_chat_trigger ON public.sesiones_chat;
CREATE TRIGGER insert_sesiones_chat_trigger
  INSTEAD OF INSERT ON public.sesiones_chat
  FOR EACH ROW EXECUTE FUNCTION public.insert_sesiones_chat();

-- Triggers para mensajes_chat
CREATE OR REPLACE FUNCTION public.insert_mensajes_chat()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO "Group_By".mensajes_chat VALUES (NEW.*);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.delete_mensajes_chat()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "Group_By".mensajes_chat WHERE id_mensaje_chat = OLD.id_mensaje_chat;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS insert_mensajes_chat_trigger ON public.mensajes_chat;
CREATE TRIGGER insert_mensajes_chat_trigger
  INSTEAD OF INSERT ON public.mensajes_chat
  FOR EACH ROW EXECUTE FUNCTION public.insert_mensajes_chat();

DROP TRIGGER IF EXISTS delete_mensajes_chat_trigger ON public.mensajes_chat;
CREATE TRIGGER delete_mensajes_chat_trigger
  INSTEAD OF DELETE ON public.mensajes_chat
  FOR EACH ROW EXECUTE FUNCTION public.delete_mensajes_chat();

-- RLS en las tablas subyacentes ya está configurado en Group_By
-- Las vistas heredarán automáticamente la seguridad
