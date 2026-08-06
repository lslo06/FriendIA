// Keep this detector aligned with src/lib/crisis.ts; the server remains the
// safety fallback if a client request bypasses the immediate UI check.
const DIRECT_CRISIS_PATTERNS = [
  /\bhacerme\s+dano\b/,
  /\blastimarme\b/,
  /\bquitarme\s+la\s+vida\b/,
  /\bmatarme\b/,
  /\bsuicidarme\b/,
  /\bautolesionarme\b/,
  /\b(?:quiero|quisiera|deseo|desearia|voy\s+a|pienso(?:\s+en)?|estoy\s+pensando\s+en|he\s+pensado\s+en|planeo|he\s+planeado|pretendo|intentare|necesito|tengo\s+ganas\s+de|tengo\s+un\s+plan\s+para)\s+(?:morir(?!\s+de(?:\s+la)?\s+(?:risa|hambre|sueno|amor|ganas|curiosidad|miedo|verguenza|aburrimiento|frio|calor|ternura|envidia)\b)|suicidarme|matarme|autolesionarme)\b/,
  /\b(?:pienso|estoy\s+pensando|he\s+pensado|sigo\s+pensando)\s+en\s+(?:el\s+)?suicidio\b/,
  /\b(?:tengo|he\s+tenido)\s+(?:pensamientos?|ideas?|ideacion)\s+suicidas?\b/,
  /\b(?:me\s+siento|soy|estoy)\s+suicida\b/,
  /\bno\s+quiero\s+seguir\s+(?:viviendo|con\s+vida|aqui|adelante|asi|ya)\b/,
  /\bno\s+quiero\s+(?:vivir|estar\s+con\s+vida)\b/,
  /\b(?:ojala|espero)\s+no\s+(?:despertar|amanecer)\b/,
  /\b(?:seria|estaria)\s+mejor\s+(?:morir|(?:estar\s+)?muert[oa])\b/,
  /\b(?:quiero|quisiera|deseo|desearia|preferiria|ojala)\s+(?:estar|estuviera)\s+muert[oa]\b/,
  /\bno\s+quiero\s+(?:despertar|amanecer)\b/,
  /\b(?:dormir|irme\s+a\s+dormir)\s+y\s+no\s+despertar\b/,
  /\b(?:no\s+tengo|no\s+hay)\s+(?:razones?|motivos?)\s+para\s+(?:seguir\s+)?(?:vivir|viviendo)\b/,
  /\b(?:quiero|quisiera|desearia|ojala\s+pudiera|voy\s+a|pienso\s+en|he\s+pensado\s+en|sigo\s+pensando\s+en)\s+desaparecer\b/,
];

const CRISIS_TERM_PATTERNS = [
  /\bsuicid\w*\b/,
  /\bautolesion\w*\b/,
];

const INFORMATIONAL_CONTEXT_PATTERNS = [
  /\b(?:pelicula|serie|libro|documental|articulo|noticia|clase|tarea|ensayo|obra|cancion|podcast|video)\b.{0,100}\b(?:trata|habla|analiza|menciona|es)\b.{0,100}\b(?:suicid\w*|autolesion\w*)\b/,
  /\b(?:prevencion|investigacion|estadisticas?|estudio)\b.{0,100}\b(?:suicid\w*|autolesion\w*)\b/,
];

const KILLING_INTENT_PATTERN = /\b(?:quiero|quisiera|deseo|desearia|voy\s+a|pienso(?:\s+en)?|estoy\s+pensando\s+en|he\s+pensado\s+en|planeo|he\s+planeado|pretendo|intentare|necesito|tengo\s+ganas\s+de|tengo\s+un\s+plan\s+para|tengo\s+(?:pensamientos?|ideas?)\s+de)\s+(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const FUTURE_KILLING_PATTERN = /\b(?:matare|asesinare)(los|las|les|nos|me|te|lo|la)?\b/;
const CONCISE_KILLING_PATTERN = /^(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const COORDINATED_KILLING_PATTERN = /\b(?:y\s+tambien|y|ademas)\s+(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const PREPOSED_KILLING_PATTERN = /\b(?:lo|la|los|las|te|les)\s+(?:quiero|quisiera|voy\s+a|pienso|planeo|pretendo)\s+(?:matar|asesinar)\b/;
const BENIGN_KILLING_OBJECT_PATTERN = /^(?:(?:al|a)\s+)?(?:(?:el|la|los|las|un|una|unos|unas|mi|mis|tu|tus|su|sus|este|esta|estos|estas|ese|esa|esos|esas)\s+)?(?:tiempo|rato|hambre|sed|curiosidad|aburrimiento|mosquitos?|moscas?|cucarachas?|aranas?|hormigas?|insectos?|plagas?|bacterias?|virus|germenes?|procesos?|programas?|aplicaciones?|apps?|servicios?|servidores?|hilos?|tareas?|conexiones?|puertos?|contenedores?|scripts?|comandos?|zombis?|monstruos?|personajes?|dos\s+pajaros)\b/;
const GAME_CONTEXT_PATTERN = /\b(?:videojuego|partida|gaming)\b/;
const GAME_KILLING_OBJECT_PATTERN = /^(?:(?:al|a)\s+)?(?:(?:el|la|los|las|un|una|unos|unas)\s+)?(?:enemigos?|jefes?|boss|zombis?|monstruos?|personajes?)\b/;
const IMPLICIT_COORDINATED_TARGET_PATTERN = /\b(?:y(?:\s+luego|\s+tambien)?|ademas)\s+((?:al|a)\s+(?:(?:mi|mis|tu|tus|su|sus|un|una|el|la|los|las|todo|toda|todos|todas)\s+)?[a-z]+(?:\s+[a-z]+)?)\s*$/;

function findAllMatches(text, pattern) {
  return [...text.matchAll(new RegExp(pattern.source, 'g'))];
}

function matchSignalsKillingIntent(segment, match) {
  if (!match) return false;
  if (match[1]) return true;

  const remainder = segment
    .slice((match.index ?? 0) + match[0].length)
    .trim();
  const immediateObject = remainder
    .split(/\s*(?:,|\bpero\b|\bsin\s+embargo\b|\baunque\b|\by(?:\s+luego|\s+tambien)?\b|\bademas\b)\s*/)[0]
    .trim();

  if (!immediateObject) return true;
  if (BENIGN_KILLING_OBJECT_PATTERN.test(immediateObject)) return false;
  if (GAME_CONTEXT_PATTERN.test(segment) && GAME_KILLING_OBJECT_PATTERN.test(immediateObject)) return false;
  return true;
}

function containsExplicitKillingIntent(segment) {
  if (PREPOSED_KILLING_PATTERN.test(segment)) return true;

  const intentMatches = findAllMatches(segment, KILLING_INTENT_PATTERN);
  const futureMatches = findAllMatches(segment, FUTURE_KILLING_PATTERN);
  const conciseMatch = segment.match(CONCISE_KILLING_PATTERN);
  const hasExplicitKillingVerb = intentMatches.length > 0 || futureMatches.length > 0 || Boolean(conciseMatch);

  if (intentMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;
  if (futureMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;
  if (matchSignalsKillingIntent(segment, conciseMatch)) return true;

  if (hasExplicitKillingVerb) {
    const coordinatedMatches = findAllMatches(segment, COORDINATED_KILLING_PATTERN);
    if (coordinatedMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;

    const implicitTarget = segment.match(IMPLICIT_COORDINATED_TARGET_PATTERN)?.[1];
    if (
      implicitTarget
      && !BENIGN_KILLING_OBJECT_PATTERN.test(implicitTarget)
      && !(GAME_CONTEXT_PATTERN.test(segment) && GAME_KILLING_OBJECT_PATTERN.test(implicitTarget))
    ) {
      return true;
    }
  }

  return false;
}

function normalizeCrisisText(text) {
  if (typeof text !== 'string') return '';

  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function containsCrisisLanguage(text) {
  const normalized = normalizeCrisisText(text);
  if (!normalized) return false;

  const segments = normalized
    .split(/[.!?;\n]+/)
    .map(segment => segment.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '').trim())
    .filter(Boolean);

  return segments.some(segment => {
    if (DIRECT_CRISIS_PATTERNS.some(pattern => pattern.test(segment))) return true;
    if (containsExplicitKillingIntent(segment)) return true;

    if (['no quiero seguir', 'desaparecer', 'morir', 'matar', 'asesinar'].includes(segment)) {
      return true;
    }

    if (INFORMATIONAL_CONTEXT_PATTERNS.some(pattern => pattern.test(segment))) return false;

    return CRISIS_TERM_PATTERNS.some(pattern => pattern.test(segment));
  });
}

module.exports = { containsCrisisLanguage };
