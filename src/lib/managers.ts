import { Manager, ManagerId, Prediction } from "./types";
import { getHistoricalContext } from "@/data/footballDB";

/** Emoji fallbacks when no image exists at /avatars/{id}.png */
const avatarFallbacks: Record<string, string> = {
  ruggeri: "🦅",
  bilardo: "🧠",
  mourinho: "🖤",
  guardiola: "🔵",
  alfaro: "⚡",
  scaloni: "🏆",
  cristiano: "⚽",
  piojo: "🦜",
};

export const managers: Manager[] = [
  { id: "ruggeri", name: "Óscar Ruggeri", shortName: "Ruggeri", avatar: "/avatars/ruggeri.png", color: "#1a5fb4", quote: "El que no corre, vuela." },
  { id: "bilardo", name: "Carlos Bilardo", shortName: "Bilardo", avatar: "/avatars/bilardo.png", color: "#2ec27e", quote: "Primero ganar, después jugar." },
  { id: "mourinho", name: "José Mourinho", shortName: "Mourinho", avatar: "/avatars/mourinho.png", color: "#e01e24", quote: "I am the Special One." },
  { id: "guardiola", name: "Pep Guardiola", shortName: "Guardiola", avatar: "/avatars/guardiola.png", color: "#3584e4", quote: "Tiki-taka is philosophy." },
  { id: "alfaro", name: "Gustavo Alfaro", shortName: "Alfaro", avatar: "/avatars/alfaro.png", color: "#986a44", quote: "Orden, sacrificio y garra." },
  { id: "scaloni", name: "Lionel Scaloni", shortName: "Scaloni", avatar: "/avatars/scaloni.png", color: "#c64600", quote: "Grupo, humildad, trabajo." },
  { id: "cristiano", name: "Cristiano (Ronaldo)", shortName: "Cristiano", avatar: "/avatars/cristiano.png", color: "#f66151", quote: "SIUUUUU!" },
  { id: "piojo", name: '"Piojo" Herrera', shortName: "Piojo", avatar: "/avatars/piojo.png", color: "#a347ba", quote: "A darle con todo." },
];

export { avatarFallbacks };

// Spicy phrases per manager - theatrical, screenshotable
const managerPhrases: Record<
  ManagerId,
  { base: [number, number]; phrases: string[] }[]
> = {
  ruggeri: [
    { base: [2, 1], phrases: ["¡Este equipo le va a dar duro! Ya lo tengo calculado.", "Si no ganan por dos, que se vayan a entrenar de nuevo.", "Mirá, yo sé de fútbol. Va a ser 2-1 y punto."] },
    { base: [1, 0], phrases: ["Ganamos de pedo pero ganamos. Así se hace.", "1-0 y a la mierda. Eso es fútbol argentino.", "Un gol alcanza. El resto es verso."] },
    { base: [2, 2], phrases: ["Van a empatar bien 2-2. Ambos van a sufrir.", "Empate deportivo, pero va a ser show.", "2-2. Y el que no esté de acuerdo que me contradiga."] },
  ],
  bilardo: [
    { base: [1, 0], phrases: ["Resultado práctico: 1-0. Lo demás es literatura.", "Ganar sin sufrir es de tontos. 1-0 sufriendo.", "Un gol. Cerrar atrás. Bilardismo puro."] },
    { base: [0, 0], phrases: ["Empate 0-0. Táctica perfecta para la vuelta.", "Cero a cero. Nada de locuras. Así se gana un Mundial.", "Empate. Control. Nada de pelotudeces."] },
    { base: [2, 1], phrases: ["2-1 con orden. Primero la estructura.", "Ganamos 2-1. Con método, no con suerte.", "Dos goles nuestros, uno de ellos. Todo calculado."] },
  ],
  mourinho: [
    { base: [2, 1], phrases: ["2-1. I don't need to explain. I'm a winner.", "Respect, respect, respect. 2-1 to us.", "They have the ball. We have the result. 2-1."] },
    { base: [1, 0], phrases: ["Park the bus? We park the trophy. 1-0.", "Small teams celebrate draws. We win 1-0.", "One goal. Clean sheet. Perfect."] },
    { base: [0, 0], phrases: ["0-0 away from home? Tactical masterpiece.", "They attack. We defend. 0-0. Job done.", "A draw that feels like a win. Special."] },
  ],
  guardiola: [
    { base: [3, 1], phrases: ["3-1. Possession, control, goals. Philosophy.", "We play. They run. 3-1. Beautiful.", "Tiki-taka ends in goals. 3-1 today."] },
    { base: [2, 0], phrases: ["2-0. Total control. Zero stress.", "Dominate the ball, dominate the result. 2-0.", "Pure football. 2-0. What else?"] },
    { base: [4, 2], phrases: ["4-2. We attack. They suffer. Football.", "High line, high score. 4-2. No parking.", "We score more. That's the plan. 4-2."] },
  ],
  alfaro: [
    { base: [1, 1], phrases: ["1-1. Orden y garra. No regalamos nada.", "Empate trabajado. Sacrificio de ambos.", "1-1. El que quiera ganar que se mate."] },
    { base: [2, 1], phrases: ["2-1 con garra. Así se juega en Sudamérica.", "Ganamos porque corrimos más. 2-1.", "Orden, sacrificio, 2-1. Alfarismo."] },
    { base: [1, 0], phrases: ["1-0 sufriendo pero ganando. Garra pura.", "Un gol y a bancarla. Así se hace.", "1-0. Orden defensivo. Punto."] },
  ],
  scaloni: [
    { base: [2, 1], phrases: ["2-1. Grupo. Humildad. Trabajo. Ganamos.", "Jugamos como equipo. 2-1 para nosotros.", "Con esta gente se gana. 2-1."] },
    { base: [1, 0], phrases: ["1-0. Simple. Efectivo. Campeón del mundo.", "Un gol alcanza. Confianza en el grupo.", "1-0. No hace falta más."] },
    { base: [2, 2], phrases: ["2-2. Empate justo. Ambos dieron todo.", "Partido parejo. 2-2. Respeto mutuo.", "Empate. Nadie se rindió. 2-2."] },
  ],
  cristiano: [
    { base: [3, 2], phrases: ["3-2. SIUUUUU! I score. We win. Simple.", "Hat-trick energy. 3-2. Believe.", "Goals. Passion. 3-2. Cristiano style."] },
    { base: [2, 1], phrases: ["2-1. I make the difference. Always.", "Two goals from us. One from them. SIUUUU!", "2-1. Champions mentality."] },
    { base: [1, 0], phrases: ["1-0. One goal. One hero. Me.", "Solo un gol. Pero el gol decisivo. 1-0.", "1-0. I deliver when it matters."] },
  ],
  piojo: [
    { base: [2, 1], phrases: ["¡2-1 y a darle con todo! ¡Vamos carajo!", "Ganamos 2-1. ¡A festejar como locos!", "¡2-1! ¡Este equipo tiene huevos!"] },
    { base: [3, 2], phrases: ["¡3-2! ¡Partidazo! ¡A darle con todo!", "Goles, emoción, 3-2. ¡Así se juega!", "¡3-2! ¡Qué partido! ¡Vamos!"] },
    { base: [1, 1], phrases: ["1-1. Empate pero con garra. ¡A darle!", "Empate 1-1. La vuelta será épica.", "1-1. Nada definido. ¡Todo en la vuelta!"] },
  ],
};

// Deterministic hash for user/match/manager combo
function simpleHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

/** Manager-specific historical prefixes when matchup has epic rivalry */
const historicalPrefixes: Record<ManagerId, (events: string[]) => string> = {
  ruggeri: (e) => `Mirá, yo estuve en el 86 y el 90. `,
  bilardo: (e) => `El 86 ganamos, el 90 nos dolió. `,
  mourinho: (e) => `Historia clásica. `,
  guardiola: (e) => `Rivalidad de libro. `,
  alfaro: (e) => `Estos dos se conocen de memoria. `,
  scaloni: (e) => `El 86, el 90, el 2014... esta vez `,
  cristiano: (e) => `Clásico mundialista. `,
  piojo: (e) => `¡Estos dos! ¡Historia pura! `,
};

export function getManagerPrediction(
  managerId: ManagerId,
  matchId: string,
  userId: string = "default",
  match?: { homeTeam: string; awayTeam: string }
): Prediction {
  const pool = managerPhrases[managerId];
  const seed = simpleHash(`${matchId}-${managerId}-${userId}`);
  const index = seed % pool.length;
  const entry = pool[index];
  const phraseIndex = (seed >> 8) % entry.phrases.length;
  let phrase = entry.phrases[phraseIndex];

  // Inject historical reference if matchup has epic rivalry
  if (match) {
    const ctx = getHistoricalContext(match.homeTeam, match.awayTeam);
    if (ctx && ctx.rivalry.events.length > 0) {
      const prefix = historicalPrefixes[managerId](ctx.rivalry.events);
      phrase = prefix + phrase;
    }
  }

  return {
    homeScore: entry.base[0],
    awayScore: entry.base[1],
    phrase,
    managerId,
  };
}
