const supabase = require('./db');

async function requireProfile(req, res, next) {
  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length).trim()
      : '';

    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return res.status(401).json({ error: 'Sesión no válida' });
    }

    const { data: profile, error: profileError } = await supabase
      .schema('Group_By')
      .from('perfiles')
      .select('id_perfil')
      .eq('usuario_autenticacion_id', user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: profileError.message });
    }
    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    req.authUser = user;
    req.profileId = profile.id_perfil;
    return next();
  } catch (error) {
    console.error('Error validando la sesión:', error);
    return res.status(500).json({ error: 'No se pudo validar la sesión' });
  }
}

module.exports = { requireProfile };
