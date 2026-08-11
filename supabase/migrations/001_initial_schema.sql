-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE Group_By.perfiles (
  id_perfil uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_autenticacion_id uuid UNIQUE,
  nombre text,
  apellido_pat text,
  apellido_mat text,
  genero text,
  tono_preferido text,
  preocupaciones ARRAY,
  url_avatar text,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT perfiles_pkey PRIMARY KEY (id_perfil)
);
CREATE TABLE Group_By.tipo_discapacidad (
  id_tipo_discapacidad smallint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nombre text NOT NULL UNIQUE,
  descripcion text,
  CONSTRAINT tipo_discapacidad_pkey PRIMARY KEY (id_tipo_discapacidad)
);
CREATE TABLE Group_By.psicologos (
  id_psicologo uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre_completo text NOT NULL,
  especialidad text,
  biografia text,
  url_contacto text,
  url_avatar text,
  esta_activo boolean DEFAULT true,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT psicologos_pkey PRIMARY KEY (id_psicologo)
);
CREATE TABLE Group_By.configuraciones_usuario (
  id_configuracion_usuario uuid NOT NULL DEFAULT gen_random_uuid(),
  id_perfil uuid NOT NULL UNIQUE,
  modo_oscuro boolean DEFAULT false,
  tamano_fuente integer DEFAULT 14,
  registro_diario_activo boolean DEFAULT true,
  hora_registro time without time zone,
  guardar_historial_chat boolean DEFAULT true,
  idioma text DEFAULT 'es'::text,
  actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT configuraciones_usuario_pkey PRIMARY KEY (id_configuracion_usuario),
  CONSTRAINT fk_configuracion_perfil FOREIGN KEY (id_perfil) REFERENCES Group_By.perfiles(id_perfil)
);
CREATE TABLE Group_By.perfil_discapacidad (
  id_perfil uuid NOT NULL,
  id_tipo_discapacidad smallint NOT NULL,
  CONSTRAINT perfil_discapacidad_pkey PRIMARY KEY (id_perfil, id_tipo_discapacidad),
  CONSTRAINT fk_perfil_discapacidad_perfil FOREIGN KEY (id_perfil) REFERENCES Group_By.perfiles(id_perfil),
  CONSTRAINT fk_perfil_discapacidad_tipo FOREIGN KEY (id_tipo_discapacidad) REFERENCES Group_By.tipo_discapacidad(id_tipo_discapacidad)
);
CREATE TABLE Group_By.registros_emociones (
  id_registro_emocion uuid NOT NULL DEFAULT gen_random_uuid(),
  id_perfil uuid NOT NULL,
  fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
  puntuacion_animo integer,
  etiqueta_animo text,
  etiquetas_emociones ARRAY,
  notas text,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT registros_emociones_pkey PRIMARY KEY (id_registro_emocion),
  CONSTRAINT fk_registro_emocion_perfil FOREIGN KEY (id_perfil) REFERENCES Group_By.perfiles(id_perfil)
);
CREATE TABLE Group_By.entradas_diario (
  id_entrada_diario uuid NOT NULL DEFAULT gen_random_uuid(),
  id_perfil uuid NOT NULL,
  contenido text NOT NULL,
  etiquetas ARRAY,
  puntuacion_animo integer,
  esta_fijado boolean DEFAULT false,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT entradas_diario_pkey PRIMARY KEY (id_entrada_diario),
  CONSTRAINT fk_entrada_diario_perfil FOREIGN KEY (id_perfil) REFERENCES Group_By.perfiles(id_perfil)
);
CREATE TABLE Group_By.sesiones_chat (
  id_sesion_chat uuid NOT NULL DEFAULT gen_random_uuid(),
  id_perfil uuid NOT NULL,
  duracion_segundos integer,
  reflexion_cierre text,
  fue_de_ayuda boolean,
  iniciado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  finalizado_en timestamp with time zone,
  CONSTRAINT sesiones_chat_pkey PRIMARY KEY (id_sesion_chat),
  CONSTRAINT fk_sesion_chat_perfil FOREIGN KEY (id_perfil) REFERENCES Group_By.perfiles(id_perfil)
);
CREATE TABLE Group_By.mensajes_chat (
  id_mensaje_chat uuid NOT NULL DEFAULT gen_random_uuid(),
  id_sesion_chat uuid NOT NULL,
  rol text NOT NULL,
  contenido text NOT NULL,
  conteo_tokens integer,
  creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT mensajes_chat_pkey PRIMARY KEY (id_mensaje_chat),
  CONSTRAINT fk_mensaje_chat_sesion FOREIGN KEY (id_sesion_chat) REFERENCES Group_By.sesiones_chat(id_sesion_chat)
);
