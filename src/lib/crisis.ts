// Keep this client-side detector aligned with backend/src/crisis.js so the
// emergency modal can open immediately, before a network response arrives.
const directCrisisPatterns = [
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

const crisisTermPatterns = [
  /\bsuicid\w*\b/,
  /\bautolesion\w*\b/,
];

const informationalContextPatterns = [
  /\b(?:pelicula|serie|libro|documental|articulo|noticia|clase|tarea|ensayo|obra|cancion|podcast|video)\b.{0,100}\b(?:trata|habla|analiza|menciona|es)\b.{0,100}\b(?:suicid\w*|autolesion\w*)\b/,
  /\b(?:prevencion|investigacion|estadisticas?|estudio)\b.{0,100}\b(?:suicid\w*|autolesion\w*)\b/,
];

const killingIntentPattern = /\b(?:quiero|quisiera|deseo|desearia|voy\s+a|pienso(?:\s+en)?|estoy\s+pensando\s+en|he\s+pensado\s+en|planeo|he\s+planeado|pretendo|intentare|necesito|tengo\s+ganas\s+de|tengo\s+un\s+plan\s+para|tengo\s+(?:pensamientos?|ideas?)\s+de)\s+(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const futureKillingPattern = /\b(?:matare|asesinare)(los|las|les|nos|me|te|lo|la)?\b/;
const conciseKillingPattern = /^(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const coordinatedKillingPattern = /\b(?:y\s+tambien|y|ademas)\s+(?:matar|asesinar)(los|las|les|nos|me|te|lo|la)?\b/;
const preposedKillingPattern = /\b(?:lo|la|los|las|te|les)\s+(?:quiero|quisiera|voy\s+a|pienso|planeo|pretendo)\s+(?:matar|asesinar)\b/;
const benignKillingObjectPattern = /^(?:(?:al|a)\s+)?(?:(?:el|la|los|las|un|una|unos|unas|mi|mis|tu|tus|su|sus|este|esta|estos|estas|ese|esa|esos|esas)\s+)?(?:tiempo|rato|hambre|sed|curiosidad|aburrimiento|mosquitos?|moscas?|cucarachas?|aranas?|hormigas?|insectos?|plagas?|bacterias?|virus|germenes?|procesos?|programas?|aplicaciones?|apps?|servicios?|servidores?|hilos?|tareas?|conexiones?|puertos?|contenedores?|scripts?|comandos?|zombis?|monstruos?|personajes?|dos\s+pajaros)\b/;
const gameContextPattern = /\b(?:videojuego|partida|gaming)\b/;
const gameKillingObjectPattern = /^(?:(?:al|a)\s+)?(?:(?:el|la|los|las|un|una|unos|unas)\s+)?(?:enemigos?|jefes?|boss|zombis?|monstruos?|personajes?)\b/;
const implicitCoordinatedTargetPattern = /\b(?:y(?:\s+luego|\s+tambien)?|ademas)\s+((?:al|a)\s+(?:(?:mi|mis|tu|tus|su|sus|un|una|el|la|los|las|todo|toda|todos|todas)\s+)?[a-z]+(?:\s+[a-z]+)?)\s*$/;

function findAllMatches(text: string, pattern: RegExp): RegExpMatchArray[] {
  return [...text.matchAll(new RegExp(pattern.source, "g"))];
}

function matchSignalsKillingIntent(segment: string, match: RegExpMatchArray | null): boolean {
  if (!match) return false;
  if (match[1]) return true;

  const remainder = segment
    .slice((match.index ?? 0) + match[0].length)
    .trim();
  const immediateObject = remainder
    .split(/\s*(?:,|\bpero\b|\bsin\s+embargo\b|\baunque\b|\by(?:\s+luego|\s+tambien)?\b|\bademas\b)\s*/)[0]
    .trim();

  if (!immediateObject) return true;
  if (benignKillingObjectPattern.test(immediateObject)) return false;
  if (gameContextPattern.test(segment) && gameKillingObjectPattern.test(immediateObject)) return false;
  return true;
}

function containsExplicitKillingIntent(segment: string): boolean {
  if (preposedKillingPattern.test(segment)) return true;

  const intentMatches = findAllMatches(segment, killingIntentPattern);
  const futureMatches = findAllMatches(segment, futureKillingPattern);
  const conciseMatch = segment.match(conciseKillingPattern);
  const hasExplicitKillingVerb = intentMatches.length > 0 || futureMatches.length > 0 || Boolean(conciseMatch);

  if (intentMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;
  if (futureMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;
  if (matchSignalsKillingIntent(segment, conciseMatch)) return true;

  if (hasExplicitKillingVerb) {
    const coordinatedMatches = findAllMatches(segment, coordinatedKillingPattern);
    if (coordinatedMatches.some(match => matchSignalsKillingIntent(segment, match))) return true;

    const implicitTarget = segment.match(implicitCoordinatedTargetPattern)?.[1];
    if (
      implicitTarget
      && !benignKillingObjectPattern.test(implicitTarget)
      && !(gameContextPattern.test(segment) && gameKillingObjectPattern.test(implicitTarget))
    ) {
      return true;
    }
  }

  return false;
}

export function normalizeCrisisText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function containsCrisisLanguage(text: string): boolean {
  const normalized = normalizeCrisisText(text);
  if (!normalized) return false;

  const segments = normalized
    .split(/[.!?;\n]+/)
    .map(segment => segment.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, "").trim())
    .filter(Boolean);

  return segments.some(segment => {
    if (directCrisisPatterns.some(pattern => pattern.test(segment))) return true;
    if (containsExplicitKillingIntent(segment)) return true;

    if (["no quiero seguir", "desaparecer", "morir", "matar", "asesinar"].includes(segment)) {
      return true;
    }

    if (informationalContextPatterns.some(pattern => pattern.test(segment))) return false;

    return crisisTermPatterns.some(pattern => pattern.test(segment));
  });
}
