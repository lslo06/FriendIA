const express = require("express");
const router = express.Router();
const supabase = require("../db");

router.post("/registro", async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido_pat,
      apellido_mat,
    } = req.body;

    if (!email || !password || !nombre || !apellido_pat || !apellido_mat) {
      return res.status(400).json({
        error: "Todos los campos son obligatorios",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            apellido_pat,
            apellido_mat,
            full_name: `${nombre} ${apellido_pat} ${apellido_mat}`,
          },
        },
      });

    if (authError) {
      return res.status(400).json({
        error: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: "No se pudo crear el usuario",
      });
    }

    const userId = authData.user.id;

    const { data: perfil, error: dbError } = await supabase
      .schema("Group_By")
      .from("perfiles")
      .insert({
        id_perfil: userId,
        usuario_autenticacion_id: userId,
        nombre,
        apellido_pat,
        apellido_mat,
      })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({
        error: dbError.message,
      });
    }

    return res.status(201).json({
      message: "Usuario y perfil creados correctamente",
      user: perfil,
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

    if (!email || !password) {
      return res.status(400).json({
        error: "Correo y contraseña son obligatorios",
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (authError) {
      return res.status(401).json({
        error: authError.message,
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
          email.split("@")[0],
        apellido_pat:
          perfil?.apellido_pat ||
          authData.user.user_metadata?.apellido_pat ||
          "",
        apellido_mat:
          perfil?.apellido_mat ||
          authData.user.user_metadata?.apellido_mat ||
          "",
        survey_completed: perfil?.survey_completed ?? false,
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
      needsLastNames:
        !perfil?.apellido_pat?.trim() ||
        !perfil?.apellido_mat?.trim(),
      survey_completed: perfil?.survey_completed ?? false,
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
      user: perfil,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

module.exports = router;