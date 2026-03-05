export interface Player {
  id: string;
  name: string;
  fullName: string;
  country: string;
  countryId: string;
  flagCode: string;
  position: "GK" | "DEF" | "MID" | "FWD";
  era: "historic" | "current";
  number: number;
  birthYear: number;
  overall: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  wc_participaciones: number;
  wc_goles: number;
  wc_partidos: number;
  wc_titulos: string;
  // Image via Wikipedia API thumbnail — more reliable than direct wikimedia hotlinks
  wikiTitle: string;
}

export const players: Player[] = [
  {
    id: "pele",
    name: "PELÉ",
    fullName: "Edson Arantes do Nascimento",
    country: "Brasil",
    countryId: "brazil",
    flagCode: "br",
    position: "FWD",
    era: "historic",
    number: 10,
    birthYear: 1940,
    overall: 99,
    pace: 95,
    shooting: 99,
    passing: 92,
    dribbling: 99,
    defending: 45,
    physical: 88,
    wc_participaciones: 4,
    wc_goles: 12,
    wc_partidos: 14,
    wc_titulos: "3x Campeón",
    wikiTitle: "Pelé",
  },
  {
    id: "maradona",
    name: "MARADONA",
    fullName: "Diego Armando Maradona",
    country: "Argentina",
    countryId: "argentina",
    flagCode: "ar",
    position: "FWD",
    era: "historic",
    number: 10,
    birthYear: 1960,
    overall: 99,
    pace: 92,
    shooting: 94,
    passing: 95,
    dribbling: 99,
    defending: 52,
    physical: 80,
    wc_participaciones: 4,
    wc_goles: 8,
    wc_partidos: 21,
    wc_titulos: "1x Campeón",
    wikiTitle: "Diego_Maradona",
  },
  {
    id: "ronaldo_r9",
    name: "RONALDO R9",
    fullName: "Ronaldo Luís Nazário de Lima",
    country: "Brasil",
    countryId: "brazil",
    flagCode: "br",
    position: "FWD",
    era: "historic",
    number: 9,
    birthYear: 1976,
    overall: 98,
    pace: 99,
    shooting: 98,
    passing: 85,
    dribbling: 97,
    defending: 30,
    physical: 90,
    wc_participaciones: 3,
    wc_goles: 15,
    wc_partidos: 19,
    wc_titulos: "2x Campeón",
    wikiTitle: "Ronaldo_(Brazilian_footballer)",
  },
  {
    id: "zidane",
    name: "ZIDANE",
    fullName: "Zinedine Zidane",
    country: "Francia",
    countryId: "france",
    flagCode: "fr",
    position: "MID",
    era: "historic",
    number: 10,
    birthYear: 1972,
    overall: 98,
    pace: 78,
    shooting: 87,
    passing: 97,
    dribbling: 98,
    defending: 65,
    physical: 82,
    wc_participaciones: 3,
    wc_goles: 5,
    wc_partidos: 12,
    wc_titulos: "1x Campeón",
    wikiTitle: "Zinedine_Zidane",
  },
  {
    id: "messi",
    name: "MESSI",
    fullName: "Lionel Andrés Messi",
    country: "Argentina",
    countryId: "argentina",
    flagCode: "ar",
    position: "FWD",
    era: "historic",
    number: 10,
    birthYear: 1987,
    overall: 99,
    pace: 88,
    shooting: 96,
    passing: 99,
    dribbling: 99,
    defending: 40,
    physical: 76,
    wc_participaciones: 5,
    wc_goles: 13,
    wc_partidos: 26,
    wc_titulos: "1x Campeón",
    wikiTitle: "Lionel_Messi",
  },
  {
    id: "beckenbauer",
    name: "BECKENBAUER",
    fullName: "Franz Anton Beckenbauer",
    country: "Alemania",
    countryId: "germany",
    flagCode: "de",
    position: "DEF",
    era: "historic",
    number: 5,
    birthYear: 1945,
    overall: 97,
    pace: 72,
    shooting: 72,
    passing: 90,
    dribbling: 82,
    defending: 98,
    physical: 80,
    wc_participaciones: 4,
    wc_goles: 4,
    wc_partidos: 18,
    wc_titulos: "1x Campeón",
    wikiTitle: "Franz_Beckenbauer",
  },
  {
    id: "cruyff",
    name: "CRUYFF",
    fullName: "Hendrik Johannes Cruyff",
    country: "Países Bajos",
    countryId: "netherlands",
    flagCode: "nl",
    position: "FWD",
    era: "historic",
    number: 14,
    birthYear: 1947,
    overall: 97,
    pace: 90,
    shooting: 88,
    passing: 95,
    dribbling: 97,
    defending: 60,
    physical: 75,
    wc_participaciones: 1,
    wc_goles: 3,
    wc_partidos: 7,
    wc_titulos: "1x Subcampeón",
    wikiTitle: "Johan_Cruyff",
  },
  {
    id: "ronaldo_cr7",
    name: "C. RONALDO",
    fullName: "Cristiano Ronaldo dos Santos Aveiro",
    country: "Portugal",
    countryId: "portugal",
    flagCode: "pt",
    position: "FWD",
    era: "historic",
    number: 7,
    birthYear: 1985,
    overall: 97,
    pace: 91,
    shooting: 97,
    passing: 82,
    dribbling: 95,
    defending: 35,
    physical: 93,
    wc_participaciones: 5,
    wc_goles: 8,
    wc_partidos: 22,
    wc_titulos: "—",
    wikiTitle: "Cristiano_Ronaldo",
  },
  {
    id: "mbappe",
    name: "MBAPPÉ",
    fullName: "Kylian Mbappé Lottin",
    country: "Francia",
    countryId: "france",
    flagCode: "fr",
    position: "FWD",
    era: "current",
    number: 10,
    birthYear: 1998,
    overall: 96,
    pace: 99,
    shooting: 94,
    passing: 82,
    dribbling: 95,
    defending: 38,
    physical: 82,
    wc_participaciones: 2,
    wc_goles: 12,
    wc_partidos: 14,
    wc_titulos: "1x Campeón",
    wikiTitle: "Kylian_Mbappé",
  },
  {
    id: "vinicius",
    name: "VINÍCIUS JR.",
    fullName: "Vinícius José Paixão de Oliveira Júnior",
    country: "Brasil",
    countryId: "brazil",
    flagCode: "br",
    position: "FWD",
    era: "current",
    number: 7,
    birthYear: 2000,
    overall: 93,
    pace: 97,
    shooting: 88,
    passing: 81,
    dribbling: 97,
    defending: 32,
    physical: 75,
    wc_participaciones: 1,
    wc_goles: 3,
    wc_partidos: 7,
    wc_titulos: "—",
    wikiTitle: "Vinícius_Júnior",
  },
  {
    id: "bellingham",
    name: "BELLINGHAM",
    fullName: "Jude Victor William Bellingham",
    country: "Inglaterra",
    countryId: "england",
    flagCode: "gb-eng",
    position: "MID",
    era: "current",
    number: 10,
    birthYear: 2003,
    overall: 93,
    pace: 85,
    shooting: 88,
    passing: 88,
    dribbling: 90,
    defending: 82,
    physical: 88,
    wc_participaciones: 1,
    wc_goles: 3,
    wc_partidos: 7,
    wc_titulos: "—",
    wikiTitle: "Jude_Bellingham",
  },
  {
    id: "modric",
    name: "MODRIĆ",
    fullName: "Luka Modrić",
    country: "Croacia",
    countryId: "croatia",
    flagCode: "hr",
    position: "MID",
    era: "current",
    number: 10,
    birthYear: 1985,
    overall: 93,
    pace: 78,
    shooting: 80,
    passing: 95,
    dribbling: 93,
    defending: 78,
    physical: 73,
    wc_participaciones: 4,
    wc_goles: 2,
    wc_partidos: 17,
    wc_titulos: "1x Subcampeón",
    wikiTitle: "Luka_Modrić",
  },
  {
    id: "haaland",
    name: "HAALAND",
    fullName: "Erling Braut Haaland",
    country: "Noruega",
    countryId: "norway",
    flagCode: "no",
    position: "FWD",
    era: "current",
    number: 9,
    birthYear: 2000,
    overall: 95,
    pace: 89,
    shooting: 98,
    passing: 70,
    dribbling: 82,
    defending: 45,
    physical: 97,
    wc_participaciones: 0,
    wc_goles: 0,
    wc_partidos: 0,
    wc_titulos: "—",
    wikiTitle: "Erling_Haaland",
  },
];

// ─── MANAGERS ─────────────────────────────────────────────────────────────────

export interface ManagerDef {
  id: string;
  name: string;
  role: string;
  // weight: higher = more likely to appear (Bilardo/Ruggeri get 3, others 1)
  weight: number;
  accentColor: string; // tailwind border color class
  tagColor: string;    // tailwind text+bg class
  initials: string;
}

export const ALL_MANAGERS: ManagerDef[] = [
  {
    id: "bilardo",
    name: "BILARDO",
    role: "DT Argentina · Campeón del Mundo 1986",
    weight: 3,
    accentColor: "border-blue-500",
    tagColor: "text-blue-400 bg-blue-500/10",
    initials: "CB",
  },
  {
    id: "ruggeri",
    name: "RUGGERI",
    role: "Defensor · Campeón del Mundo 1986",
    weight: 3,
    accentColor: "border-amber-500",
    tagColor: "text-amber-400 bg-amber-500/10",
    initials: "OR",
  },
  {
    id: "scaloni",
    name: "SCALONI",
    role: "DT Argentina · Campeón del Mundo 2022",
    weight: 2,
    accentColor: "border-sky-400",
    tagColor: "text-sky-400 bg-sky-500/10",
    initials: "LS",
  },
  {
    id: "mourinho",
    name: "MOURINHO",
    role: "The Special One · 3 ligas distintas",
    weight: 1,
    accentColor: "border-slate-400",
    tagColor: "text-slate-300 bg-slate-500/10",
    initials: "JM",
  },
  {
    id: "guardiola",
    name: "GUARDIOLA",
    role: "DT Manchester City · 3x Champions",
    weight: 1,
    accentColor: "border-red-400",
    tagColor: "text-red-400 bg-red-500/10",
    initials: "PG",
  },
  {
    id: "piojo",
    name: "EL PIOJO",
    role: "DT · Mundialista México 1994",
    weight: 1,
    accentColor: "border-green-500",
    tagColor: "text-green-400 bg-green-500/10",
    initials: "PH",
  },
  {
    id: "alfaro",
    name: "ALFARO",
    role: "DT · Boca, Ecuador, Paraguay",
    weight: 1,
    accentColor: "border-yellow-500",
    tagColor: "text-yellow-400 bg-yellow-500/10",
    initials: "GA",
  },
  {
    id: "cr7_analyst",
    name: "C. RONALDO",
    role: "Jugador · 5 Balones de Oro",
    weight: 1,
    accentColor: "border-emerald-400",
    tagColor: "text-emerald-400 bg-emerald-500/10",
    initials: "CR",
  },
];

// Weighted random selection: picks 2–4 unique managers biased toward high-weight ones
export function pickRandomManagers(count: number = 3): ManagerDef[] {
  const pool: ManagerDef[] = [];
  ALL_MANAGERS.forEach((m) => {
    for (let i = 0; i < m.weight; i++) pool.push(m);
  });

  const selected: ManagerDef[] = [];
  const usedIds = new Set<string>();

  // Always include Bilardo or Ruggeri first
  const priority = ALL_MANAGERS.filter((m) => m.id === "bilardo" || m.id === "ruggeri");
  const first = priority[Math.floor(Math.random() * priority.length)];
  selected.push(first);
  usedIds.add(first.id);

  // Fill rest via weighted random
  let attempts = 0;
  while (selected.length < count && attempts < 100) {
    attempts++;
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (!usedIds.has(candidate.id)) {
      selected.push(candidate);
      usedIds.add(candidate.id);
    }
  }

  return selected;
}

// ─── QUOTES DATABASE ──────────────────────────────────────────────────────────

type QuotesDB = Record<string, Record<string, string[]>>;

export const quotesDB: QuotesDB = {
  bilardo: {
    pele: [
      "Pelé era un jugador total. No había forma de marcarlo con un solo hombre.",
      "Lo vi jugar en el 70. Era imparable. Y eso que mis equipos se preparaban para todo.",
      "Tres mundiales. Eso no es suerte, eso es ser el mejor.",
    ],
    maradona: [
      "Diego no necesitaba táctica. Él era la táctica.",
      "En el 86, con Diego, los once jugábamos para él. Y valía la pena.",
      "Era impredecible. Ni él sabía lo que iba a hacer. Eso es lo peor para un rival.",
    ],
    messi: [
      "Lionel tiene algo que no se enseña. Con él en cancha, el equipo no necesita crear.",
      "En Qatar lo vi completo. Lo más parecido a Diego que vi en mucho tiempo.",
      "No es que corra mucho. Es que siempre está donde tiene que estar.",
    ],
    ronaldo_r9: [
      "Ronaldo era peligroso porque en dos pasos te dejaba frente al arquero.",
      "Físico, técnica y velocidad en el mismo jugador. Un problema serio para cualquier defensa.",
      "El mejor nueve que vi jugar un mundial. Ocho goles en Corea-Japón no los hace cualquiera.",
    ],
    mbappe: [
      "Hay que cerrarlo antes de que arranque. Si llega al área, ya está.",
      "En la final del 22, casi nos gana él solo. Eso dice todo.",
    ],
    haaland: [
      "Dentro del área es letal. Hay que sacarlo del juego antes del último pase.",
      "No tiene la gambeta de los grandes, pero el físico y el gol lo hacen muy difícil de contener.",
    ],
    beckenbauer: [
      "Beckenbauer era defensor pero jugaba como mediocampista. Eso te desordenaba el esquema.",
      "Un jugador que construía y defendía. En mi sistema habría sido clave.",
    ],
    cruyff: [
      "Cruyff era técnico y rápido. El tipo de jugador que te hace quedar mal si no lo seguís bien.",
      "El Ajax de Cruyff era difícil de marcar porque todos se movían. Tácticamente era un problema.",
    ],
    default: [
      "Hay que estudiarlo bien. Ningún jugador es invencible si lo analizás.",
      "El talento importa, pero sin trabajo táctico no alcanza.",
      "Todo jugador tiene un punto débil. Hay que encontrarlo.",
    ],
  },
  ruggeri: {
    pele: [
      "Pelé es la referencia. Tres mundiales ganados. No hay más que decir.",
      "Lo estudié de grande. Era completo en todo. Imposible encuadrarlo en un solo concepto.",
    ],
    maradona: [
      "Jugué con Diego años. Te daba la pelota y ya sabías que algo iba a pasar.",
      "En el 86 fue el mejor de la historia en un mundial. Punto. No hay discusión.",
      "Diego te hacía ganar partidos que no te correspondían. Eso es lo más difícil de explicar.",
    ],
    messi: [
      "Leo es diferente. Lo ves correr y parece tranquilo, y de repente está en el área.",
      "Qatar fue hermoso. Ver a Leo levantar la Copa fue lo más lindo que vi desde el 86.",
      "No hablar bien de Messi es no entender de fútbol.",
    ],
    beckenbauer: [
      "Beckenbauer era el defensor que todo DT sueña. Jugaba y defendía igual de bien.",
      "Construía desde atrás como nadie. En mi época eso era rarísimo.",
    ],
    haaland: [
      "Un nueve así te rompe la línea si te descuidás un segundo.",
      "Potente, rápido para ser tan grande. Hoy sería muy difícil marcarlo mano a mano.",
      "Si me ponen a marcar a Haaland hoy, lo primero que hago es hablar con el DT para que no me lo pongan.",
    ],
    mbappe: [
      "Ese chico corre como el demonio. Imaginate marcarlo en una final de mundial.",
      "La velocidad que tiene es un problema serio para cualquier defensa. Nadie le gana.",
    ],
    cruyff: [
      "Cruyff te sacaba con un movimiento. Te miraba para un lado y salía para el otro.",
      "Un tipo que te hacía quedar mal aunque estuvieras bien parado.",
    ],
    ronaldo_r9: [
      "Ronaldo tenía un primer paso que no lo vi en nadie más. Era una explosión.",
      "Dos mundiales ganados. El mejor delantero que produjo Brasil después de Pelé.",
    ],
    default: [
      "Lo importante es el trabajo. El talento sin sacrificio no llega lejos.",
      "Hay jugadores que se ven bien pero en los partidos difíciles desaparecen. Ese es el filtro real.",
      "En un mundial, el que no está al 100% en cada pelota, pierde.",
    ],
  },
  scaloni: {
    pele: [
      "Pelé es la referencia histórica máxima. Tres mundiales hablan solos.",
      "Cuando hablo de legado con el grupo, siempre aparece su nombre.",
    ],
    maradona: [
      "Diego es nuestra historia. Lo que hizo en el 86 no se puede explicar, solo se siente.",
      "Cada vez que entro a la cancha con Argentina, pienso en lo que él construyó.",
    ],
    messi: [
      "Con Leo trabajé años. Lo que más me sorprende es su capacidad de leer el juego antes que nadie.",
      "Qatar fue la culminación de todo. El mejor jugador de la historia, coronado campeón del mundo.",
      "Lo que hizo Leo en ese mundial no lo voy a olvidar nunca en mi vida.",
    ],
    mbappe: [
      "Kylian es un jugador diferencial. En la final del 22 lo sufrimos directamente.",
      "Tiene todo para ser el mejor de su generación. Hay que prepararse bien para enfrentarlo.",
    ],
    bellingham: [
      "Bellingham tiene temperamento de líder a una edad muy joven. Es un jugador completo.",
      "Lo seguí mucho. Es el tipo que marca diferencia en los partidos clave.",
    ],
    modric: [
      "Modrić es un ejemplo de madurez futbolística. Lo enfrenté como DT y siempre me complicó.",
      "Todavía rindiendo al máximo nivel a su edad. Eso dice mucho de su cabeza.",
    ],
    vinicius: [
      "Vinícius es muy difícil de controlar en transición. Rápido y con buen uno contra uno.",
      "Brasil lo tiene bien posicionado para el próximo mundial.",
    ],
    default: [
      "Es un jugador que hay que analizar antes de enfrentarlo.",
      "El fútbol de alto nivel requiere preparación. Cada jugador tiene algo que explotar.",
    ],
  },
  mourinho: {
    pele: [
      "Pelé ganó tres mundiales. Eso es trabajo. Los demás son turistas.",
      "Si yo hubiera entrenado a Pelé, habría ganado cinco mundiales. Pero él no me necesitaba.",
    ],
    maradona: [
      "Maradona era impredecible. No se puede entrenar eso. Solo se puede observar y rezar.",
      "Con la mano de Dios o sin ella, ese gol al 86 es el más humano que vi en mi vida.",
    ],
    messi: [
      "He gastado más tiempo estudiando a Messi que a mis propios jugadores. Y aún no lo entiendo.",
      "El hombre hace que el fútbol parezca injusto. Y yo soy el experto en injusticia.",
    ],
    haaland: [
      "Haaland no juega al fútbol, ejecuta algoritmos de gol. Inquietante.",
      "Le puse a mi analista a estudiar sus movimientos. El analista pidió vacaciones.",
    ],
    mbappe: [
      "Mbappé corre más rápido que mis estrategias. Y eso me molesta profundamente.",
      "Necesito un bus de dos pisos para pararlo. Lo digo sin ironía.",
    ],
    ronaldo_cr7: [
      "Cristiano es una obra de arte de la autodisciplina. Tácticamente mejorable. Mentalmente, imposible.",
      "Trabaja más que nadie. Si tuviera más talento natural, sería injusto para el fútbol.",
    ],
    default: [
      "Tácticamente interesante. Pero yo lo habría usado de otra manera.",
      "Los Mundiales se ganan con estructura. El talento individual es secundario.",
      "¿Mundiales ganados? Eso es lo único que importa en este deporte.",
    ],
  },
  guardiola: {
    messi: [
      "Messi es la personificación de todo lo que el fútbol puede ser. Un regalo.",
      "En el Barça, el sistema era para él. No al revés. Y así ganamos todo.",
    ],
    cruyff: [
      "Cruyff me enseñó todo. Sin él, yo no existiría como entrenador.",
      "El Total Football era la idea más avanzada de su época. Todavía lo es.",
    ],
    mbappe: [
      "La transición de Mbappé del pressing al contragolpe es clínicamente perfecta.",
      "Sus números de cobertura de distancia son los mejores de la historia. Puro dato.",
    ],
    modric: [
      "Modrić gestiona el tiempo del partido como nadie. Tres segundos más o menos. Matemática.",
      "Técnicamente es un reloj suizo. Nunca falla el timing.",
    ],
    bellingham: [
      "Bellingham tiene algo que muy pocos tienen: juega sin miedo al espacio.",
      "Un centrocampista que llega al área y define. En mi sistema sería fundamental.",
    ],
    haaland: [
      "Con Haaland entendí que el nueve puro todavía existe. Solo hay que construir para él.",
      "Sus números hablan solos. Lo que me interesa es el movimiento sin balón.",
    ],
    default: [
      "Posicionalmente hay cosas que mejorar. Tácticamente hay mucho por trabajar.",
      "El movimiento sin balón es lo que me interesa. Aquí hay potencial.",
    ],
  },
  piojo: {
    messi: [
      "Leo es lo más grande que vi jugar. Y eso que yo viví el 86 como jugador.",
      "En México seguimos a Messi partido a partido. Es inspiración para toda una generación.",
    ],
    maradona: [
      "Diego era otro nivel. En México lo veíamos como un dios, no como un jugador.",
      "El 86 lo viví de cerca. Diego solo nos sacaba adelante a todos.",
    ],
    mbappe: [
      "Mbappé me recuerda a Ronaldo R9 en velocidad pura. Muy difícil de contener.",
      "Ese chico tiene todo para dominar el fútbol mundial los próximos diez años.",
    ],
    ronaldo_r9: [
      "Ronaldo R9 era el delantero que todos queríamos ver. Gol, velocidad, gambeta.",
      "En el 98 y en el 2002 fue el mejor del mundo. Dos mundiales distintos, mismo nivel.",
    ],
    default: [
      "En México siempre vimos el fútbol con pasión. Y este jugador tiene lo que se necesita.",
      "El talento se entrena. Lo que no se puede entrenar es la actitud.",
      "Cada vez que lo veo jugar me recuerda por qué amo este deporte.",
    ],
  },
  alfaro: {
    messi: [
      "Messi es Messi. Punto. No hay análisis que alcance para describirlo.",
      "Lo enfrenté con mis equipos. Cada vez te enseña algo nuevo.",
    ],
    maradona: [
      "Diego era único. En Argentina todos crecimos mirándolo como una leyenda.",
      "Hablar de Maradona en Argentina es hablar de identidad. Va más allá del fútbol.",
    ],
    haaland: [
      "Haaland es el tipo de delantero que te quita el sueño como entrenador. Sin exagerar.",
      "Potencia, definición, movimiento. Es el nueve más completo de la actualidad.",
    ],
    mbappe: [
      "Mbappé tiene una mentalidad ganadora que se ve en cada partido. Eso no se compra.",
      "La velocidad en el primer paso es lo más difícil de neutralizar. Hay que anticiparse.",
    ],
    default: [
      "Hay que prepararse bien para enfrentar jugadores de este nivel.",
      "El trabajo colectivo puede reducir el impacto individual. Pero hay que hacerlo bien.",
      "Este tipo de jugadores te ponen a prueba como entrenador. Y eso me gusta.",
    ],
  },
  cr7_analyst: {
    messi: [
      "Messi es muy buen jugador. Yo también soy muy buen jugador.",
      "Ganó un mundial. Yo gané muchas otras cosas. Cada uno tiene su palmarés.",
    ],
    pele: [
      "Pelé es una leyenda histórica. Pero las épocas no se comparan.",
      "El fútbol de hoy es más físico, más táctico. Los números hablan de contexto.",
    ],
    maradona: [
      "Diego fue grande. Pero no jugó en la era del pressing y el análisis de datos.",
      "Respeto su legado. Pero el fútbol moderno exige más en todos los aspectos.",
    ],
    haaland: [
      "Haaland tiene números increíbles. Pero todavía no demostró en un mundial.",
      "La Champions y los mundiales son distintos. Hay que esperarlo en la máxima presión.",
    ],
    mbappe: [
      "Kylian es un jugador extraordinario. Le deseo lo mejor... fuera de mi posición.",
      "La velocidad que tiene es natural. Lo que no es natural es la cantidad de goles.",
    ],
    default: [
      "Buenas estadísticas. Pero las estadísticas no dicen todo.",
      "Hay que ver cómo rinde en los momentos que realmente importan.",
      "El talento es el punto de partida. El trabajo define quién llega más lejos.",
    ],
  },
};

// Helper to get a specific comment for a manager+player combo
export function getComment(managerId: string, playerId: string, index: number): string {
  const managerQuotes = quotesDB[managerId];
  if (!managerQuotes) return "Sin comentarios disponibles.";
  const pool = managerQuotes[playerId] ?? managerQuotes["default"] ?? ["Sin comentarios."];
  return pool[index % pool.length];
}
