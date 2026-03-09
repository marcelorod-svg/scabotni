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

// ─── Banderas via flagcdn (funciona en todos los browsers) ───────────────────

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
      src={`https://flagcdn.com/${size * 2}x${Math.round(size * 1.5)
        }/${code}.png`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={country}
      className="inline-block rounded-sm object-cover"
      style={{ verticalAlign: "middle" }}
      onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
    />
  )
}

// ─── Goleadores POR SELECCION (no del torneo) ─────────────────────────────────

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

// ─── TeamPickerModal — modal centrado con campeón y subcampeón ────────────────

function TeamPickerModal({ edition, allTeams, excludeKey, onSelect, onClose }: {
  edition: typeof EDITIONS[0]
  allTeams: DBHistoricTeam[]
  excludeKey: string | null
  onSelect: (slot: HistoricSlot) => void
  onClose: () => void
}) {
  const champTeam  = allTeams.find(t => t.year === edition.year && t.role === "champion")
  const runnerTeam = allTeams.find(t => t.year === edition.year && t.role === "runner_up")
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
                team: champTeam ?? ({ year: edition.year, role: "champion", coach: null, formation: null, tournament_notes: null, goals_scored: null, goals_conceded: null, matches_played: null, avg_possession: null, goals_per_match: null, shots_per_match: null, xg_per_match: null, pass_accuracy: null, defensive_actions: null, pressing_intensity: null, id: `static-${edition.year}-c`, team_id: edition.champion } as DBHistoricTeam),
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
              {champTeam?.coach && <p className="text-white/35 text-[11px]">DT: {champTeam.coach}</p>}
              {ex?.champion.captain && <p className="text-white/35 text-[11px]">Capitan: {ex.champion.captain}</p>}
              {sc?.champion && <p className="text-[#f5b942]/70 text-[11px]">Goleador: {sc.champion}</p>}
              {ex?.champion.keyPlayer && <p className="text-[#f5b942]/80 text-[11px] font-semibold">Figura: {ex.champion.keyPlayer}</p>}
            </div>
          </button>

          {/* Subcampeon */}
          <button
            onClick={() => {
              if (runnerKey === excludeKey) return
              onSelect({
                team: runnerTeam ?? ({ year: edition.year, role: "runner_up", coach: null, formation: null, tournament_notes: null, goals_scored: null, goals_conceded: null, matches_played: null, avg_possession: null, goals_per_match: null, shots_per_match: null, xg_per_match: null, pass_accuracy: null, defensive_actions: null, pressing_intensity: null, id: `static-${edition.year}-r`, team_id: edition.runner_up } as DBHistoricTeam),
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
              {runnerTeam?.coach && <p className="text-white/35 text-[11px]">DT: {runnerTeam.coach}</p>}
              {ex?.runner_up.captain && <p className="text-white/35 text-[11px]">Capitan: {ex.runner_up.captain}</p>}
              {sc?.runner_up && <p className="text-white/60 text-[11px]">Goleador: {sc.runner_up}</p>}
              {ex?.runner_up.keyPlayer && <p className="text-white/80 text-[11px] font-semibold">Figura: {ex.runner_up.keyPlayer}</p>}
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── WorldCupGrid — grilla de logos + modal de equipo ────────────────────────

function WorldCupGrid({ allTeams, onSelectSlot, excludeKey, targetLabel, onClose }: {
  allTeams: DBHistoricTeam[]
  onSelectSlot: (slot: HistoricSlot) => void
  excludeKey: string | null
  targetLabel: string
  onClose: () => void
}) {
  const [selectedEdition, setSelectedEdition] = useState<typeof EDITIONS[0] | null>(null)
  const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set())

  const handleEditionClick = (ed: typeof EDITIONS[0]) => {
    setSelectedEdition(ed)
  }

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
                // Solo deshabilitar si AMBOS slots de esta edicion coinciden con excludeKey
                const disabled = champKey === excludeKey && runnerKey === excludeKey

                return (
                  <motion.button
                    key={ed.year}
                    onClick={() => !disabled && handleEditionClick(ed)}
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
                    <div className="w-full flex items-center justify-center mb-1" style={{ height: 40 }}>
                      {!logoFailed ? (
                        <img
                          src={ed.logo}
                          alt={`Copa ${ed.year}`}
                          className="max-h-full max-w-full object-contain"
                          onError={() => setFailedLogos(prev => new Set(prev).add(ed.year))}
                        />
                      ) : (
                        <span className="text-2xl opacity-30">🏆</span>
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

      {/* Modal de equipo — centrado, encima de la grilla */}
      <AnimatePresence>
        {selectedEdition && (
          <TeamPickerModal
            edition={selectedEdition}
            allTeams={allTeams}
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
  const [allTeams, setAllTeams] = useState<DBHistoricTeam[]>([])
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
        setAllTeams((data as DBHistoricTeam[]) ?? [])
      } catch (err) {
        console.error("Error cargando historic_teams:", err)
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
                          <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Goleador</p>
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
            allTeams={allTeams}
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
