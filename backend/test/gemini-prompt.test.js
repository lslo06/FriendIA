const test = require('node:test');
const assert = require('node:assert/strict');
const { buildSystemInstruction } = require('../src/gemini');

test('the Gemini prompt applies preferred tone and current emotion', () => {
  const instruction = buildSystemInstruction(
    { nombre: 'Ana', tono_preferido: 'Motivador', preocupaciones: [] },
    null,
    [],
    {
      fecha_registro: '2026-07-28',
      etiqueta_animo: 'Tristeza',
      etiquetas_emociones: ['Desánimo'],
      notas: null,
    },
  );

  assert.match(instruction, /tono motivador/i);
  assert.match(instruction, /Tristeza/);
  assert.match(instruction, /Desánimo/);
  assert.match(instruction, /como diagnóstico/i);
});

test('the Gemini prompt does not receive cycle tracking data', () => {
  const instruction = buildSystemInstruction(
    {
      nombre: 'Ana',
      genero: 'Mujer',
      seguimiento_ciclo_activo: true,
      preocupaciones: [],
    },
    null,
  );

  assert.doesNotMatch(instruction, /seguimiento_de_ciclo_activado/);
});
