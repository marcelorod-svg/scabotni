"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "@/lib/supabase"

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DBHistoricTeam {
  id: string
  team_id: string
  year: number
  role: "champion" | "runner_up"
  coach: string | null
  formation: string | null
  tournament_notes: string | null
  goals_scored: number | null
  goals_conceded: number | null
  matches_played: number | null
  avg_possession: number | null
  goals_per_match: number | null
  shots_per_match: number | null
  xg_per_match: number | null
  pass_accuracy: number | null
  defensive_actions: number | null
  pressing_intensity: number | null
}

interface HistoricSlot {
  team: DBHistoricTeam
  label: string
  roleLabel: string
  countryName: string
  flag: string
  countryCode: string
}

// ─── Banderas via flagcdn ─────────────────────────────────────────────────────

const COUNTRY_CODES: Record<string, string> = {
  "Argentina":      "ar",
  "France":         "fr",
  "Germany":        "de",
  "West Germany":   "de",
  "Spain":          "es",
  "Italy":          "it",
  "Brazil":         "br",
  "Netherlands":    "nl",
  "Croatia":        "hr",
  "England":        "gb-eng",
  "Uruguay":        "uy",
  "Hungary":        "hu",
  "Czechoslovakia": "cz",
  "Sweden":         "se",
  "Chile":          "cl",
  "Switzerland":    "ch",
}

function FlagImg({ country, size = 20 }: { country: string; size?: number }) {
  const code = COUNTRY_CODES[country]
  if (!code) return <span style={{ fontSize: size * 0.9 }}>🏴</span>
  return (
    <img
      src={`https://flagcdn.com/${size * 2}x${Math.round(size * 1.5)}/${code}.png`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={country}
      className="inline-block rounded-sm object-cover"
      style={{ verticalAlign: "middle" }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
    />
  )
}

// ─── Goleadores por selección ─────────────────────────────────────────────────

const TOP_SCORERS: Record<string, { champion: string; runner_up: string }> = {
  "2022": { champion: "Julián Álvarez · 4⚽",         runner_up: "Kylian Mbappé · 8⚽" },
  "2018": { champion: "Olivier Giroud · 3⚽",          runner_up: "Ivan Perišić · 3⚽" },
  "2014": { champion: "Thomas Müller · 5⚽",           runner_up: "Gonzalo Higuaín · 2⚽" },
  "2010": { champion: "David Villa · 5⚽",             runner_up: "Wesley Sneijder · 5⚽" },
  "2006": { champion: "Miroslav Klose · 5⚽",          runner_up: "Zinédine Zidane · 3⚽" },
  "2002": { champion: "Ronaldo · 8⚽",                 runner_up: "Miroslav Klose · 5⚽" },
  "1998": { champion: "Thierry Henry · 3⚽",           runner_up: "Ronaldo · 4⚽" },
  "1994": { champion: "Romário · 5⚽",                 runner_up: "Roberto Baggio · 5⚽" },
  "1990": { champion: "Lothar Matthäus · 4⚽",         runner_up: "Claudio Caniggia · 2⚽" },
  "1986": { champion: "Diego Maradona · 5⚽",          runner_up: "Karl-Heinz Rummenigge · 2⚽" },
  "1982": { champion: "Paolo Rossi · 6⚽",             runner_up: "Karl-Heinz Rummenigge · 4⚽" },
  "1978": { champion: "Mario Kempes · 6⚽",            runner_up: "Rob Rensenbrink · 5⚽" },
  "1974": { champion: "Gerd Müller · 4⚽",             runner_up: "Johan Neeskens · 5⚽" },
  "1970": { champion: "Jairzinho · 7⚽",               runner_up: "Gigi Riva · 4⚽" },
  "1966": { champion: "Geoff Hurst · 4⚽",             runner_up: "Helmut Haller · 3⚽" },
  "1962": { champion: "Amarildo · 3⚽",                runner_up: "Josef Masopust · 1⚽" },
  "1958": { champion: "Pelé · 6⚽",                    runner_up: "Gunnar Gren · 1⚽" },
  "1954": { champion: "Helmut Rahn · 4⚽",             runner_up: "Sándor Kocsis · 11⚽" },
  "1950": { champion: "Alcides Ghiggia · 4⚽",         runner_up: "Ademir · 8⚽" },
  "1938": { champion: "Silvio Piola · 5⚽",            runner_up: "György Sárosi · 4⚽" },
  "1934": { champion: "Angelo Schiavio · 4⚽",         runner_up: "Oldřich Nejedlý · 5⚽" },
  "1930": { champion: "Héctor Castro · 3⚽",           runner_up: "Guillermo Stábile · 8⚽" },
}

// ─── Datos extras por edición ─────────────────────────────────────────────────

const EXTRAS: Record<number, {
  champion: { captain: string; keyPlayer: string }
  runner_up: { captain: string; keyPlayer: string }
}> = {
  2022: { champion: { captain: "Lionel Messi",       keyPlayer: "Lionel Messi" },        runner_up: { captain: "Hugo Lloris",          keyPlayer: "Kylian Mbappé" } },
  2018: { champion: { captain: "Hugo Lloris",        keyPlayer: "Kylian Mbappé" },       runner_up: { captain: "Luka Modrić",          keyPlayer: "Luka Modrić" } },
  2014: { champion: { captain: "Philipp Lahm",       keyPlayer: "Thomas Müller" },       runner_up: { captain: "Lionel Messi",         keyPlayer: "Lionel Messi" } },
  2010: { champion: { captain: "Iker Casillas",      keyPlayer: "David Villa" },         runner_up: { captain: "Van Bronckhorst",      keyPlayer: "Wesley Sneijder" } },
  2006: { champion: { captain: "Fabio Cannavaro",    keyPlayer: "Gianluigi Buffon" },    runner_up: { captain: "Zinédine Zidane",      keyPlayer: "Zinédine Zidane" } },
  2002: { champion: { captain: "Cafu",               keyPlayer: "Ronaldo" },             runner_up: { captain: "Oliver Kahn",          keyPlayer: "Oliver Kahn" } },
  1998: { champion: { captain: "Didier Deschamps",   keyPlayer: "Zinédine Zidane" },     runner_up: { captain: "Dunga",               keyPlayer: "Ronaldo" } },
  1994: { champion: { captain: "Dunga",              keyPlayer: "Romário" },             runner_up: { captain: "Franco Baresi",        keyPlayer: "Roberto Baggio" } },
  1990: { champion: { captain: "Lothar Matthäus",    keyPlayer: "Lothar Matthäus" },     runner_up: { captain: "Diego Maradona",       keyPlayer: "Diego Maradona" } },
  1986: { champion: { captain: "Diego Maradona",     keyPlayer: "Diego Maradona" },      runner_up: { captain: "K-H Rummenigge",       keyPlayer: "Rudi Völler" } },
  1982: { champion: { captain: "Dino Zoff",          keyPlayer: "Paolo Rossi" },         runner_up: { captain: "K-H Rummenigge",       keyPlayer: "K-H Rummenigge" } },
  1978: { champion: { captain: "Daniel Passarella",  keyPlayer: "Mario Kempes" },        runner_up: { captain: "Ruud Krol",            keyPlayer: "Rob Rensenbrink" } },
  1974: { champion: { captain: "Franz Beckenbauer",  keyPlayer: "Franz Beckenbauer" },   runner_up: { captain: "Johan Cruyff",         keyPlayer: "Johan Cruyff" } },
  1970: { champion: { captain: "Carlos Alberto",     keyPlayer: "Pelé" },                runner_up: { captain: "Giacinto Facchetti",   keyPlayer: "Gianni Rivera" } },
  1966: { champion: { captain: "Bobby Moore",        keyPlayer: "Bobby Charlton" },      runner_up: { captain: "Uwe Seeler",           keyPlayer: "Helmut Haller" } },
  1962: { champion: { captain: "Mauro Ramos",        keyPlayer: "Garrincha" },           runner_up: { captain: "Josef Masopust",       keyPlayer: "Josef Masopust" } },
  1958: { champion: { captain: "Hilderaldo Bellini", keyPlayer: "Pelé" },                runner_up: { captain: "Nils Liedholm",        keyPlayer: "Gunnar Gren" } },
  1954: { champion: { captain: "Fritz Walter",       keyPlayer: "Fritz Walter" },        runner_up: { captain: "Ferenc Puskás",        keyPlayer: "Ferenc Puskás" } },
  1950: { champion: { captain: "Obdulio Varela",     keyPlayer: "Obdulio Varela" },      runner_up: { captain: "Augusto",             keyPlayer: "Zizinho" } },
  1938: { champion: { captain: "Giuseppe Meazza",    keyPlayer: "Silvio Piola" },        runner_up: { captain: "György Sárosi",        keyPlayer: "György Sárosi" } },
  1934: { champion: { captain: "Gianpiero Combi",    keyPlayer: "Giuseppe Meazza" },     runner_up: { captain: "František Plánička",   keyPlayer: "Oldřich Nejedlý" } },
  1930: { champion: { captain: "José Nasazzi",       keyPlayer: "Héctor Castro" },       runner_up: { captain: "Manuel Ferreira",      keyPlayer: "G. Stábile" } },
}

// ─── STATIC_FALLBACK ──────────────────────────────────────────────────────────
// Datos derivados de CSV oficial (matches_1930_2022) + curación histórica.
// Cubre las 22 ediciones × 2 roles = 44 entradas.
// getTeamData() prioriza DB; si no hay fila, usa este fallback.

const STATIC_FALLBACK: Record<string, Omit<DBHistoricTeam, "id">> = {
  "2022-champion": {
    team_id: "Argentina", year: 2022, role: "champion",
    coach: "Lionel Scaloni", formation: "4-4-2 / 4-3-3",
    tournament_notes: "Maradona no, pero Messi sí. Argentina aguantó dos veces el 2-2 de Francia en el Lusail. La copa llegó tras 36 años de espera.",
    matches_played: 7, goals_scored: 15, goals_conceded: 8,
    goals_per_match: 2.14, xg_per_match: 2.16,
    avg_possession: 53.0, shots_per_match: 13.0,
    pass_accuracy: 84.0, pressing_intensity: 68.0, defensive_actions: 52,
  },
  "2022-runner_up": {
    team_id: "France", year: 2022, role: "runner_up",
    coach: "Didier Deschamps", formation: "4-2-3-1",
    tournament_notes: "Mbappé marcó un hat-trick en la final. Francia fue al alargue pero perdió en penales. Generación dorada que quedó a un paso.",
    matches_played: 7, goals_scored: 16, goals_conceded: 8,
    goals_per_match: 2.29, xg_per_match: 1.96,
    avg_possession: 55.0, shots_per_match: 14.0,
    pass_accuracy: 86.0, pressing_intensity: 72.0, defensive_actions: 48,
  },
  "2018-champion": {
    team_id: "France", year: 2018, role: "champion",
    coach: "Didier Deschamps", formation: "4-2-3-1",
    tournament_notes: "Deschamps construyó un equipo sólido y letal en el contraataque. Mbappé, 19 años, iluminó el mundial. 4-2 a Croacia en la final.",
    matches_played: 7, goals_scored: 14, goals_conceded: 6,
    goals_per_match: 2.0, xg_per_match: 1.31,
    avg_possession: 60.0, shots_per_match: 13.0,
    pass_accuracy: 87.0, pressing_intensity: 75.0, defensive_actions: 45,
  },
  "2018-runner_up": {
    team_id: "Croatia", year: 2018, role: "runner_up",
    coach: "Zlatko Dalić", formation: "4-1-4-1",
    tournament_notes: "Modrić y Rakitić en modo bestial. Croacia ganó tres veces en el alargue. Llegaron a la final por primera vez en su historia.",
    matches_played: 7, goals_scored: 14, goals_conceded: 9,
    goals_per_match: 2.0, xg_per_match: 1.59,
    avg_possession: 47.0, shots_per_match: 12.0,
    pass_accuracy: 79.0, pressing_intensity: 65.0, defensive_actions: 58,
  },
  "2014-champion": {
    team_id: "Germany", year: 2014, role: "champion",
    coach: "Joachim Löw", formation: "4-2-3-1",
    tournament_notes: "La Mannschaft de Löw: dominante, colectiva y letal. Goleó 7-1 a Brasil en la semi. Götze y el gol en el 113'. La generación del oro.",
    matches_played: 7, goals_scored: 18, goals_conceded: 4,
    goals_per_match: 2.57, xg_per_match: null,
    avg_possession: 58.0, shots_per_match: 16.0,
    pass_accuracy: 85.0, pressing_intensity: 78.0, defensive_actions: 42,
  },
  "2014-runner_up": {
    team_id: "Argentina", year: 2014, role: "runner_up",
    coach: "Alejandro Sabella", formation: "5-3-2 / 4-3-3",
    tournament_notes: "Sabella organizó un equipo defensivo con Messi como arma. Llegaron a la final sin convencer pero sin perder. Faltó el gol de Higuaín.",
    matches_played: 7, goals_scored: 8, goals_conceded: 4,
    goals_per_match: 1.14, xg_per_match: null,
    avg_possession: 42.0, shots_per_match: 10.0,
    pass_accuracy: 80.0, pressing_intensity: 60.0, defensive_actions: 55,
  },
  "2010-champion": {
    team_id: "Spain", year: 2010, role: "champion",
    coach: "Vicente del Bosque", formation: "4-2-3-1",
    tournament_notes: "La España del tiqui-taca en su pico. Iniesta, Xavi y Villa. Un solo gol en la final. El primer Mundial para La Roja.",
    matches_played: 7, goals_scored: 8, goals_conceded: 2,
    goals_per_match: 1.14, xg_per_match: null,
    avg_possession: 61.0, shots_per_match: 14.0,
    pass_accuracy: 88.0, pressing_intensity: 80.0, defensive_actions: 40,
  },
  "2010-runner_up": {
    team_id: "Netherlands", year: 2010, role: "runner_up",
    coach: "Bert van Marwijk", formation: "4-2-3-1",
    tournament_notes: "Sneijder y Robben llevaron a Holanda a su tercera final. Llegaron con juego físico y letal, pero perdieron en el alargue.",
    matches_played: 7, goals_scored: 12, goals_conceded: 6,
    goals_per_match: 1.71, xg_per_match: null,
    avg_possession: 49.0, shots_per_match: 13.0,
    pass_accuracy: 82.0, pressing_intensity: 63.0, defensive_actions: 52,
  },
  "2006-champion": {
    team_id: "Italy", year: 2006, role: "champion",
    coach: "Marcello Lippi", formation: "4-4-2 / 4-3-1-2",
    tournament_notes: "Italia sin brillar pero con Cannavaro y Buffon de titanio. Zidane los sacudió antes de su expulsión. Ganaron en penales.",
    matches_played: 7, goals_scored: 12, goals_conceded: 2,
    goals_per_match: 1.71, xg_per_match: null,
    avg_possession: 51.0, shots_per_match: 13.0,
    pass_accuracy: 80.0, pressing_intensity: 62.0, defensive_actions: 50,
  },
  "2006-runner_up": {
    team_id: "France", year: 2006, role: "runner_up",
    coach: "Raymond Domenech", formation: "4-5-1",
    tournament_notes: "La Francia de Zidane con 34 años jugando al límite. El cabezazo a Materazzi manchó una actuación épica de despedida.",
    matches_played: 7, goals_scored: 9, goals_conceded: 3,
    goals_per_match: 1.29, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 12.0,
    pass_accuracy: 81.0, pressing_intensity: 65.0, defensive_actions: 48,
  },
  "2002-champion": {
    team_id: "Brazil", year: 2002, role: "champion",
    coach: "Luiz Felipe Scolari", formation: "4-2-3-1",
    tournament_notes: "Ronaldo Fenómeno resucitó. Scolari armó una máquina ofensiva. Brasil goleó a Alemania 2-0 en la final. Pentacampeonas.",
    matches_played: 7, goals_scored: 18, goals_conceded: 4,
    goals_per_match: 2.57, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 15.0,
    pass_accuracy: 79.0, pressing_intensity: 66.0, defensive_actions: 44,
  },
  "2002-runner_up": {
    team_id: "Germany", year: 2002, role: "runner_up",
    coach: "Rudi Völler", formation: "4-5-1",
    tournament_notes: "Alemania llegó a la final sin convencer pero con Kahn como muralla. Miroslav Klose emergió. Cayeron ante la magia de Ronaldo.",
    matches_played: 7, goals_scored: 14, goals_conceded: 3,
    goals_per_match: 2.0, xg_per_match: null,
    avg_possession: 54.0, shots_per_match: 13.0,
    pass_accuracy: 80.0, pressing_intensity: 64.0, defensive_actions: 46,
  },
  "1998-champion": {
    team_id: "France", year: 1998, role: "champion",
    coach: "Aimé Jacquet", formation: "4-2-3-1",
    tournament_notes: "Zidane con dos cabezazos en la final. Francia ganó su primer mundial ante Brasil. Deschamps como capitán.",
    matches_played: 7, goals_scored: 15, goals_conceded: 2,
    goals_per_match: 2.14, xg_per_match: null,
    avg_possession: 54.0, shots_per_match: 14.0,
    pass_accuracy: 82.0, pressing_intensity: 70.0, defensive_actions: 42,
  },
  "1998-runner_up": {
    team_id: "Brazil", year: 1998, role: "runner_up",
    coach: "Mário Zagallo", formation: "4-4-2",
    tournament_notes: "El enigma de Ronaldo antes de la final. Brasil llegó como favorito pero cayó 3-0. Zagallo y la sombra de Ronaldo.",
    matches_played: 7, goals_scored: 14, goals_conceded: 10,
    goals_per_match: 2.0, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 13.0,
    pass_accuracy: 80.0, pressing_intensity: 65.0, defensive_actions: 46,
  },
  "1994-champion": {
    team_id: "Brazil", year: 1994, role: "champion",
    coach: "Carlos Alberto Parreira", formation: "4-4-2",
    tournament_notes: "Brasil de Romário y Bebeto. Primero en ganar sin conceder gol en una final. Bicampeones tras 24 años de sequía.",
    matches_played: 7, goals_scored: 11, goals_conceded: 3,
    goals_per_match: 1.57, xg_per_match: null,
    avg_possession: 55.0, shots_per_match: 13.0,
    pass_accuracy: 81.0, pressing_intensity: 68.0, defensive_actions: 44,
  },
  "1994-runner_up": {
    team_id: "Italy", year: 1994, role: "runner_up",
    coach: "Arrigo Sacchi", formation: "4-4-2",
    tournament_notes: "Baggio y el penal que no entró. Sacchi armó una Italia intensa. Roberto Baggio fue figura hasta el último minuto.",
    matches_played: 7, goals_scored: 8, goals_conceded: 5,
    goals_per_match: 1.14, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 12.0,
    pass_accuracy: 79.0, pressing_intensity: 66.0, defensive_actions: 50,
  },
  "1990-champion": {
    team_id: "West Germany", year: 1990, role: "champion",
    coach: "Franz Beckenbauer", formation: "5-3-2",
    tournament_notes: "Alemania Occidental de Matthäus. Final ante Argentina con un penal controvertido. El Mundial más defensivo de la historia.",
    matches_played: 7, goals_scored: 15, goals_conceded: 5,
    goals_per_match: 2.14, xg_per_match: null,
    avg_possession: 48.0, shots_per_match: 12.0,
    pass_accuracy: 75.0, pressing_intensity: 58.0, defensive_actions: 56,
  },
  "1990-runner_up": {
    team_id: "Argentina", year: 1990, role: "runner_up",
    coach: "Carlos Bilardo", formation: "5-3-2 / 4-4-2",
    tournament_notes: "Maradona con la rodilla destrozada llevó a Argentina a la final. Caniggia, el gol de su vida en semis ante Italia.",
    matches_played: 7, goals_scored: 5, goals_conceded: 4,
    goals_per_match: 0.71, xg_per_match: null,
    avg_possession: 44.0, shots_per_match: 10.0,
    pass_accuracy: 72.0, pressing_intensity: 55.0, defensive_actions: 60,
  },
  "1986-champion": {
    team_id: "Argentina", year: 1986, role: "champion",
    coach: "Carlos Bilardo", formation: "3-5-2",
    tournament_notes: "El Mundial de Maradona. La Mano de Dios y el gol del siglo en el mismo partido. Argentina campeón con Bilardo y Menotti mezclados.",
    matches_played: 7, goals_scored: 14, goals_conceded: 5,
    goals_per_match: 2.0, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 14.0,
    pass_accuracy: 76.0, pressing_intensity: 65.0, defensive_actions: 50,
  },
  "1986-runner_up": {
    team_id: "West Germany", year: 1986, role: "runner_up",
    coach: "Franz Beckenbauer", formation: "4-3-3",
    tournament_notes: "Alemania de Beckenbauer llegó desde atrás. Rummenigge y Völler. Cayeron 3-2 en una final de infarto.",
    matches_played: 7, goals_scored: 8, goals_conceded: 7,
    goals_per_match: 1.14, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 11.0,
    pass_accuracy: 74.0, pressing_intensity: 60.0, defensive_actions: 55,
  },
  "1982-champion": {
    team_id: "Italy", year: 1982, role: "champion",
    coach: "Enzo Bearzot", formation: "4-4-2",
    tournament_notes: "Italia de Paolo Rossi, que volvió de una suspensión y fue el goleador del torneo. La remontada ante Brasil en el grupo fue épica.",
    matches_played: 7, goals_scored: 12, goals_conceded: 6,
    goals_per_match: 1.71, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 13.0,
    pass_accuracy: 77.0, pressing_intensity: 62.0, defensive_actions: 48,
  },
  "1982-runner_up": {
    team_id: "West Germany", year: 1982, role: "runner_up",
    coach: "Jupp Derwall", formation: "3-3-4",
    tournament_notes: "Rummenigge a medio gas, Breitner y una semifinal increíble vs Francia. La mejor Alemania que no ganó un mundial.",
    matches_played: 7, goals_scored: 12, goals_conceded: 10,
    goals_per_match: 1.71, xg_per_match: null,
    avg_possession: 51.0, shots_per_match: 12.0,
    pass_accuracy: 76.0, pressing_intensity: 60.0, defensive_actions: 52,
  },
  "1978-champion": {
    team_id: "Argentina", year: 1978, role: "champion",
    coach: "Cesar Luis Menotti", formation: "4-3-3",
    tournament_notes: "Argentina de Menotti con Kempes como héroe. El debut mundialista del pueblo argentino como local. Controversia con el Perú.",
    matches_played: 7, goals_scored: 15, goals_conceded: 4,
    goals_per_match: 2.14, xg_per_match: null,
    avg_possession: 53.0, shots_per_match: 14.0,
    pass_accuracy: 75.0, pressing_intensity: 63.0, defensive_actions: 46,
  },
  "1978-runner_up": {
    team_id: "Netherlands", year: 1978, role: "runner_up",
    coach: "Ernst Happel", formation: "4-3-3",
    tournament_notes: "Holanda sin Cruyff igualmente brillante. Rensenbrink, Neeskens, Rep. Cayeron en el alargue por segunda final consecutiva.",
    matches_played: 7, goals_scored: 15, goals_conceded: 10,
    goals_per_match: 2.14, xg_per_match: null,
    avg_possession: 55.0, shots_per_match: 15.0,
    pass_accuracy: 77.0, pressing_intensity: 65.0, defensive_actions: 48,
  },
  "1974-champion": {
    team_id: "West Germany", year: 1974, role: "champion",
    coach: "Helmut Schoen", formation: "4-2-4",
    tournament_notes: "Beckenbauer, Müller, Breitner. Alemania en casa con el fútbol pragmático de Schoen. Vencieron al fútbol total de Cruyff.",
    matches_played: 7, goals_scored: 13, goals_conceded: 4,
    goals_per_match: 1.86, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 13.0,
    pass_accuracy: 76.0, pressing_intensity: 60.0, defensive_actions: 48,
  },
  "1974-runner_up": {
    team_id: "Netherlands", year: 1974, role: "runner_up",
    coach: "Rinus Michels", formation: "3-4-3 Fútbol Total",
    tournament_notes: "El fútbol total de Cruyff. Holanda dominó el torneo pero perdió una final que debió ganar. La mejor selección que no fue campeona.",
    matches_played: 7, goals_scored: 15, goals_conceded: 3,
    goals_per_match: 2.14, xg_per_match: null,
    avg_possession: 58.0, shots_per_match: 16.0,
    pass_accuracy: 79.0, pressing_intensity: 72.0, defensive_actions: 40,
  },
  "1970-champion": {
    team_id: "Brazil", year: 1970, role: "champion",
    coach: "Mario Zagallo", formation: "4-2-4",
    tournament_notes: "El Brasil más grande de la historia. Pelé, Jairzinho, Tostão, Rivellino. Fútbol-arte puro. 4-1 a Italia en la final.",
    matches_played: 6, goals_scored: 19, goals_conceded: 7,
    goals_per_match: 3.17, xg_per_match: null,
    avg_possession: 57.0, shots_per_match: 18.0,
    pass_accuracy: 77.0, pressing_intensity: 62.0, defensive_actions: 38,
  },
  "1970-runner_up": {
    team_id: "Italy", year: 1970, role: "runner_up",
    coach: "Ferruccio Valcareggi", formation: "W-M / 4-4-2",
    tournament_notes: "Italia llegó al 90% mediante defensiva. Riva y Rivera. Jugaron la final del siglo ante Alemania, ganando en el alargue, pero cayeron ante Brasil.",
    matches_played: 6, goals_scored: 10, goals_conceded: 8,
    goals_per_match: 1.67, xg_per_match: null,
    avg_possession: 48.0, shots_per_match: 13.0,
    pass_accuracy: 72.0, pressing_intensity: 55.0, defensive_actions: 52,
  },
  "1966-champion": {
    team_id: "England", year: 1966, role: "champion",
    coach: "Alf Ramsey", formation: "4-4-2 Wingless",
    tournament_notes: "Alf Ramsey inventó el 4-4-2 sin extremos. Hurst, el único hat-trick en una final. Local, efectivo, histórico.",
    matches_played: 6, goals_scored: 11, goals_conceded: 3,
    goals_per_match: 1.83, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 13.0,
    pass_accuracy: 73.0, pressing_intensity: 65.0, defensive_actions: 52,
  },
  "1966-runner_up": {
    team_id: "West Germany", year: 1966, role: "runner_up",
    coach: "Helmut Schoen", formation: "4-2-4",
    tournament_notes: "Alemania Occidental de Seeler llegó invicta hasta la final. Disputaron el gol fantasma de Hurst. Los primeros en perder una final en casa ajena.",
    matches_played: 6, goals_scored: 15, goals_conceded: 6,
    goals_per_match: 2.5, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 15.0,
    pass_accuracy: 74.0, pressing_intensity: 62.0, defensive_actions: 48,
  },
  "1962-champion": {
    team_id: "Brazil", year: 1962, role: "champion",
    coach: "Aymore Moreira", formation: "4-3-3",
    tournament_notes: "Brasil sin Pelé (lesionado en el segundo partido) ganó con Garrincha como líder. Amarildo fue el reemplazante perfecto.",
    matches_played: 6, goals_scored: 14, goals_conceded: 5,
    goals_per_match: 2.33, xg_per_match: null,
    avg_possession: 54.0, shots_per_match: 15.0,
    pass_accuracy: 74.0, pressing_intensity: 63.0, defensive_actions: 44,
  },
  "1962-runner_up": {
    team_id: "Czechoslovakia", year: 1962, role: "runner_up",
    coach: "Rudolf Vytlacil", formation: "4-2-4",
    tournament_notes: "Checoslovaquia sorprendió al mundo llegando a la final. Masopust marcó primero. Cayeron ante la potencia brasileña.",
    matches_played: 6, goals_scored: 7, goals_conceded: 7,
    goals_per_match: 1.17, xg_per_match: null,
    avg_possession: 48.0, shots_per_match: 12.0,
    pass_accuracy: 70.0, pressing_intensity: 55.0, defensive_actions: 50,
  },
  "1958-champion": {
    team_id: "Brazil", year: 1958, role: "champion",
    coach: "Vicente Feola", formation: "4-2-4",
    tournament_notes: "Pelé, 17 años, marcó en la final. Brasil debutó en el Mundial y lo ganó en Europa. Didí y Vavá también brillaron.",
    matches_played: 6, goals_scored: 16, goals_conceded: 4,
    goals_per_match: 2.67, xg_per_match: null,
    avg_possession: 55.0, shots_per_match: 16.0,
    pass_accuracy: 75.0, pressing_intensity: 65.0, defensive_actions: 42,
  },
  "1958-runner_up": {
    team_id: "Sweden", year: 1958, role: "runner_up",
    coach: "George Raynor", formation: "3-2-5 / W-M",
    tournament_notes: "Suecia en casa tuvo una actuación heroica. Liedholm y Simonsson. Perdieron 5-2 ante la magia de Pelé y compañía.",
    matches_played: 6, goals_scored: 12, goals_conceded: 7,
    goals_per_match: 2.0, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 14.0,
    pass_accuracy: 72.0, pressing_intensity: 58.0, defensive_actions: 50,
  },
  "1954-champion": {
    team_id: "Germany", year: 1954, role: "champion",
    coach: "Sepp Herberger", formation: "W-M / 4-2-4",
    tournament_notes: "El Milagro de Berna. Alemania Occidental venció a la Hungría imbatible. Fritz Walter en estado de gracia bajo la lluvia.",
    matches_played: 6, goals_scored: 25, goals_conceded: 14,
    goals_per_match: 4.17, xg_per_match: null,
    avg_possession: 49.0, shots_per_match: 18.0,
    pass_accuracy: 68.0, pressing_intensity: 55.0, defensive_actions: 50,
  },
  "1954-runner_up": {
    team_id: "Hungary", year: 1954, role: "runner_up",
    coach: "Gusztav Sebes", formation: "3-2-5 / W-M",
    tournament_notes: "Hungría de Puskás y Kocsis era la mejor del mundo. Ganaron el grupo 8-3 a Alemania pero perdieron la final. La gran tragedia del fútbol.",
    matches_played: 5, goals_scored: 27, goals_conceded: 10,
    goals_per_match: 5.4, xg_per_match: null,
    avg_possession: 57.0, shots_per_match: 22.0,
    pass_accuracy: 72.0, pressing_intensity: 60.0, defensive_actions: 44,
  },
  "1950-champion": {
    team_id: "Uruguay", year: 1950, role: "champion",
    coach: "Juan Lopez", formation: "W-M",
    tournament_notes: "El Maracanazo. Uruguay venció a Brasil en el estadio más grande del mundo ante 200.000 personas. Ghiggia y el gol que calló el Maracaná.",
    matches_played: 4, goals_scored: 15, goals_conceded: 5,
    goals_per_match: 3.75, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 14.0,
    pass_accuracy: 69.0, pressing_intensity: 52.0, defensive_actions: 46,
  },
  "1950-runner_up": {
    team_id: "Brazil", year: 1950, role: "runner_up",
    coach: "Flavio Costa", formation: "W-M / 4-2-4",
    tournament_notes: "Brasil era el gran favorito en su propio Mundial. Zizinho y Ademir marcaron 13 goles juntos. La derrota ante Uruguay fue un trauma nacional.",
    matches_played: 6, goals_scored: 22, goals_conceded: 6,
    goals_per_match: 3.67, xg_per_match: null,
    avg_possession: 55.0, shots_per_match: 18.0,
    pass_accuracy: 71.0, pressing_intensity: 57.0, defensive_actions: 42,
  },
  "1938-champion": {
    team_id: "Italy", year: 1938, role: "champion",
    coach: "Vittorio Pozzo", formation: "Il Sistema 2-3-2-3",
    tournament_notes: "Italia bicampeona con Pozzo. Silvio Piola fue el gran goleador. El contexto político marcó el torneo, pero la calidad fue indiscutible.",
    matches_played: 4, goals_scored: 11, goals_conceded: 5,
    goals_per_match: 2.75, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 13.0,
    pass_accuracy: 67.0, pressing_intensity: 50.0, defensive_actions: 48,
  },
  "1938-runner_up": {
    team_id: "Hungary", year: 1938, role: "runner_up",
    coach: "Karoly Dietz", formation: "W-M",
    tournament_notes: "Hungría con Sárosi brilló en el torneo. Llegaron a la final goleando pero cayeron ante la organización italiana.",
    matches_played: 4, goals_scored: 15, goals_conceded: 5,
    goals_per_match: 3.75, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 14.0,
    pass_accuracy: 65.0, pressing_intensity: 48.0, defensive_actions: 46,
  },
  "1934-champion": {
    team_id: "Italy", year: 1934, role: "champion",
    coach: "Vittorio Pozzo", formation: "Il Sistema 2-3-2-3",
    tournament_notes: "Italia local campeona bajo la presión de Mussolini. Meazza y Schiavio fueron las figuras. Il Sistema táctico como innovación de época.",
    matches_played: 5, goals_scored: 12, goals_conceded: 3,
    goals_per_match: 2.4, xg_per_match: null,
    avg_possession: 53.0, shots_per_match: 13.0,
    pass_accuracy: 66.0, pressing_intensity: 51.0, defensive_actions: 50,
  },
  "1934-runner_up": {
    team_id: "Czechoslovakia", year: 1934, role: "runner_up",
    coach: "Karel Petru", formation: "W-M",
    tournament_notes: "Checoslovaquia de Plánička y Nejedlý. Jugaron una final épica pero cayeron ante Italia en el alargue.",
    matches_played: 4, goals_scored: 9, goals_conceded: 6,
    goals_per_match: 2.25, xg_per_match: null,
    avg_possession: 48.0, shots_per_match: 12.0,
    pass_accuracy: 64.0, pressing_intensity: 47.0, defensive_actions: 52,
  },
  "1930-champion": {
    team_id: "Uruguay", year: 1930, role: "champion",
    coach: "Alberto Suppici", formation: "2-3-5",
    tournament_notes: "Uruguay, el primer campeón del mundo. Nasazzi capitaneó al equipo en casa. Bicampeón olímpico que dominó el primer torneo.",
    matches_played: 4, goals_scored: 15, goals_conceded: 3,
    goals_per_match: 3.75, xg_per_match: null,
    avg_possession: 52.0, shots_per_match: 12.0,
    pass_accuracy: 64.0, pressing_intensity: 48.0, defensive_actions: 45,
  },
  "1930-runner_up": {
    team_id: "Argentina", year: 1930, role: "runner_up",
    coach: "Francisco Olazar", formation: "2-3-5",
    tournament_notes: "Argentina de Stábile, el máximo goleador del torneo. Cayeron en la final ante su vecino en el estadio Centenario.",
    matches_played: 5, goals_scored: 18, goals_conceded: 9,
    goals_per_match: 3.6, xg_per_match: null,
    avg_possession: 50.0, shots_per_match: 13.0,
    pass_accuracy: 63.0, pressing_intensity: 46.0, defensive_actions: 48,
  },
}

// ─── getTeamData: merge DB + fallback ────────────────────────────────────────
// Prioridad: DB (campos no-null) > STATIC_FALLBACK > null
// Si DB tiene la fila, sus campos no-null pisan el fallback campo a campo.
// Si DB no tiene la fila, se usa el fallback completo con id sintético.

function getTeamData(
  dbTeams: DBHistoricTeam[],
  year: number,
  role: "champion" | "runner_up"
): DBHistoricTeam {
  const dbRow = dbTeams.find(t => t.year === year && t.role === role)
  const fallback = STATIC_FALLBACK[`${year}-${role}`]

  if (dbRow) {
    // DB tiene la fila: mezclar campo a campo (DB gana si no-null)
    return {
      ...fallback,
      ...dbRow,
      // Campos que DB puede tener null pero fallback tiene valor:
      coach:               dbRow.coach               ?? fallback?.coach               ?? null,
      formation:           dbRow.formation           ?? fallback?.formation           ?? null,
      tournament_notes:    dbRow.tournament_notes    ?? fallback?.tournament_notes    ?? null,
      matches_played:      dbRow.matches_played      ?? fallback?.matches_played      ?? null,
      goals_scored:        dbRow.goals_scored        ?? fallback?.goals_scored        ?? null,
      goals_conceded:      dbRow.goals_conceded      ?? fallback?.goals_conceded      ?? null,
      goals_per_match:     dbRow.goals_per_match     ?? fallback?.goals_per_match     ?? null,
      xg_per_match:        dbRow.xg_per_match        ?? fallback?.xg_per_match        ?? null,
      avg_possession:      dbRow.avg_possession      ?? fallback?.avg_possession      ?? null,
      shots_per_match:     dbRow.shots_per_match     ?? fallback?.shots_per_match     ?? null,
      pass_accuracy:       dbRow.pass_accuracy       ?? fallback?.pass_accuracy       ?? null,
      pressing_intensity:  dbRow.pressing_intensity  ?? fallback?.pressing_intensity  ?? null,
      defensive_actions:   dbRow.defensive_actions   ?? fallback?.defensive_actions   ?? null,
    }
  }

  // DB no tiene la fila: usar fallback con id sintético
  return {
    id: `static-${year}-${role}`,
    ...(fallback ?? {
      team_id: "", year, role,
      coach: null, formation: null, tournament_notes: null,
      matches_played: null, goals_scored: null, goals_conceded: null,
      goals_per_match: null, xg_per_match: null, avg_possession: null,
      shots_per_match: null, pass_accuracy: null, pressing_intensity: null,
      defensive_actions: null,
    }),
  }
}

// ─── Ediciones ────────────────────────────────────────────────────────────────

const EDITIONS = [
  { year: 2022, host: "Qatar",       champion: "Argentina",    runner_up: "France",         logo: "/images/worldcup-logos/mundial_2022.png" },
  { year: 2018, host: "Russia",      champion: "France",       runner_up: "Croatia",        logo: "/images/worldcup-logos/mundial_2018.png" },
  { year: 2014, host: "Brazil",      champion: "Germany",      runner_up: "Argentina",      logo: "/images/worldcup-logos/mundial_2014.png" },
  { year: 2010, host: "Sudáfrica",   champion: "Spain",        runner_up: "Netherlands",    logo: "/images/worldcup-logos/mundial_2010.png" },
  { year: 2006, host: "Germany",     champion: "Italy",        runner_up: "France",         logo: "/images/worldcup-logos/mundial_2006.png" },
  { year: 2002, host: "Korea/Japan", champion: "Brazil",       runner_up: "Germany",        logo: "/images/worldcup-logos/mundial_2002.png" },
  { year: 1998, host: "France",      champion: "France",       runner_up: "Brazil",         logo: "/images/worldcup-logos/mundial_1998.png" },
  { year: 1994, host: "USA",         champion: "Brazil",       runner_up: "Italy",          logo: "/images/worldcup-logos/mundial_1994.png" },
  { year: 1990, host: "Italy",       champion: "West Germany", runner_up: "Argentina",      logo: "/images/worldcup-logos/mundial_1990.png" },
  { year: 1986, host: "Mexico",      champion: "Argentina",    runner_up: "West Germany",   logo: "/images/worldcup-logos/mundial_1986.png" },
  { year: 1982, host: "Spain",       champion: "Italy",        runner_up: "West Germany",   logo: "/images/worldcup-logos/mundial_1982.png" },
  { year: 1978, host: "Argentina",   champion: "Argentina",    runner_up: "Netherlands",    logo: "/images/worldcup-logos/mundial_1978.png" },
  { year: 1974, host: "Germany",     champion: "West Germany", runner_up: "Netherlands",    logo: "/images/worldcup-logos/mundial_1974.png" },
  { year: 1970, host: "Mexico",      champion: "Brazil",       runner_up: "Italy",          logo: "/images/worldcup-logos/mundial_1970.png" },
  { year: 1966, host: "England",     champion: "England",      runner_up: "West Germany",   logo: "/images/worldcup-logos/mundial_1966.png" },
  { year: 1962, host: "Chile",       champion: "Brazil",       runner_up: "Czechoslovakia", logo: "/images/worldcup-logos/mundial_1962.png" },
  { year: 1958, host: "Sweden",      champion: "Brazil",       runner_up: "Sweden",         logo: "/images/worldcup-logos/mundial_1958.png" },
  { year: 1954, host: "Switzerland", champion: "Germany",      runner_up: "Hungary",        logo: "/images/worldcup-logos/mundial_1954.png" },
  { year: 1950, host: "Brazil",      champion: "Uruguay",      runner_up: "Brazil",         logo: "/images/worldcup-logos/mundial_1950.png" },
  { year: 1938, host: "France",      champion: "Italy",        runner_up: "Hungary",        logo: "/images/worldcup-logos/mundial_1938.png" },
  { year: 1934, host: "Italy",       champion: "Italy",        runner_up: "Czechoslovakia", logo: "/images/worldcup-logos/mundial_1934.png" },
  { year: 1930, host: "Uruguay",     champion: "Uruguay",      runner_up: "Argentina",      logo: "/images/worldcup-logos/mundial_1930.png" },
]

// ─── Coaches ──────────────────────────────────────────────────────────────────

const COACHES = [
  { id: "scaloni",   name: "Scaloni",   prompt: "Sos Lionel Scaloni, DT metódico y analítico. Hablás en español rioplatense, con datos precisos y humildad táctica." },
  { id: "guardiola", name: "Guardiola", prompt: "Sos Pep Guardiola, obsesivo con el juego de posición. Hablás con apasionamiento filosófico sobre el fútbol." },
  { id: "mourinho",  name: "Mourinho",  prompt: "Sos José Mourinho. Provocador, polémico, con ego monumental. Siempre con ironía y referencias a tus títulos." },
  { id: "bilardo",   name: "Bilardo",   prompt: "Sos Carlos Bilardo, maestro del resultado. Pragmático extremo, obsesivo con los detalles. Hablás en porteño coloquial." },
  { id: "cruyff",    name: "Cruyff",    prompt: "Sos Johan Cruyff, filósofo del fútbol total. Poético, visionario. Hablás del espacio y la libertad táctica." },
  { id: "alfaro",    name: "Alfaro",    prompt: "Sos Gustavo Alfaro, apasionado y sudamericano hasta los huesos. Hablás con intensidad y orgullo latinoamericano." },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null, d = 1) {
  if (n === null || n === undefined) return "—"
  return d > 0 ? n.toFixed(d) : String(Math.round(n))
}

function buildStatsForAPI(team: DBHistoricTeam | null) {
  if (!team) return null
  return { played: team.matches_played ?? 0, won: 0, drawn: 0, lost: 0, goals_for: team.goals_scored ?? 0, goals_against: team.goals_conceded ?? 0, titles: team.role === "champion" ? 1 : 0 }
}

function buildH2HContext(slotA: HistoricSlot, slotB: HistoricSlot): string {
  const a = slotA.team, b = slotB.team
  const lines: string[] = []
  if (a.avg_possession !== null && b.avg_possession !== null) lines.push(`Posesion: ${slotA.label} ${a.avg_possession?.toFixed(1)}% vs ${slotB.label} ${b.avg_possession?.toFixed(1)}%`)
  if (a.xg_per_match !== null && b.xg_per_match !== null) lines.push(`xG/pdo: ${a.xg_per_match?.toFixed(2)} vs ${b.xg_per_match?.toFixed(2)}`)
  if (a.formation || b.formation) lines.push(`Formaciones: ${a.formation ?? "N/D"} / ${b.formation ?? "N/D"}`)
  if (a.coach || b.coach) lines.push(`DTs: ${a.coach ?? "N/D"} / ${b.coach ?? "N/D"}`)
  return lines.length > 0 ? lines.join("\n") : `Duelo hipotetico: ${slotA.label} vs ${slotB.label}`
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

function StatBar({ label, valA, valB, unit = "", decimals = 1 }: {
  label: string; valA: number | null; valB: number | null; unit?: string; decimals?: number
}) {
  if (valA === null && valB === null) return null
  const a = valA ?? 0, b = valB ?? 0
  const total = a + b
  const pctA = total === 0 ? 50 : Math.round((a / total) * 100)
  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[#f5b942] text-xs font-bold tabular-nums">{fmt(valA, decimals)}{unit}</span>
        <span className="text-[10px] font-mono text-white/30 uppercase tracking-wider px-2">{label}</span>
        <span className="text-white text-xs font-bold tabular-nums">{fmt(valB, decimals)}{unit}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-white/5">
        <motion.div className="bg-[#f5b942] rounded-l-full" initial={{ width: "50%" }} animate={{ width: `${pctA}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
        <motion.div className="bg-white/30 rounded-r-full" initial={{ width: "50%" }} animate={{ width: `${100 - pctA}%` }} transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
    </div>
  )
}

// ─── Typewriter ───────────────────────────────────────────────────────────────

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("")
  useEffect(() => {
    setDisplayed("")
    let i = 0
    const iv = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(iv); onDone?.() }
    }, 18)
    return () => clearInterval(iv)
  }, [text, onDone])
  return <span>{displayed}<span className="animate-pulse opacity-60">|</span></span>
}

// ─── TeamPickerModal ──────────────────────────────────────────────────────────

function TeamPickerModal({ edition, dbTeams, excludeKey, onSelect, onClose }: {
  edition: typeof EDITIONS[0]
  dbTeams: DBHistoricTeam[]
  excludeKey: string | null
  onSelect: (slot: HistoricSlot) => void
  onClose: () => void
}) {
  // Usar getTeamData para que siempre haya datos (DB o fallback)
  const champTeam  = getTeamData(dbTeams, edition.year, "champion")
  const runnerTeam = getTeamData(dbTeams, edition.year, "runner_up")

  const ex = EXTRAS[edition.year]
  const sc = TOP_SCORERS[String(edition.year)]

  const champKey  = `${edition.year}-champion`
  const runnerKey = `${edition.year}-runner_up`

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.18 }}
        className="bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#f5b942] font-mono text-[10px] uppercase tracking-widest mb-0.5">
              {edition.year} · {edition.host}
            </p>
            <p className="text-white font-black text-lg leading-tight">Elegí una seleccion</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors text-xl leading-none">x</button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {/* Campeon */}
          <button
            onClick={() => {
              if (champKey === excludeKey) return
              onSelect({
                team: champTeam,
                label: `${edition.champion} '${String(edition.year).slice(2)}`,
                roleLabel: "Campeon",
                countryName: edition.champion,
                flag: "",
                countryCode: COUNTRY_CODES[edition.champion] ?? "",
              })
            }}
            disabled={champKey === excludeKey}
            className={`text-left rounded-xl border p-4 transition-all duration-150 ${
              champKey === excludeKey
                ? "border-white/5 opacity-25 cursor-not-allowed"
                : "border-[#f5b942]/30 bg-[#f5b942]/[0.06] hover:border-[#f5b942]/60 hover:bg-[#f5b942]/[0.10] cursor-pointer active:scale-[0.98]"
            }`}
          >
            <p className="text-[10px] font-mono text-[#f5b942]/60 mb-2">Campeon</p>
            <div className="flex items-center gap-2 mb-3">
              <FlagImg country={edition.champion} size={22} />
              <p className="text-white font-black text-xl leading-tight">{edition.champion}</p>
            </div>
            <div className="space-y-1">
              {champTeam.coach && <p className="text-white/35 text-[11px]">DT: {champTeam.coach}</p>}
              {ex?.champion.captain && <p className="text-white/35 text-[11px]">Capitan: {ex.champion.captain}</p>}
              {sc?.champion && <p className="text-[#f5b942]/70 text-[11px]">GOLEADOR DEL EQUIPO: {sc.champion}</p>}
              {ex?.champion.keyPlayer && <p className="text-[#f5b942]/80 text-[11px] font-semibold">Figura: {ex.champion.keyPlayer}</p>}
            </div>
          </button>

          {/* Subcampeon */}
          <button
            onClick={() => {
              if (runnerKey === excludeKey) return
              onSelect({
                team: runnerTeam,
                label: `${edition.runner_up} '${String(edition.year).slice(2)}`,
                roleLabel: "Subcampeon",
                countryName: edition.runner_up,
                flag: "",
                countryCode: COUNTRY_CODES[edition.runner_up] ?? "",
              })
            }}
            disabled={runnerKey === excludeKey}
            className={`text-left rounded-xl border p-4 transition-all duration-150 ${
              runnerKey === excludeKey
                ? "border-white/5 opacity-25 cursor-not-allowed"
                : "border-white/15 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.08] cursor-pointer active:scale-[0.98]"
            }`}
          >
            <p className="text-[10px] font-mono text-white/40 mb-2">Subcampeon</p>
            <div className="flex items-center gap-2 mb-3">
              <FlagImg country={edition.runner_up} size={22} />
              <p className="text-white font-black text-xl leading-tight">{edition.runner_up}</p>
            </div>
            <div className="space-y-1">
              {runnerTeam.coach && <p className="text-white/35 text-[11px]">DT: {runnerTeam.coach}</p>}
              {ex?.runner_up.captain && <p className="text-white/35 text-[11px]">Capitan: {ex.runner_up.captain}</p>}
              {sc?.runner_up && <p className="text-white/60 text-[11px]">GOLEADOR DEL EQUIPO: {sc.runner_up}</p>}
              {ex?.runner_up.keyPlayer && <p className="text-white/80 text-[11px] font-semibold">Figura: {ex.runner_up.keyPlayer}</p>}
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── WorldCupGrid ─────────────────────────────────────────────────────────────

function WorldCupGrid({ dbTeams, onSelectSlot, excludeKey, targetLabel, onClose }: {
  dbTeams: DBHistoricTeam[]
  onSelectSlot: (slot: HistoricSlot) => void
  excludeKey: string | null
  targetLabel: string
  onClose: () => void
}) {
  const [selectedEdition, setSelectedEdition] = useState<typeof EDITIONS[0] | null>(null)
  const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set())

  const handleTeamSelect = (slot: HistoricSlot) => {
    onSelectSlot(slot)
    setSelectedEdition(null)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 56, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 56, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-xl max-h-[88vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.07] flex-shrink-0">
            <div>
              <p className="text-[#f5b942] font-mono text-[10px] uppercase tracking-widest mb-0.5">Duelo de Eras</p>
              <h3 className="text-white font-black text-base">
                Elegí un Mundial
                <span className="text-white/30 font-normal text-sm ml-2">— {targetLabel}</span>
              </h3>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors text-xl leading-none">x</button>
          </div>
          <p className="px-5 py-2 text-[11px] font-mono text-white/25 flex-shrink-0">
            Toca un Mundial para ver campeon y subcampeon
          </p>

          {/* Grilla de logos */}
          <div className="overflow-y-auto flex-1 px-4 pb-5 min-h-0">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {EDITIONS.map(ed => {
                const logoFailed = failedLogos.has(ed.year)
                const champKey  = `${ed.year}-champion`
                const runnerKey = `${ed.year}-runner_up`
                const disabled = champKey === excludeKey && runnerKey === excludeKey

                return (
                  <motion.button
                    key={ed.year}
                    onClick={() => !disabled && setSelectedEdition(ed)}
                    whileHover={!disabled ? { scale: 1.05 } : {}}
                    whileTap={!disabled ? { scale: 0.96 } : {}}
                    disabled={disabled}
                    className={`
                      flex flex-col items-center justify-center rounded-xl border p-2 aspect-square transition-all duration-150
                      ${disabled
                        ? "border-white/5 opacity-20 cursor-not-allowed"
                        : "border-white/[0.08] bg-white/[0.03] hover:border-[#f5b942]/40 hover:bg-[#f5b942]/[0.05] cursor-pointer"}
                    `}
                  >
                    <div className="w-full flex items-center justify-center mb-1" style={{ height: 48 }}>
                      {!logoFailed ? (
                        <img
                          src={ed.logo}
                          alt={`Copa ${ed.year}`}
                          className="max-h-full max-w-full object-contain"
                          onError={() => setFailedLogos(prev => new Set(prev).add(ed.year))}
                        />
                      ) : (
                        <span className="text-3xl opacity-30">🏆</span>
                      )}
                    </div>
                    <span className="text-[11px] font-black tabular-nums text-white/70 leading-none">{ed.year}</span>
                    <span className="text-[9px] text-white/20 truncate w-full text-center mt-0.5 leading-none">{ed.host}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {selectedEdition && (
          <TeamPickerModal
            edition={selectedEdition}
            dbTeams={dbTeams}
            excludeKey={excludeKey}
            onSelect={handleTeamSelect}
            onClose={() => setSelectedEdition(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DueloDeEras() {
  const [dbTeams, setDbTeams] = useState<DBHistoricTeam[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [slotA, setSlotA] = useState<HistoricSlot | null>(null)
  const [slotB, setSlotB] = useState<HistoricSlot | null>(null)
  const [pickerTarget, setPickerTarget] = useState<"A" | "B" | null>(null)

  const [modoDuelo, setModoDuelo] = useState(false)
  const [coachA, setCoachA] = useState(COACHES[0])
  const [coachB, setCoachB] = useState(COACHES[1])
  const [coachComment, setCoachComment] = useState<{ comment: string; comment2?: string } | null>(null)
  const [isLoadingComment, setIsLoadingComment] = useState(false)
  const [commentDone, setCommentDone] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      setIsLoadingData(true)
      try {
        const { data, error } = await supabase
          .from("historic_teams")
          .select("*")
          .in("role", ["champion", "runner_up"])
          .order("year", { ascending: false })
        if (error) throw error
        setDbTeams((data as DBHistoricTeam[]) ?? [])
      } catch (err) {
        console.error("Error cargando historic_teams:", err)
        setDbTeams([]) // fallback total a STATIC_FALLBACK
      } finally {
        setIsLoadingData(false)
      }
    }
    fetchAll()
  }, [])

  useEffect(() => {
    setCoachComment(null)
    setCommentDone(false)
  }, [slotA, slotB, coachA, coachB])

  const handleSelectSlot = useCallback((slot: HistoricSlot) => {
    if (pickerTarget === "A") setSlotA(slot)
    else setSlotB(slot)
    setPickerTarget(null)
    setCoachComment(null)
    setCommentDone(false)
  }, [pickerTarget])

  const handleDebate = async () => {
    if (!slotA || !slotB) return
    setIsLoadingComment(true)
    setCoachComment(null)
    setCommentDone(false)
    try {
      const res = await fetch("/api/coach-comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachSystemPrompt: coachA.prompt,
          coachSystemPrompt2: coachB.prompt,
          coachName: coachA.name,
          coachName2: coachB.name,
          teamAName: slotA.label,
          teamBName: slotB.label,
          teamAStats: buildStatsForAPI(slotA.team),
          teamBStats: buildStatsForAPI(slotB.team),
          h2hContext: buildH2HContext(slotA, slotB),
          resultA: null, resultB: null,
          probA: null, probB: null, probDraw: null,
          mode: "debate",
        }),
      })
      const data = await res.json()
      setCoachComment({ comment: data.comment ?? "", comment2: data.comment2 })
    } catch (err) {
      console.error(err)
      setCoachComment({ comment: "Error generando el debate." })
    } finally {
      setIsLoadingComment(false)
    }
  }

  const canCompare = slotA !== null && slotB !== null
  const excludeForA = slotB ? `${slotB.team.year}-${slotB.team.role}` : null
  const excludeForB = slotA ? `${slotA.team.year}-${slotA.team.role}` : null

  const extrasA = slotA ? EXTRAS[slotA.team.year]?.[slotA.team.role] : null
  const extrasB = slotB ? EXTRAS[slotB.team.year]?.[slotB.team.role] : null
  const scorerA = slotA ? TOP_SCORERS[String(slotA.team.year)]?.[slotA.team.role] : null
  const scorerB = slotB ? TOP_SCORERS[String(slotB.team.year)]?.[slotB.team.role] : null

  return (
    <div className="w-full">
      {isLoadingData && (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 border-2 border-[#f5b942]/30 border-t-[#f5b942] rounded-full animate-spin" />
          <span className="text-white/30 text-sm font-mono">Cargando datos historicos...</span>
        </div>
      )}

      {!isLoadingData && (
        <>
          <p className="text-white/35 text-sm leading-relaxed mb-5">
            Quien gana: la <span className="text-white/60">Espana del tiqui-taca</span> o el <span className="text-white/60">Brasil del 70</span>?
            Elegi dos selecciones historicas y enfrentalas con datos reales.
          </p>

          {/* Selectores A / B */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["A", "B"] as const).map(side => {
              const slot = side === "A" ? slotA : slotB
              const isGold = side === "A"
              return (
                <button
                  key={side}
                  onClick={() => setPickerTarget(side)}
                  className={`
                    relative rounded-2xl border p-4 text-left transition-all duration-150 min-h-[120px] cursor-pointer group
                    ${slot
                      ? isGold ? "border-[#f5b942]/35 bg-[#f5b942]/[0.05]" : "border-white/15 bg-white/[0.04]"
                      : "border-dashed border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]"}
                  `}
                >
                  {slot ? (
                    <>
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-1.5 ${isGold ? "text-[#f5b942]/60" : "text-white/40"}`}>
                        {slot.roleLabel}
                      </p>
                      <div className="flex items-center gap-2 mb-1">
                        <FlagImg country={slot.countryName} size={20} />
                        <p className={`font-black text-xl leading-tight ${isGold ? "text-[#f5b942]" : "text-white"}`}>
                          {slot.countryName}
                        </p>
                      </div>
                      <p className={`text-xs font-mono mb-1.5 ${isGold ? "text-[#f5b942]/40" : "text-white/35"}`}>
                        Mundial {slot.team.year}
                      </p>
                      {slot.team.coach && (
                        <p className="text-white/30 text-[11px]">DT: {slot.team.coach}</p>
                      )}
                      <span className="absolute top-3 right-3 text-white/15 text-xs group-hover:text-white/40 transition-colors">editar</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-2">
                      <span className="text-4xl opacity-15">🏆</span>
                      <p className="text-white/20 text-xs font-mono text-center leading-relaxed">
                        Seleccion {side === "A" ? "1" : "2"}<br />
                        <span className="text-white/10">Toca para elegir</span>
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Stats comparativas */}
          <AnimatePresence>
            {canCompare && slotA && slotB && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Labels */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <div className="flex items-center gap-1.5">
                    <FlagImg country={slotA.countryName} size={16} />
                    <span className="text-[#f5b942] font-bold text-sm">{slotA.label}</span>
                  </div>
                  <span className="text-white/15 text-xs font-mono">vs</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-white font-bold text-sm text-right">{slotB.label}</span>
                    <FlagImg country={slotB.countryName} size={16} />
                  </div>
                </div>

                {/* Cards de plantel */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {([
                    { slot: slotA, extras: extrasA, scorer: scorerA, isGold: true },
                    { slot: slotB, extras: extrasB, scorer: scorerB, isGold: false },
                  ] as const).map(({ slot, extras, scorer, isGold }) => (
                    <div
                      key={`${slot.team.year}-${slot.team.role}`}
                      className={`rounded-xl border p-3 ${isGold ? "border-[#f5b942]/20 bg-[#f5b942]/[0.04]" : "border-white/[0.09] bg-white/[0.03]"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-2">
                        <FlagImg country={slot.countryName} size={14} />
                        <p className={`text-[10px] font-mono uppercase tracking-wider ${isGold ? "text-[#f5b942]/50" : "text-white/30"}`}>
                          {slot.countryName} &apos;{String(slot.team.year).slice(2)}
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <div>
                          <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">GOLEADOR DEL EQUIPO</p>
                          <p className={`text-[11px] font-semibold mt-0.5 ${isGold ? "text-white/70" : "text-white/65"}`}>
                            {scorer ?? "—"}
                          </p>
                        </div>
                        {extras && (
                          <>
                            <div>
                              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Capitan</p>
                              <p className={`text-[11px] font-semibold mt-0.5 ${isGold ? "text-white/70" : "text-white/65"}`}>{extras.captain}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Figura</p>
                              <p className={`text-xs font-bold mt-0.5 ${isGold ? "text-[#f5b942]" : "text-white"}`}>
                                {extras.keyPlayer}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Barras de stats */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
                  <StatBar label="Posesion"    valA={slotA.team.avg_possession}     valB={slotB.team.avg_possession}     unit="%" />
                  <StatBar label="xG / pdo"    valA={slotA.team.xg_per_match}       valB={slotB.team.xg_per_match}       decimals={2} />
                  <StatBar label="Prec. pase"  valA={slotA.team.pass_accuracy}      valB={slotB.team.pass_accuracy}      unit="%" />
                  <StatBar label="Pressing"    valA={slotA.team.pressing_intensity} valB={slotB.team.pressing_intensity} />
                  <StatBar label="Tiros / pdo" valA={slotA.team.shots_per_match}    valB={slotB.team.shots_per_match} />
                  <StatBar label="Goles / pdo" valA={slotA.team.goals_per_match}    valB={slotB.team.goals_per_match}    decimals={2} />
                </div>

                {/* Grid datos */}
                <div className="space-y-1.5 mb-4">
                  {[
                    { label: "Partidos",      a: fmt(slotA.team.matches_played, 0),    b: fmt(slotB.team.matches_played, 0) },
                    { label: "Goles a favor", a: fmt(slotA.team.goals_scored, 0),      b: fmt(slotB.team.goals_scored, 0) },
                    { label: "En contra",     a: fmt(slotA.team.goals_conceded, 0),    b: fmt(slotB.team.goals_conceded, 0) },
                    { label: "Acc. def.",     a: fmt(slotA.team.defensive_actions, 0), b: fmt(slotB.team.defensive_actions, 0) },
                    { label: "DT",            a: slotA.team.coach ?? "—",              b: slotB.team.coach ?? "—" },
                    { label: "Formacion",     a: slotA.team.formation ?? "—",          b: slotB.team.formation ?? "—" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                      <span className="text-[#f5b942] font-semibold text-xs flex-1 text-left truncate">{s.a}</span>
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider flex-shrink-0 px-3 text-center">{s.label}</span>
                      <span className="text-white font-semibold text-xs flex-1 text-right truncate">{s.b}</span>
                    </div>
                  ))}
                </div>

                {/* Notas */}
                {(slotA.team.tournament_notes || slotB.team.tournament_notes) && (
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {([{ slot: slotA, isGold: true }, { slot: slotB, isGold: false }] as const).map(({ slot, isGold }) => (
                      slot.team.tournament_notes ? (
                        <div key={slot.team.id} className={`rounded-xl border p-3 ${isGold ? "border-[#f5b942]/15 bg-[#f5b942]/[0.03]" : "border-white/[0.06] bg-white/[0.02]"}`}>
                          <p className={`text-[9px] font-mono uppercase tracking-wider mb-1 ${isGold ? "text-[#f5b942]/40" : "text-white/25"}`}>{slot.flag} {slot.label}</p>
                          <p className={`text-[11px] italic leading-relaxed ${isGold ? "text-white/45" : "text-white/35"}`}>{slot.team.tournament_notes}</p>
                        </div>
                      ) : <div key={slot.team.id} />
                    ))}
                  </div>
                )}

                {/* Modo Duelo */}
                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-black">Modo Duelo</p>
                      <p className="text-white/25 text-xs mt-0.5">Dos DTs debaten con datos reales</p>
                    </div>
                    <button
                      onClick={() => setModoDuelo(v => !v)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-150 ${modoDuelo ? "bg-[#f5b942]/15 border border-[#f5b942]/35 text-[#f5b942]" : "bg-white/[0.04] border border-white/[0.08] text-white/35 hover:text-white/55"}`}
                    >
                      {modoDuelo ? "Activo" : "Activar"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {modoDuelo && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {(["A", "B"] as const).map(side => {
                            const current  = side === "A" ? coachA : coachB
                            const other    = side === "A" ? coachB : coachA
                            const slotRef  = side === "A" ? slotA : slotB
                            const isGold   = side === "A"
                            const available = COACHES.filter(c => c.id !== other.id)
                            return (
                              <div key={side}>
                                <p className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${isGold ? "text-[#f5b942]/50" : "text-white/25"}`}>
                                  DT {slotRef?.countryName}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {available.map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => side === "A" ? setCoachA(c) : setCoachB(c)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-100 ${current.id === c.id
                                        ? isGold ? "bg-[#f5b942]/15 border-[#f5b942]/35 text-[#f5b942]" : "bg-white/10 border-white/20 text-white/80"
                                        : "bg-white/[0.03] border-white/[0.06] text-white/25 hover:text-white/45 hover:border-white/15"}`}
                                    >
                                      {c.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        <button
                          onClick={handleDebate}
                          disabled={isLoadingComment}
                          className={`w-full py-3 rounded-xl font-bold text-sm border transition-all duration-150 mb-4 ${isLoadingComment ? "bg-white/[0.03] border-white/[0.06] text-white/20 cursor-not-allowed" : "bg-[#f5b942]/10 border-[#f5b942]/25 text-[#f5b942] hover:bg-[#f5b942]/20 hover:border-[#f5b942]/40 active:scale-[0.98]"}`}
                        >
                          {isLoadingComment ? "Los DTs estan debatiendo..." : coachComment ? "Nuevo debate" : `${coachA.name} vs ${coachB.name} — Activar debate`}
                        </button>

                        <AnimatePresence>
                          {coachComment && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                              <div className="flex gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-[#f5b942]/15 border border-[#f5b942]/25 flex items-center justify-center flex-shrink-0 text-xs font-black text-[#f5b942]">
                                  {coachA.name[0]}
                                </div>
                                <div className="flex-1 rounded-xl rounded-tl-none bg-[#f5b942]/[0.06] border border-[#f5b942]/15 px-3 py-2.5">
                                  <p className="text-[10px] font-mono text-[#f5b942]/50 mb-1">{coachA.name}</p>
                                  <p className="text-white/75 text-sm leading-relaxed">
                                    <Typewriter text={coachComment.comment} onDone={() => setCommentDone(true)} />
                                  </p>
                                </div>
                              </div>
                              <AnimatePresence>
                                {commentDone && coachComment.comment2 && (
                                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="flex gap-2.5 justify-end">
                                    <div className="flex-1 rounded-xl rounded-tr-none bg-white/[0.05] border border-white/[0.09] px-3 py-2.5">
                                      <p className="text-[10px] font-mono text-white/35 mb-1 text-right">{coachB.name}</p>
                                      <p className="text-white/65 text-sm leading-relaxed text-right">
                                        <Typewriter text={coachComment.comment2} />
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/[0.07] border border-white/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-white/40">
                                      {coachB.name[0]}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!canCompare && (
            <div className="text-center py-10">
              <p className="text-white/15 text-sm font-mono">
                {!slotA && !slotB ? "Elegi dos selecciones historicas para comenzar" : "Elegi la segunda seleccion para activar la comparacion"}
              </p>
            </div>
          )}
        </>
      )}

      {/* Modal picker */}
      <AnimatePresence>
        {pickerTarget !== null && (
          <WorldCupGrid
            dbTeams={dbTeams}
            onSelectSlot={handleSelectSlot}
            excludeKey={pickerTarget === "A" ? excludeForA : excludeForB}
            targetLabel={pickerTarget === "A" ? "Seleccion 1" : "Seleccion 2"}
            onClose={() => setPickerTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
