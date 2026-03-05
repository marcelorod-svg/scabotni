import { ManagerId } from "./types";

export const thinkingLabels: Record<ManagerId, string> = {
  bilardo: "Analizando si el pasto está alto...",
  mourinho: "Aparcando el autobús...",
  piojo: "Peleándose con un periodista...",
  cristiano: "Entrenando tiros libres en el espejo...",
  ruggeri: "Contando anécdotas del 86...",
  guardiola: "Calculando los espacios...",
  alfaro: "Revisando el orden defensivo...",
  scaloni: "Consultando al grupo...",
};

export const egoPhrases: Record<ManagerId, string[]> = {
  ruggeri: [
    "¿Ta seguro Posho? Mirá que yo sé cuánto pesa la del mundo...",
    "¡No me hagás calentar fiera! ¡Concentración los 90!",
  ],
  bilardo: [
    "¡Pisalo, pisalo! Ganar es lo único, no me discutas la gloria.",
    "¿Vos sabés quién pisó América después de Colón? Yo sí, el que llegó segundo. ¡Hacé caso!",
  ],
  mourinho: [
    "I have 3 Premier Leagues and they have zero. Respect, man!",
    "Si ni Jesucristo caía bien a todos, imagínate yo con vos contradiciéndome.",
  ],
  piojo: [
    "¿Tú sabes más que yo? ¿Quién es el técnico aquí cabrón?",
    "¡Me estás viendo la cara! ¡Yo doy la vida por este equipo!",
  ],
  cristiano: [
    "¡Siiiuuu! Mi historial habla por mí. Vos no ganaste ni un trofeo de barrio.",
    "Tu opinión no me importa, lo que importan son mis goles.",
  ],
  guardiola: [
    "Es una cuestión de espacios... pero si quieres jugar a otra cosa, adelante.",
  ],
  alfaro: [
    "El fútbol es orden y aventura. Lo tuyo es un suicidio táctico.",
  ],
  scaloni: [
    "Mirá que esto es fútbol, eh. Un día sos un genio y al otro no. Yo que vos, lo pienso dos veces.",
    "Tranquilo, falta un montón. Nosotros confiamos en el plan, ¿vos no?",
  ],
};

export function getRandomEgoPhrase(managerId: ManagerId): string {
  const phrases = egoPhrases[managerId];
  return phrases[Math.floor(Math.random() * phrases.length)];
}
