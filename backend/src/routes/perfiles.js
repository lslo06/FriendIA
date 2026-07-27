const express = require("express");
const router = express.Router();
const supabase = require("../db");

const USERS_PER_PAGE = 1000;
const DISABILITY_OPTIONS = new Map([
  ["visual", "Visual"],
  ["auditiva", "Auditiva"],
  ["motriz", "Motriz"],
  ["ninguna", "Ninguna"],
  ["prefiero no decir", "Prefiero no decir"],
]);

function normalizeRequiredText(value) {
  return typeof value === "string" ? value.trim() : "";
}

async function findAuthUserByEmail(email) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    });

    if (error) throw error;

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === email
    );

    if (user || data.users.length < USERS_PER_PAGE) return user ?? null;
    page += 1;
  }
}

function registrationConflict(user) {
  const providers = Array.isArray(user.app_metadata?.providers)
    ? user.app_metadata.providers
    : [];

  if (providers.includes("google") && !providers.includes("email")) {
    return {
      code: "email_registered_with_google",
      error:
        "Este correo ya tiene una cuenta vinculada a Google. Inicia sesión o verifica Google para crear una contraseña.",
    };
  }

  return {
    code: "email_already_registered",
    error:
      "Este correo ya está registrado. Inicia sesión o recupera tu contraseña.",
  };
}

function hasRealEmailIdentity(user) {
  return (
    Array.isArray(user.identities) &&
    user.identities.some((identity) => identity.provider === "email")
  );
}

function isOnboardingComplete(profile) {
  return Boolean(profile?.tono_preferido?.trim());
}

async function getAuthenticatedUser(req) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return { user: null, error: "Token no proporcionado" };

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: "Sesión no válida" };
  }

  return { user, error: null };
}

function canonicalDisability(value) {
  const normalized = normalizeRequiredText(value).toLowerCase();
  return normalized ? DISABILITY_OPTIONS.get(normalized) ?? null : "";
}

router.get("/discapacidad", async (req, res) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError || !user) {
      return res.status(401).json({ error: authError });
    }

    const { data: profile, error: profileError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .select("id_perfil")
      .eq("usuario_autenticacion_id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile) return res.json({ disability: "" });

    const { data: relation, error: relationError } = await supabase
      .schema("Group_By")
      .from("perfil_discapacidad")
      .select("tipo_discapacidad(nombre)")
      .eq("id_perfil", profile.id_perfil)
      .limit(1)
      .maybeSingle();

    if (relationError) throw relationError;

    const relatedType = Array.isArray(relation?.tipo_discapacidad)
      ? relation.tipo_discapacidad[0]
      : relation?.tipo_discapacidad;
    const storedName = relatedType?.nombre ?? "";

    return res.json({
      disability: canonicalDisability(storedName) || storedName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "No se pudo cargar la información de discapacidad",
    });
  }
});

router.put("/discapacidad", async (req, res) => {
  try {
    const { user, error: authError } = await getAuthenticatedUser(req);

    if (authError || !user) {
      return res.status(401).json({ error: authError });
    }

    const disability = canonicalDisability(req.body.disability);
    if (disability === null) {
      return res.status(400).json({ error: "Opción de discapacidad no válida" });
    }

    const { data: profile, error: profileError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .select("id_perfil")
      .eq("usuario_autenticacion_id", user.id)
      .single();

    if (profileError) throw profileError;

    const { error: deleteError } = await supabase
      .schema("Group_By")
      .from("perfil_discapacidad")
      .delete()
      .eq("id_perfil", profile.id_perfil);

    if (deleteError) throw deleteError;

    if (!disability) {
      return res.json({ disability: "" });
    }

    const storedName = disability.toLowerCase();
    let { data: type, error: typeError } = await supabase
      .schema("Group_By")
      .from("tipo_discapacidad")
      .select("id_tipo_discapacidad")
      .ilike("nombre", storedName)
      .maybeSingle();

    if (typeError) throw typeError;

    if (!type) {
      const { data: insertedType, error: insertTypeError } = await supabase
        .schema("Group_By")
        .from("tipo_discapacidad")
        .insert({ nombre: storedName })
        .select("id_tipo_discapacidad")
        .single();

      if (insertTypeError) throw insertTypeError;
      type = insertedType;
    }

    const { error: relationError } = await supabase
      .schema("Group_By")
      .from("perfil_discapacidad")
      .insert({
        id_perfil: profile.id_perfil,
        id_tipo_discapacidad: type.id_tipo_discapacidad,
      });

    if (relationError) throw relationError;
    return res.json({ disability });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "No se pudo guardar la información de discapacidad",
    });
  }
});

router.post("/verificar-correo", async (req, res) => {
  try {
    const normalizedEmail = normalizeRequiredText(req.body.email).toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        error: "El correo electrónico es obligatorio",
      });
    }

    const existingUser = await findAuthUserByEmail(normalizedEmail);

    if (!existingUser) {
      return res.json({ available: true });
    }

    return res.json({
      available: false,
      ...registrationConflict(existingUser),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "No se pudo verificar el correo",
    });
  }
});

router.post("/registro", async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido_pat,
      apellido_mat,
    } = req.body;

    const normalizedEmail = normalizeRequiredText(email).toLowerCase();
    const normalizedName = normalizeRequiredText(nombre);
    const normalizedLastName = normalizeRequiredText(apellido_pat);
    const normalizedSecondLastName = normalizeRequiredText(apellido_mat);

    if (
      !normalizedEmail ||
      !password ||
      !normalizedName ||
      !normalizedLastName ||
      !normalizedSecondLastName
    ) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const existingUser = await findAuthUserByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json(registrationConflict(existingUser));
    }

    const authClient = supabase.createRequestClient();
    const { data: authData, error: authError } =
      await authClient.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            nombre: normalizedName,
            apellido_pat: normalizedLastName,
            apellido_mat: normalizedSecondLastName,
            full_name: `${normalizedName} ${normalizedLastName} ${normalizedSecondLastName}`,
          },
        },
      });

    if (authError) {
      return res.status(400).json({
        error: authError.message,
      });
    }

    // Supabase puede devolver un usuario ofuscado y sin identidades cuando el
    // correo ya existe. Nunca debe tratarse como un registro exitoso.
    if (!authData.user || !hasRealEmailIdentity(authData.user)) {
      return res.status(409).json({
        code: "email_already_registered",
        error:
          "Este correo ya está registrado. Inicia sesión o usa el proveedor con el que creaste la cuenta.",
      });
    }

    const userId = authData.user.id;

    const { data: perfil, error: dbError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .insert({
        id_perfil: userId,
        usuario_autenticacion_id: userId,
        nombre: normalizedName,
        apellido_pat: normalizedLastName,
        apellido_mat: normalizedSecondLastName,
      })
      .select()
      .single();

    if (dbError) {
      const { error: rollbackError } =
        await supabase.auth.admin.deleteUser(userId);

      if (rollbackError) {
        console.error(
          "No se pudo revertir el usuario tras fallar el perfil:",
          rollbackError
        );
      }

      return res.status(500).json({
        error: "No se pudo crear el perfil. Inténtalo nuevamente.",
      });
    }

    return res.status(201).json({
      message: authData.session
        ? "Usuario y perfil creados correctamente"
        : "Cuenta creada. Revisa tu correo para confirmarla.",
      user: {
        ...perfil,
        survey_completed: isOnboardingComplete(perfil),
      },
      session: authData.session,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = normalizeRequiredText(email).toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        error: "Correo y contraseña son obligatorios",
      });
    }

    const authClient = supabase.createRequestClient();
    const { data: authData, error: authError } =
      await authClient.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

    if (authError) {
      if (authError.message === "Email not confirmed") {
        return res.status(401).json({
          code: "email_not_confirmed",
          error: "Confirma tu correo antes de iniciar sesión.",
        });
      }

      const existingUser = await findAuthUserByEmail(normalizedEmail);

      if (existingUser) {
        const conflict = registrationConflict(existingUser);
        if (conflict.code === "email_registered_with_google") {
          return res.status(401).json(conflict);
        }
      }

      return res.status(401).json({
        code: "invalid_credentials",
        error: "Correo o contraseña incorrectos.",
      });
    }

    const { data: perfil } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .select("*")
      .eq("usuario_autenticacion_id", authData.user.id)
      .maybeSingle();

    return res.json({
      message: "Sesión iniciada correctamente",
      session: authData.session,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nombre:
          perfil?.nombre ||
          authData.user.user_metadata?.nombre ||
          normalizedEmail.split("@")[0],
        apellido_pat:
          perfil?.apellido_pat ||
          authData.user.user_metadata?.apellido_pat ||
          "",
        apellido_mat:
          perfil?.apellido_mat ||
          authData.user.user_metadata?.apellido_mat ||
          "",
        survey_completed: isOnboardingComplete(perfil),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

router.get("/google-status", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Token no proporcionado",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({
        error: "Sesión no válida",
      });
    }

    const { data: perfil, error: perfilError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .select("*")
      .eq("usuario_autenticacion_id", user.id)
      .maybeSingle();

    if (perfilError) {
      return res.status(500).json({
        error: perfilError.message,
      });
    }

    const nombre =
      perfil?.nombre ||
      user.user_metadata?.given_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario";

    return res.json({
      nombre,
      survey_completed: isOnboardingComplete(perfil),
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

router.post("/google-completar", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Token no proporcionado",
      });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({
        error: "Sesión no válida",
      });
    }

    const { apellido_pat, apellido_mat } = req.body;

    if (!apellido_pat?.trim() || !apellido_mat?.trim()) {
      return res.status(400).json({
        error: "Los dos apellidos son obligatorios",
      });
    }

    const nombre =
      user.user_metadata?.given_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Usuario";

    const { data: perfilExistente, error: buscarError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .select("*")
      .eq("usuario_autenticacion_id", user.id)
      .maybeSingle();

    if (buscarError) {
      return res.status(500).json({
        error: buscarError.message,
      });
    }

    let perfil;

    if (perfilExistente) {
      const { data, error } = await supabase
        .schema("Group_By")
        .from("perfiles")
        .update({
          apellido_pat: apellido_pat.trim(),
          apellido_mat: apellido_mat.trim(),
        })
        .eq("usuario_autenticacion_id", user.id)
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      perfil = data;
    } else {
      const { data, error } = await supabase
        .schema("Group_By")
        .from("perfiles")
        .insert({
          id_perfil: user.id,
          usuario_autenticacion_id: user.id,
          nombre,
          apellido_pat: apellido_pat.trim(),
          apellido_mat: apellido_mat.trim(),
        })
        .select()
        .single();

      if (error) {
        return res.status(500).json({
          error: error.message,
        });
      }

      perfil = data;
    }

    return res.json({
      message: "Perfil completado correctamente",
      user: {
        ...perfil,
        survey_completed: isOnboardingComplete(perfil),
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;
