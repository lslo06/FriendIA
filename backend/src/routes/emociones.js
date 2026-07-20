const express = require('express');
const router = express.Router();
const supabase = require('../db');
const { requireProfile } = require('../auth');

router.use(requireProfile);

router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .schema('Group_By')
    .from('registros_emociones')
    .select('id_registro_emocion,id_perfil,fecha_registro,puntuacion_animo,etiqueta_animo,etiquetas_emociones,notas,creado_en')
    .eq('id_perfil', req.profileId)
    .order('fecha_registro', { ascending: false })
    .order('creado_en', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ emotions: data || [] });
});

router.post('/', async (req, res) => {
  const etiquetaAnimo = typeof req.body.etiqueta_animo === 'string'
    ? req.body.etiqueta_animo.trim()
    : '';
  const etiquetasEmociones = Array.isArray(req.body.etiquetas_emociones)
    ? req.body.etiquetas_emociones.filter(
      item => typeof item === 'string' && item.trim()
    )
    : [];
  const notas = typeof req.body.notas === 'string' ? req.body.notas.trim() : '';
  const puntuacionAnimo = req.body.puntuacion_animo;

  if (!etiquetaAnimo || etiquetasEmociones.length === 0) {
    return res.status(400).json({
      error: 'La emoción principal y al menos un matiz son obligatorios',
    });
  }
  if (
    puntuacionAnimo != null
    && (!Number.isInteger(puntuacionAnimo) || puntuacionAnimo < 1 || puntuacionAnimo > 5)
  ) {
    return res.status(400).json({ error: 'La puntuación de ánimo debe estar entre 1 y 5' });
  }

  const { data, error } = await supabase
    .schema('Group_By')
    .from('registros_emociones')
    .insert({
      id_perfil: req.profileId,
      etiqueta_animo: etiquetaAnimo,
      etiquetas_emociones: etiquetasEmociones,
      puntuacion_animo: puntuacionAnimo ?? null,
      notas: notas || null,
    })
    .select('id_registro_emocion,id_perfil,fecha_registro,puntuacion_animo,etiqueta_animo,etiquetas_emociones,notas,creado_en')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json({ emotion: data });
});

module.exports = router;
