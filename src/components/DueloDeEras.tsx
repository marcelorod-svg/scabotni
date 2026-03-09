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
}

// ─── Banderas ─────────────────────────────────────────────────────────────────

const FLAGS: Record<string, string> = {
  "Argentina":      "🇦🇷",
  "France":         "🇫🇷",
  "Germany":        "🇩🇪",
  "West Germany":   "🇩🇪",
  "Spain":          "🇪🇸",
  "Italy":          "🇮🇹",
  "Brazil":         "🇧🇷",
  "Netherlands":    "🇳🇱",
  "Croatia":        "🇭🇷",
  "England":        "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Uruguay":        "🇺🇾",
  "Hungary":        "🇭🇺",
  "Czechoslovakia": "🇨🇿",
  "Sweden":         "🇸🇪",
  "Chile":          "🇨🇱",
  "Switzerland":    "🇨🇭",
}

function getFlag(country: string) {
  return FLAGS[country] ?? "🏴"
}

// ─── Datos extras por edición ─────────────────────────────────────────────────

const EXTRAS: Record<number, { champion: { topScorer: string; captain: string; keyPlayer: string }; runner_up: { topScorer: string; captain: string; keyPlayer: string } }> = {
  2022: { champion: { topScorer: "Kylian Mbappé (FRA) · 8⚽", captain: "Lionel Messi", keyPlayer: "Lionel Messi" },        runner_up: { topScorer: "Kylian Mbappé (FRA) · 8⚽", captain: "Hugo Lloris", keyPlayer: "Kylian Mbappé" } },
  2018: { champion: { topScorer: "Harry Kane (ENG) · 6⚽",    captain: "Hugo Lloris",   keyPlayer: "Kylian Mbappé" },       runner_up: { topScorer: "Harry Kane (ENG) · 6⚽",    captain: "Luka Modrić",   keyPlayer: "Luka Modrić" } },
  2014: { champion: { topScorer: "James Rodríguez (COL) · 6⚽", captain: "Philipp Lahm", keyPlayer: "Thomas Müller" },      runner_up: { topScorer: "James Rodríguez (COL) · 6⚽", captain: "Lionel Messi", keyPlayer: "Lionel Messi" } },
  2010: { champion: { topScorer: "Villa / Müller / Sneijder · 5⚽", captain: "Iker Casillas", keyPlayer: "David Villa" },   runner_up: { topScorer: "Villa / Müller / Sneijder · 5⚽", captain: "Van Bronckhorst", keyPlayer: "Wesley Sneijder" } },
  2006: { champion: { topScorer: "Miroslav Klose (ALE) · 5⚽", captain: "Fabio Cannavaro", keyPlayer: "Gianluigi Buffon" }, runner_up: { topScorer: "Miroslav Klose (ALE) · 5⚽", captain: "Zinédine Zidane", keyPlayer: "Zinédine Zidane" } },
  2002: { champion: { topScorer: "Ronaldo (BRA) · 8⚽",        captain: "Cafu",          keyPlayer: "Ronaldo" },            runner_up: { topScorer: "Ronaldo (BRA) · 8⚽",        captain: "Oliver Kahn",   keyPlayer: "Oliver Kahn" } },
  1998: { champion: { topScorer: "Davor Šuker (CRO) · 6⚽",   captain: "Didier Deschamps", keyPlayer: "Zinédine Zidane" }, runner_up: { topScorer: "Davor Šuker (CRO) · 6⚽",   captain: "Dunga",         keyPlayer: "Ronaldo" } },
  1994: { champion: { topScorer: "Stoichkov/Salenko · 6⚽",    captain: "Dunga",         keyPlayer: "Romário" },            runner_up: { topScorer: "Stoichkov/Salenko · 6⚽",    captain: "Franco Baresi", keyPlayer: "Roberto Baggio" } },
  1990: { champion: { topScorer: "Schillaci (ITA) · 6⚽",      captain: "Lothar Matthäus", keyPlayer: "Lothar Matthäus" }, runner_up: { topScorer: "Schillaci (ITA) · 6⚽",      captain: "Diego Maradona", keyPlayer: "Diego Maradona" } },
  1986: { champion: { topScorer: "Gary Lineker (ENG) · 6⚽",   captain: "Diego Maradona", keyPlayer: "Diego Maradona" },   runner_up: { topScorer: "Gary Lineker (ENG) · 6⚽",   captain: "K-H Rummenigge", keyPlayer: "Rudi Völler" } },
  1982: { champion: { topScorer: "Paolo Rossi (ITA) · 6⚽",    captain: "Dino Zoff",     keyPlayer: "Paolo Rossi" },        runner_up: { topScorer: "Paolo Rossi (ITA) · 6⚽",    captain: "K-H Rummenigge", keyPlayer: "K-H Rummenigge" } },
  1978: { champion: { topScorer: "Mario Kempes (ARG) · 6⚽",   captain: "Daniel Passarella", keyPlayer: "Mario Kempes" },  runner_up: { topScorer: "Mario Kempes (ARG) · 6⚽",   captain: "Ruud Krol",     keyPlayer: "Rob Rensenbrink" } },
  1974: { champion: { topScorer: "Grzegorz Lato (POL) · 7⚽",  captain: "Franz Beckenbauer", keyPlayer: "Franz Beckenbauer" }, runner_up: { topScorer: "Grzegorz Lato (POL) · 7⚽", captain: "Johan Cruyff", keyPlayer: "Johan Cruyff" } },
  1970: { champion: { topScorer: "Gerd Müller (ALE) · 10⚽",   captain: "Carlos Alberto Torres", keyPlayer: "Pelé" },      runner_up: { topScorer: "Gerd Müller (ALE) · 10⚽",   captain: "G. Facchetti",  keyPlayer: "Gianni Rivera" } },
  1966: { champion: { topScorer: "Eusébio (POR) · 9⚽",        captain: "Bobby Moore",   keyPlayer: "Bobby Charlton" },     runner_up: { topScorer: "Eusébio (POR) · 9⚽",        captain: "Uwe Seeler",    keyPlayer: "Helmut Haller" } },
  1962: { champion: { topScorer: "Varios · 4⚽",                captain: "Mauro Ramos",   keyPlayer: "Garrincha" },          runner_up: { topScorer: "Varios · 4⚽",                captain: "Josef Masopust", keyPlayer: "Josef Masopust" } },
  1958: { champion: { topScorer: "Just Fontaine (FRA) · 13⚽", captain: "H. Bellini",    keyPlayer: "Pelé" },               runner_up: { topScorer: "Just Fontaine (FRA) · 13⚽", captain: "Nils Liedholm", keyPlayer: "Gunnar Gren" } },
  1954: { champion: { topScorer: "Sándor Kocsis (HUN) · 11⚽", captain: "Fritz Walter",  keyPlayer: "Fritz Walter" },       runner_up: { topScorer: "Sándor Kocsis (HUN) · 11⚽", captain: "Ferenc Puskás", keyPlayer: "Ferenc Puskás" } },
  1950: { champion: { topScorer: "Ademir (BRA) · 8⚽",          captain: "Obdulio Varela", keyPlayer: "Obdulio Varela" },   runner_up: { topScorer: "Ademir (BRA) · 8⚽",          captain: "Augusto",       keyPlayer: "Zizinho" } },
  1938: { champion: { topScorer: "Leônidas (BRA) · 7⚽",        captain: "G. Meazza",     keyPlayer: "Silvio Piola" },      runner_up: { topScorer: "Leônidas (BRA) · 7⚽",        captain: "György Sárosi", keyPlayer: "György Sárosi" } },
  1934: { champion: { topScorer: "O. Nejedlý (TCH) · 5⚽",     captain: "G. Combi",      keyPlayer: "Giuseppe Meazza" },    runner_up: { topScorer: "O. Nejedlý (TCH) · 5⚽",     captain: "F. Plánička",   keyPlayer: "Oldřich Nejedlý" } },
  1930: { champion: { topScorer: "G. Stábile (ARG) · 8⚽",     captain: "José Nasazzi",  keyPlayer: "Héctor Castro" },      runner_up: { topScorer: "G. Stábile (ARG) · 8⚽",     captain: "Manuel Ferreira", keyPlayer: "G. Stábile" } },
}

// ─── Ediciones del Mundial ────────────────────────────────────────────────────
// Naming de logos: /images/worldcup-logos/{year}-{hostslug}.png
// Ej: 1966-england.png, 2002-koreajapan.png
// Si el archivo no existe se muestra un fallback con el año

const EDITIONS = [
  { year: 2026, host: "USA/CAN/MEX",  champion: "—",            runner_up: "—",            logo: "/images/worldcup-logos/2026-usa.png" },
  { year: 2022, host: "Qatar",        champion: "Argentina",    runner_up: "France",        logo: "/images/worldcup-logos/2022-qatar.png" },
  { year: 2018, host: "Russia",       champion: "France",       runner_up: "Croatia",       logo: "/images/worldcup-logos/2018-russia.png" },
  { year: 2014, host: "Brazil",       champion: "Germany",      runner_up: "Argentina",     logo: "/images/worldcup-logos/2014-brazil.png" },
  { year: 2010, host: "Sudáfrica",    champion: "Spain",        runner_up: "Netherlands",   logo: "/images/worldcup-logos/2010-southafrica.png" },
  { year: 2006, host: "Germany",      champion: "Italy",        runner_up: "France",        logo: "/images/worldcup-logos/2006-germany.png" },
  { year: 2002, host: "Korea/Japan",  champion: "Brazil",       runner_up: "Germany",       logo: "/images/worldcup-logos/2002-koreajapan.png" },
  { year: 1998, host: "France",       champion: "France",       runner_up: "Brazil",        logo: "/images/worldcup-logos/1998-france.png" },
  { year: 1994, host: "USA",          champion: "Brazil",       runner_up: "Italy",         logo: "/images/worldcup-logos/1994-usa.png" },
  { year: 1990, host: "Italy",        champion: "West Germany", runner_up: "Argentina",     logo: "/images/worldcup-logos/1990-italy.png" },
  { year: 1986, host: "Mexico",       champion: "Argentina",    runner_up: "West Germany",  logo: "/images/worldcup-logos/1986-mexico.png" },
  { year: 1982, host: "Spain",        champion: "Italy",        runner_up: "West Germany",  logo: "/images/worldcup-logos/1982-spain.png" },
  { year: 1978, host: "Argentina",    champion: "Argentina",    runner_up: "Netherlands",   logo: "/images/worldcup-logos/1978-argentina.png" },
  { year: 1974, host: "Germany",      champion: "West Germany", runner_up: "Netherlands",   logo: "/images/worldcup-logos/1974-germany.png" },
  { year: 1970, host: "Mexico",       champion: "Brazil",       runner_up: "Italy",         logo: "/images/worldcup-logos/1970-mexico.png" },
  { year: 1966, host: "England",      champion: "England",      runner_up: "West Germany",  logo: "/images/worldcup-logos/1966-england.png" },
  { year: 1962, host: "Chile",        champion: "Brazil",       runner_up: "Czechoslovakia",logo: "/images/worldcup-logos/1962-chile.png" },
  { year: 1958, host: "Sweden",       champion: "Brazil",       runner_up: "Sweden",        logo: "/images/worldcup-logos/1958-sweden.png" },
  { year: 1954, host: "Switzerland",  champion: "Germany",      runner_up: "Hungary",       logo: "/images/worldcup-logos/1954-switzerland.png" },
  { year: 1950, host: "Brazil",       champion: "Uruguay",      runner_up: "Brazil",        logo: "/images/worldcup-logos/1950-brazil.png" },
  { year: 1938, host: "France",       champion: "Italy",        runner_up: "Hungary",       logo: "/images/worldcup-logos/1938-france.png" },
  { year: 1934, host: "Italy",        champion: "Italy",        runner_up: "Czechoslovakia",logo: "/images/worldcup-logos/1934-italy.png" },
  { year: 1930, host: "Uruguay",      champion: "Uruguay",      runner_up: "Argentina",     logo: "/images/worldcup-logos/1930-uruguay.png" },
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
  if (a.avg_possession !== null && b.avg_possession !== null) lines.push(`Posesión: ${slotA.label} ${a.avg_possession?.toFixed(1)}% vs ${slotB.label} ${b.avg_possession?.toFixed(1)}%`)
  if (a.xg_per_match !== null && b.xg_per_match !== null) lines.push(`xG/pdo: ${a.xg_per_match?.toFixed(2)} vs ${b.xg_per_match?.toFixed(2)}`)
  if (a.formation || b.formation) lines.push(`Formaciones: ${a.formation ?? "N/D"} / ${b.formation ?? "N/D"}`)
  if (a.coach || b.coach) lines.push(`DTs: ${a.coach ?? "N/D"} / ${b.coach ?? "N/D"}`)
  return lines.length > 0 ? lines.join("\n") : `Duelo hipotético: ${slotA.label} vs ${slotB.label}`
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

function StatBar({ label, valA, valB, unit = "", decimals = 1 }: { label: string; valA: number | null; valB: number | null; unit?: string; decimals?: number }) {
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
  return <span>{displayed}<span className="animate-pulse opacity-60">▍</span></span>
}

// ─── WorldCupGrid — modal con grilla visual de logos ──────────────────────────

function WorldCupGrid({ allTeams, onSelectSlot, excludeKey, targetLabel, onClose }: {
  allTeams: DBHistoricTeam[]
  onSelectSlot: (slot: HistoricSlot) => void
  excludeKey: string | null
  targetLabel: string
  onClose: () => void
}) {
  const [expandedYear, setExpandedYear] = useState<number | null>(null)
  const [failedLogos, setFailedLogos] = useState<Set<number>>(new Set())

  return (
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
              Elegí una edición
              <span className="text-white/30 font-normal text-sm ml-2">— {targetLabel}</span>
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors text-lg">✕</button>
        </div>
        <p className="px-5 py-2 text-[11px] font-mono text-white/25 flex-shrink-0">
          Tocá un Mundial → elegí campeón 🏆 o subcampeón 🥈
        </p>

        {/* Grilla */}
        <div className="overflow-y-auto flex-1 px-4 pb-5 min-h-0">
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-2">
            {EDITIONS.map(ed => {
              const isExpanded = expandedYear === ed.year
              const isFuture = ed.year === 2026
              const champKey = `${ed.year}-champion`
              const runnerKey = `${ed.year}-runner_up`
              const bothDisabled = champKey === excludeKey && runnerKey === excludeKey
              const logoFailed = failedLogos.has(ed.year)

              return (
                <motion.button
                  key={ed.year}
                  onClick={() => !isFuture && setExpandedYear(isExpanded ? null : ed.year)}
                  whileHover={!isFuture ? { scale: 1.04 } : {}}
                  whileTap={!isFuture ? { scale: 0.96 } : {}}
                  disabled={isFuture || bothDisabled}
                  className={`
                    relative flex flex-col items-center justify-center rounded-xl border p-2 aspect-square transition-all duration-150
                    ${isExpanded ? "border-[#f5b942]/50 bg-[#f5b942]/10 shadow-[0_0_20px_rgba(245,185,66,0.12)]"
                      : isFuture ? "border-white/5 bg-white/[0.02] opacity-40 cursor-default"
                      : bothDisabled ? "border-white/5 opacity-20 cursor-not-allowed"
                      : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] cursor-pointer"}
                  `}
                >
                  {/* Logo */}
                  <div className="w-full flex items-center justify-center mb-1" style={{ height: 40 }}>
                    {!logoFailed ? (
                      <img
                        src={ed.logo}
                        alt={`Copa ${ed.year}`}
                        className="max-h-full max-w-full object-contain"
                        onError={() => setFailedLogos(prev => new Set(prev).add(ed.year))}
                      />
                    ) : (
                      <span className="text-2xl opacity-40">🏆</span>
                    )}
                  </div>
                  <span className={`text-[11px] font-black tabular-nums leading-none ${isExpanded ? "text-[#f5b942]" : "text-white/70"}`}>
                    {ed.year}
                  </span>
                  <span className="text-[9px] text-white/20 truncate w-full text-center mt-0.5 leading-none">
                    {ed.host}
                  </span>
                  {/* Indicador expandido */}
                  {isExpanded && (
                    <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0d0d15] border-r border-b border-[#f5b942]/30 rotate-45" />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Panel expandido */}
          <AnimatePresence>
            {expandedYear !== null && (() => {
              const ed = EDITIONS.find(e => e.year === expandedYear)!
              const champTeam = allTeams.find(t => t.year === expandedYear && t.role === "champion")
              const runnerTeam = allTeams.find(t => t.year === expandedYear && t.role === "runner_up")
              const ex = EXTRAS[expandedYear]

              return (
                <motion.div
                  key={expandedYear}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-[#f5b942]/20 bg-[#f5b942]/[0.03] p-3">
                    <p className="text-[10px] font-mono text-[#f5b942]/40 uppercase tracking-widest text-center mb-3">
                      {ed.year} · {ed.host}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {/* Campeón */}
                      {champTeam ? (
                        <button
                          onClick={() => onSelectSlot({ team: champTeam, label: `${ed.champion} '${String(ed.year).slice(2)}`, roleLabel: "🏆 Campeón", countryName: ed.champion, flag: getFlag(ed.champion) })}
                          disabled={`${ed.year}-champion` === excludeKey}
                          className={`text-left rounded-xl border p-3 transition-all duration-150 ${`${ed.year}-champion` === excludeKey ? "border-white/5 opacity-25 cursor-not-allowed" : "border-[#f5b942]/30 bg-[#f5b942]/[0.06] hover:border-[#f5b942]/60 hover:bg-[#f5b942]/10 cursor-pointer"}`}
                        >
                          <p className="text-[10px] font-mono text-[#f5b942]/60 mb-1.5">🏆 Campeón</p>
                          <p className="text-white font-black text-base leading-tight">{getFlag(ed.champion)} {ed.champion}</p>
                          {champTeam.coach && <p className="text-white/35 text-[10px] mt-1">DT: {champTeam.coach}</p>}
                          {ex?.champion.keyPlayer && <p className="text-[#f5b942]/70 text-[10px] mt-0.5">⭐ {ex.champion.keyPlayer}</p>}
                        </button>
                      ) : (
                        <div className="rounded-xl border border-white/[0.06] p-3 opacity-30">
                          <p className="text-[10px] font-mono text-white/30 mb-1.5">🏆 Campeón</p>
                          <p className="text-white font-black text-base">{getFlag(ed.champion)} {ed.champion}</p>
                          <p className="text-white/20 text-[10px] mt-1">Sin datos</p>
                        </div>
                      )}

                      {/* Subcampeón */}
                      {runnerTeam ? (
                        <button
                          onClick={() => onSelectSlot({ team: runnerTeam, label: `${ed.runner_up} '${String(ed.year).slice(2)}`, roleLabel: "🥈 Subcampeón", countryName: ed.runner_up, flag: getFlag(ed.runner_up) })}
                          disabled={`${ed.year}-runner_up` === excludeKey}
                          className={`text-left rounded-xl border p-3 transition-all duration-150 ${`${ed.year}-runner_up` === excludeKey ? "border-white/5 opacity-25 cursor-not-allowed" : "border-white/15 bg-white/[0.04] hover:border-white/30 hover:bg-white/[0.07] cursor-pointer"}`}
                        >
                          <p className="text-[10px] font-mono text-white/50 mb-1.5">🥈 Subcampeón</p>
                          <p className="text-white font-black text-base leading-tight">{getFlag(ed.runner_up)} {ed.runner_up}</p>
                          {runnerTeam.coach && <p className="text-white/35 text-[10px] mt-1">DT: {runnerTeam.coach}</p>}
                          {ex?.runner_up.keyPlayer && <p className="text-white/60 text-[10px] mt-0.5">⭐ {ex.runner_up.keyPlayer}</p>}
                        </button>
                      ) : (
                        <div className="rounded-xl border border-white/[0.06] p-3 opacity-30">
                          <p className="text-[10px] font-mono text-white/30 mb-1.5">🥈 Subcampeón</p>
                          <p className="text-white font-black text-base">{getFlag(ed.runner_up)} {ed.runner_up}</p>
                          <p className="text-white/20 text-[10px] mt-1">Sin datos</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
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

  // Reset debate al cambiar selecciones
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
  // excludeKey: solo bloquea el slot exacto ya elegido en el OTRO picker
  const excludeForA = slotB ? `${slotB.team.year}-${slotB.team.role}` : null
  const excludeForB = slotA ? `${slotA.team.year}-${slotA.team.role}` : null

  const extrasA = slotA ? EXTRAS[slotA.team.year]?.[slotA.team.role] : null
  const extrasB = slotB ? EXTRAS[slotB.team.year]?.[slotB.team.role] : null

  return (
    <div className="w-full">
      {/* Loading */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className="w-5 h-5 border-2 border-[#f5b942]/30 border-t-[#f5b942] rounded-full animate-spin" />
          <span className="text-white/30 text-sm font-mono">Cargando datos históricos…</span>
        </div>
      )}

      {!isLoadingData && (
        <>
          {/* Bajada */}
          <p className="text-white/35 text-sm leading-relaxed mb-5">
            ¿Quién gana: la <span className="text-white/60">España del tiqui-taca</span> o el <span className="text-white/60">Brasil del '70</span>?
            Elegí dos selecciones históricas y enfrentalas con datos reales.
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
                      <p className={`font-black text-xl leading-tight mb-1 ${isGold ? "text-[#f5b942]" : "text-white"}`}>
                        {slot.flag} {slot.countryName}
                      </p>
                      <p className={`text-xs font-mono mb-1.5 ${isGold ? "text-[#f5b942]/40" : "text-white/35"}`}>
                        Mundial {slot.team.year}
                      </p>
                      {slot.team.coach && (
                        <p className="text-white/30 text-[11px]">DT: {slot.team.coach}</p>
                      )}
                      <span className="absolute top-3 right-3 text-white/15 text-xs group-hover:text-white/40 transition-colors">✎</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-2">
                      <span className="text-4xl opacity-15">🏆</span>
                      <p className="text-white/20 text-xs font-mono text-center leading-relaxed">
                        Selección {side === "A" ? "1" : "2"}<br/>
                        <span className="text-white/10">Tocá para elegir</span>
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Stats + Debate */}
          <AnimatePresence>
            {canCompare && slotA && slotB && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                {/* Labels de referencia */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[#f5b942] font-bold text-sm">{slotA.flag} {slotA.label}</span>
                  <span className="text-white/15 text-xs font-mono">vs</span>
                  <span className="text-white font-bold text-sm text-right">{slotB.flag} {slotB.label}</span>
                </div>

                {/* Datos del plantel (goleador, capitán, figura) */}
                {(extrasA || extrasB) && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {([
                      { slot: slotA, extras: extrasA, isGold: true },
                      { slot: slotB, extras: extrasB, isGold: false },
                    ] as const).map(({ slot, extras, isGold }) => (
                      <div key={`${slot.team.year}-${slot.team.role}`}
                        className={`rounded-xl border p-3 ${isGold ? "border-[#f5b942]/20 bg-[#f5b942]/[0.04]" : "border-white/[0.09] bg-white/[0.03]"}`}
                      >
                        <p className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${isGold ? "text-[#f5b942]/50" : "text-white/30"}`}>
                          {slot.flag} {slot.countryName} '{String(slot.team.year).slice(2)}
                        </p>
                        {extras ? (
                          <div className="space-y-2">
                            <div>
                              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Goleador</p>
                              <p className={`text-[11px] font-semibold mt-0.5 ${isGold ? "text-white/70" : "text-white/65"}`}>{extras.topScorer}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Capitán</p>
                              <p className={`text-[11px] font-semibold mt-0.5 ${isGold ? "text-white/70" : "text-white/65"}`}>{extras.captain}</p>
                            </div>
                            <div>
                              <p className="text-[9px] font-mono text-white/20 uppercase tracking-wider">Figura</p>
                              <p className={`text-xs font-bold mt-0.5 ${isGold ? "text-[#f5b942]" : "text-white"}`}>⭐ {extras.keyPlayer}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-white/15 text-xs">Sin datos extra</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Barras de stats */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
                  <StatBar label="Posesión"    valA={slotA.team.avg_possession}     valB={slotB.team.avg_possession}     unit="%" />
                  <StatBar label="xG / pdo"    valA={slotA.team.xg_per_match}       valB={slotB.team.xg_per_match}       decimals={2} />
                  <StatBar label="Prec. pase"  valA={slotA.team.pass_accuracy}      valB={slotB.team.pass_accuracy}      unit="%" />
                  <StatBar label="Pressing"    valA={slotA.team.pressing_intensity} valB={slotB.team.pressing_intensity} />
                  <StatBar label="Tiros / pdo" valA={slotA.team.shots_per_match}    valB={slotB.team.shots_per_match} />
                  <StatBar label="Goles / pdo" valA={slotA.team.goals_per_match}    valB={slotB.team.goals_per_match}    decimals={2} />
                </div>

                {/* Grid datos secundarios */}
                <div className="space-y-1.5 mb-4">
                  {[
                    { label: "Partidos",  a: fmt(slotA.team.matches_played, 0),    b: fmt(slotB.team.matches_played, 0) },
                    { label: "Goles a favor", a: fmt(slotA.team.goals_scored, 0),  b: fmt(slotB.team.goals_scored, 0) },
                    { label: "En contra", a: fmt(slotA.team.goals_conceded, 0),     b: fmt(slotB.team.goals_conceded, 0) },
                    { label: "Acc. def.", a: fmt(slotA.team.defensive_actions, 0), b: fmt(slotB.team.defensive_actions, 0) },
                    { label: "DT",        a: slotA.team.coach ?? "—",              b: slotB.team.coach ?? "—" },
                    { label: "Formación", a: slotA.team.formation ?? "—",          b: slotB.team.formation ?? "—" },
                  ].map(s => (
                    <div key={s.label} className="flex items-center rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                      <span className="text-[#f5b942] font-semibold text-xs flex-1 text-left truncate">{s.a}</span>
                      <span className="text-[10px] font-mono text-white/20 uppercase tracking-wider flex-shrink-0 px-3 text-center">{s.label}</span>
                      <span className="text-white font-semibold text-xs flex-1 text-right truncate">{s.b}</span>
                    </div>
                  ))}
                </div>

                {/* Notas del torneo */}
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

                {/* ── Modo Duelo ─────────────────────────────────────────────── */}
                <div className="border-t border-white/[0.06] pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-black">⚔️ Modo Duelo</p>
                      <p className="text-white/25 text-xs mt-0.5">Dos DTs debaten con datos reales sobre estas selecciones</p>
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

                        {/* Selección de coaches */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {(["A", "B"] as const).map(side => {
                            const current = side === "A" ? coachA : coachB
                            const other   = side === "A" ? coachB : coachA
                            const slotRef = side === "A" ? slotA : slotB
                            const available = COACHES.filter(c => c.id !== other.id)
                            const isGold = side === "A"
                            return (
                              <div key={side}>
                                <p className={`text-[10px] font-mono uppercase tracking-wider mb-2 ${isGold ? "text-[#f5b942]/50" : "text-white/25"}`}>
                                  DT {slotRef?.flag} {slotRef?.countryName}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {available.map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => side === "A" ? setCoachA(c) : setCoachB(c)}
                                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all duration-100 ${current.id === c.id
                                        ? isGold
                                          ? "bg-[#f5b942]/15 border-[#f5b942]/35 text-[#f5b942]"
                                          : "bg-white/10 border-white/20 text-white/80"
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

                        {/* Botón debate */}
                        <button
                          onClick={handleDebate}
                          disabled={isLoadingComment}
                          className={`w-full py-3 rounded-xl font-bold text-sm border transition-all duration-150 mb-4 ${isLoadingComment ? "bg-white/[0.03] border-white/[0.06] text-white/20 cursor-not-allowed" : "bg-[#f5b942]/10 border-[#f5b942]/25 text-[#f5b942] hover:bg-[#f5b942]/20 hover:border-[#f5b942]/40 active:scale-[0.98]"}`}
                        >
                          {isLoadingComment
                            ? "Los DTs están debatiendo…"
                            : coachComment
                              ? "🔁 Nuevo debate"
                              : `⚔️ ${coachA.name} vs ${coachB.name} — Activar debate`}
                        </button>

                        {/* Burbujas de debate */}
                        <AnimatePresence>
                          {coachComment && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                              {/* Coach A */}
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

                              {/* Coach B — aparece cuando termina A */}
                              <AnimatePresence>
                                {commentDone && coachComment.comment2 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.25 }}
                                    className="flex gap-2.5 justify-end"
                                  >
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

          {/* Estado vacío */}
          {!canCompare && (
            <div className="text-center py-10">
              <p className="text-white/15 text-sm font-mono">
                {!slotA && !slotB
                  ? "Elegí dos selecciones históricas para comenzar"
                  : "Elegí la segunda selección para activar la comparación"}
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
            targetLabel={pickerTarget === "A" ? "Selección 1" : "Selección 2"}
            onClose={() => setPickerTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
