const test = require('node:test');
const assert = require('node:assert/strict');
const { containsCrisisLanguage } = require('../src/crisis');

const crisisExamples = [
  'suicidio',
  'Siento que soy suicida',
  'Quiero suicidarme',
  'He pensado en la autolesión',
  'Tengo ganas de autolesionarme',
  'Quiero hacerme daño',
  'Estoy pensando en quitarme la vida',
  'Voy a matarme',
  'QUIERO MORIR',
  'NO QUIERO SEGUIR',
  'No quiero seguir viviendo con este dolor',
  'No quiero seguir con vida porque todo duele',
  'Siento que sería mejor morir',
  'Siento que sería mejor estar muerto',
  'Ojalá estuviera muerta',
  'Ojalá no despertar mañana',
  'Quiero dormir y no despertar',
  'No tengo razones para seguir viviendo',
  'Quiero desaparecer',
  'A veces pienso en desaparecer para siempre',
  'Quiero matar a alguien',
  'Voy a asesinar a una persona',
  'Pienso matar a mi vecino',
  'Quiero matar a Juan',
  'Voy a matar al profesor',
  'Quiero matar a mis padres',
  'Voy a matar a todos',
  'Pienso asesinar a Pedro',
  'Tengo ganas de matarlo',
  'Estoy pensando en matarlo',
  'He pensado en matarlo',
  'Tengo un plan para matar a Juan',
  'Quiero matar mosquitos, pero quiero matar a Juan',
  'Quiero matar el tiempo y luego a Juan',
  'Necesito matar el proceso, pero voy a matar al administrador',
  'En el videojuego quiero matar enemigos y ahora voy a matar a Juan',
  'Mi tarea habla del suicidio y yo me siento suicida',
  'Quiero matar mosquitos y a Juan',
  'Quiero matar el tiempo y matar a Juan',
  'Lo voy a matar',
  'ASESINARÉ A ALGUIEN',
  'matar',
  '¡matar!',
  'Quiero matar',
];

for (const example of crisisExamples) {
  test(`detects crisis language: ${example}`, () => {
    assert.equal(containsCrisisLanguage(example), true);
  });
}

const nonCrisisExamples = [
  'Quiero matar el tiempo con una película',
  'Quiero matar mosquitos',
  'Quiero matar una cucaracha',
  'Quiero matar el hambre con un taco',
  'Necesito matar el proceso de Node',
  'Quiero matar la sed',
  'Quiero matar el rato',
  'Quiero matar una araña',
  'Quiero matar hormigas',
  'En el videojuego quiero matar al enemigo',
  'Quiero matar mosquitos, pero a Juan lo quiero invitar a cenar',
  'Me voy a morir de risa',
  'Me voy a morir de la risa',
  'Quiero morir de sueño',
  'Esta película trata del suicidio',
  'Leí un artículo que habla sobre la autolesión',
  'No quiero seguir esta serie',
  'Quiero hacer desaparecer este archivo',
];

for (const example of nonCrisisExamples) {
  test(`does not flag contextual mention: ${example}`, () => {
    assert.equal(containsCrisisLanguage(example), false);
  });
}

test('keeps the client and server crisis detectors aligned', async () => {
  const { containsCrisisLanguage: clientContainsCrisisLanguage } = await import(
    '../../src/lib/crisis.ts'
  );

  for (const example of [...crisisExamples, ...nonCrisisExamples]) {
    assert.equal(
      clientContainsCrisisLanguage(example),
      containsCrisisLanguage(example),
      `Detector mismatch for: ${example}`,
    );
  }
});

test('handles empty and non-string values', () => {
  assert.equal(containsCrisisLanguage(''), false);
  assert.equal(containsCrisisLanguage(null), false);
  assert.equal(containsCrisisLanguage(undefined), false);
});
