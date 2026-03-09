"use client"

// ============================================================
// ScaBOTni — Duelo de Eras
// Archivo: /app/components/DueloDeEras.tsx
//
// Importar en HeadToHead.tsx como tab nuevo:
//   import DueloDeEras from "./DueloDeEras"
//
// ⚠️ Reemplazá el createClient con el import de tu cliente real:
//   import { supabase } from "@/lib/supabase"  (o el path que uses)
//
// Requiere: framer-motion (ya instalado en el proyecto)
// ============================================================

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

// Selección histórica: combina año + role en una unidad seleccionable
interface HistoricSlot {
  team: DBHistoricTeam
  label: string       // ej: "Argentina '86" 
  roleLabel: string   // "🏆 Campeón" | "🥈 Subcampeón"
}

interface DueloState {
  slotA: HistoricSlot | null
  slotB: HistoricSlot | null
}

interface CoachComment {
  comment: string
  comment2?: string
}

// ─── Datos estáticos de ediciones ─────────────────────────────────────────────

const EDITIONS = [
  { year: 2022, host: "Qatar",         champion: "Argentina",    runner_up: "France"         },
  { year: 2018, host: "Russia",        champion: "France",       runner_up: "Croatia"        },
  { year: 2014, host: "Brazil",        champion: "Germany",      runner_up: "Argentina"      },
  { year: 2010, host: "South Africa",  champion: "Spain",        runner_up: "Netherlands"    },
  { year: 2006, host: "Germany",       champion: "Italy",        runner_up: "France"         },
  { year: 2002, host: "Korea/Japan",   champion: "Brazil",       runner_up: "Germany"        },
  { year: 1998, host: "France",        champion: "France",       runner_up: "Brazil"         },
  { year: 1994, host: "United States", champion: "Brazil",       runner_up: "Italy"          },
  { year: 1990, host: "Italy",         champion: "West Germany", runner_up: "Argentina"      },
  { year: 1986, host: "Mexico",        champion: "Argentina",    runner_up: "West Germany"   },
  { year: 1982, host: "Spain",         champion: "Italy",        runner_up: "West Germany"   },
  { year: 1978, host: "Argentina",     champion: "Argentina",    runner_up: "Netherlands"    },
  { year: 1974, host: "Germany",       champion: "West Germany", runner_up: "Netherlands"    },
  { year: 1970, host: "Mexico",        champion: "Brazil",       runner_up: "Italy"          },
  { year: 1966, host: "England",       champion: "England",      runner_up: "West Germany"   },
  { year: 1962, host: "Chile",         champion: "Brazil",       runner_up: "Czechoslovakia" },
  { year: 1958, host: "Sweden",        champion: "Brazil",       runner_up: "Sweden"         },
  { year: 1954, host: "Switzerland",   champion: "Germany",      runner_up: "Hungary"        },
  { year: 1950, host: "Brazil",        champion: "Uruguay",      runner_up: "Brazil"         },
  { year: 1938, host: "France",        champion: "Italy",        runner_up: "Hungary"        },
  { year: 1934, host: "Italy",         champion: "Italy",        runner_up: "Czechoslovakia" },
  { year: 1930, host: "Uruguay",       champion: "Uruguay",      runner_up: "Argentina"      },
]

// Coach personalities para Modo Duelo (reutiliza los mismos IDs que H2H)
// Ajustar según los prompts reales en tu DB de coach_personalities
const COACHES = [
  { id: "scaloni",  name: "Scaloni",  avatar: "/avatars/scaloni.png",  prompt: "Sos Lionel Scaloni, DT metódico, analítico y pragmático. Hablás en español rioplatense, con datos precisos y humildad táctica." },
  { id: "guardiola",name: "Guardiola",avatar: "/avatars/guardiola.png",prompt: "Sos Pep Guardiola, obsesivo con el juego de posición y la presión alta. Hablás con apasionamiento filosófico sobre el fútbol." },
  { id: "mourinho", name: "Mourinho", avatar: "/avatars/mourinho.png", prompt: "Sos José Mourinho, el Special One. Provocador, polémico y con ego monumental. Siempre con ironía y referencias a tus títulos." },
  { id: "bilardo",  name: "Bilardo",  avatar: "/avatars/bilardo.png",  prompt: "Sos Carlos Bilardo, el maestro del resultado. Pragmático al extremo, obsesivo con los detalles. Hablás en porteño coloquial." },
  { id: "cristiano",name: "Cruyff",   avatar: "/avatars/cristiano.png",prompt: "Sos Johan Cruyff, filósofo del fútbol total. Poético, visionario, hablás del espacio y la libertad táctica." },
  { id: "alfaro",   name: "Alfaro",   avatar: "/avatars/alfaro.png",   prompt: "Sos Gustavo Alfaro, apasionado, emocional y sudamericano hasta los huesos. Hablás con intensidad y orgullo latinoamericano." },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number | null, d = 1) {
  if (n === null || n === undefined) return "—"
  return d > 0 ? n.toFixed(d) : String(Math.round(n))
}

function getRoleLabel(role: string) {
  return role === "champion" ? "🏆 Campeón" : "🥈 Subcampeón"
}

function getShortName(team: DBHistoricTeam, editions: typeof EDITIONS) {
  const ed = editions.find(e => e.year === team.year)
  if (!ed) return `${team.team_id} '${String(team.year).slice(2)}`
  const name = team.role === "champion" ? ed.champion : ed.runner_up
  return `${name} '${String(team.year).slice(2)}`
}

// Build stats object compatible con el formato que espera /api/coach-comment
function buildStatsForAPI(team: DBHistoricTeam | null) {
  if (!team) return null
  return {
    played: team.matches_played ?? 0,
    won: 0,      // historic_teams no tiene W/D/L desagregado
    drawn: 0,
    lost: 0,
    goals_for: team.goals_scored ?? 0,
    goals_against: team.goals_conceded ?? 0,
    titles: team.role === "champion" ? 1 : 0,
  }
}

// ─── StatBar ──────────────────────────────────────────────────────────────────

function StatBar({
  label, valA, valB, labelA, labelB, unit = "", decimals = 1,
}: {
  label: string; valA: number | null; valB: number | null
  labelA: string; labelB: string; unit?: string; decimals?: number
}) {
  if (valA === null && valB === null) return null
  const a = valA ?? 0, b = valB ?? 0
  const total = a + b
  const pctA = total === 0 ? 50 : Math.round((a / total) * 100)

  return (
    <div className="mb-3">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[#f5b942] text-xs font-bold tabular-nums">
          {fmt(valA, decimals)}{unit}
        </span>
        <span className="text-[10px] font-mono text-white/35 uppercase tracking-wider px-2 text-center">
          {label}
        </span>
        <span className="text-white/60 text-xs font-bold tabular-nums">
          {fmt(valB, decimals)}{unit}
        </span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-[#f5b942] rounded-l-full"
          initial={{ width: "50%" }}
          animate={{ width: `${pctA}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
        <motion.div
          className="bg-white/20 rounded-r-full"
          initial={{ width: "50%" }}
          animate={{ width: `${100 - pctA}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
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
  return <span>{displayed}<span className="animate-pulse">▍</span></span>
}

// ─── EditionPicker modal ──────────────────────────────────────────────────────

function EditionPicker({
  onSelect,
  onClose,
  allTeams,
  excludeKey,
}: {
  onSelect: (slot: HistoricSlot) => void
  onClose: () => void
  allTeams: DBHistoricTeam[]
  excludeKey: string | null  // "year-role" del slot opuesto para no duplicar
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0f0f17] border border-white/10 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.07] flex-shrink-0">
          <div>
            <p className="text-[#f5b942] font-mono text-[10px] uppercase tracking-widest mb-0.5">Duelo de Eras</p>
            <h3 className="text-white font-black text-lg">Elegí una selección histórica</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-xl leading-none transition-colors">✕</button>
        </div>

        {/* Lista de ediciones */}
        <div className="overflow-y-auto flex-1 px-4 py-3 min-h-0">
          {EDITIONS.map(ed => {
            const champTeam = allTeams.find(t => t.year === ed.year && t.role === "champion")
            const runnerTeam = allTeams.find(t => t.year === ed.year && t.role === "runner_up")

            return (
              <div key={ed.year} className="mb-3">
                {/* Año header */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[#f5b942] font-black text-sm tabular-nums">{ed.year}</span>
                  <span className="text-white/25 font-mono text-[10px] uppercase">{ed.host}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Campeón */}
                  {champTeam ? (
                    <button
                      onClick={() => {
                        onSelect({
                          team: champTeam,
                          label: `${ed.champion} '${String(ed.year).slice(2)}`,
                          roleLabel: "🏆 Campeón",
                        })
                      }}
                      disabled={`${ed.year}-champion` === excludeKey}
                      className={`
                        text-left rounded-xl border px-3 py-2.5 transition-all duration-150
                        ${`${ed.year}-champion` === excludeKey
                          ? "border-white/5 bg-white/[0.02] opacity-30 cursor-not-allowed"
                          : "border-[#f5b942]/20 bg-[#f5b942]/[0.04] hover:border-[#f5b942]/50 hover:bg-[#f5b942]/10 cursor-pointer"
                        }
                      `}
                    >
                      <p className="text-[10px] font-mono text-[#f5b942]/60 mb-0.5">🏆 Campeón</p>
                      <p className="text-white/90 font-semibold text-sm leading-tight">{ed.champion}</p>
                      {champTeam.coach && (
                        <p className="text-white/30 text-[10px] mt-0.5 truncate">DT: {champTeam.coach}</p>
                      )}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-white/5 px-3 py-2.5 opacity-30">
                      <p className="text-[10px] font-mono text-white/30 mb-0.5">🏆 Campeón</p>
                      <p className="text-white/40 font-semibold text-sm">{ed.champion}</p>
                      <p className="text-white/20 text-[10px]">Sin datos</p>
                    </div>
                  )}

                  {/* Subcampeón */}
                  {runnerTeam ? (
                    <button
                      onClick={() => {
                        onSelect({
                          team: runnerTeam,
                          label: `${ed.runner_up} '${String(ed.year).slice(2)}`,
                          roleLabel: "🥈 Subcampeón",
                        })
                      }}
                      disabled={`${ed.year}-runner_up` === excludeKey}
                      className={`
                        text-left rounded-xl border px-3 py-2.5 transition-all duration-150
                        ${`${ed.year}-runner_up` === excludeKey
                          ? "border-white/5 bg-white/[0.02] opacity-30 cursor-not-allowed"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.07] cursor-pointer"
                        }
                      `}
                    >
                      <p className="text-[10px] font-mono text-white/35 mb-0.5">🥈 Subcampeón</p>
                      <p className="text-white/90 font-semibold text-sm leading-tight">{ed.runner_up}</p>
                      {runnerTeam.coach && (
                        <p className="text-white/30 text-[10px] mt-0.5 truncate">DT: {runnerTeam.coach}</p>
                      )}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-white/5 px-3 py-2.5 opacity-30">
                      <p className="text-[10px] font-mono text-white/30 mb-0.5">🥈 Subcampeón</p>
                      <p className="text-white/40 font-semibold text-sm">{ed.runner_up}</p>
                      <p className="text-white/20 text-[10px]">Sin datos</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function DueloDeEras() {
  // Datos
  const [allTeams, setAllTeams] = useState<DBHistoricTeam[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Selección
  const [duelo, setDuelo] = useState<DueloState>({ slotA: null, slotB: null })
  const [pickerTarget, setPickerTarget] = useState<"A" | "B" | null>(null)

  // Modo Duelo (DTs)
  const [modoDuelo, setModoDuelo] = useState(false)
  const [coachA, setCoachA] = useState(COACHES[0])
  const [coachB, setCoachB] = useState(COACHES[1])
  const [coachComment, setCoachComment] = useState<CoachComment | null>(null)
  const [isLoadingComment, setIsLoadingComment] = useState(false)
  const [commentDone, setCommentDone] = useState(false)

  // Cargar todos los equipos históricos al montar
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

  // Reset comentarios al cambiar selección o coaches
  useEffect(() => {
    setCoachComment(null)
    setCommentDone(false)
  }, [duelo.slotA, duelo.slotB, coachA, coachB])

  const handleSelectSlot = useCallback((slot: HistoricSlot) => {
    setDuelo(prev => ({
      ...prev,
      [pickerTarget === "A" ? "slotA" : "slotB"]: slot,
    }))
    setPickerTarget(null)
    setCoachComment(null)
    setCommentDone(false)
  }, [pickerTarget])

  const handleActivarDuelo = async () => {
    if (!duelo.slotA || !duelo.slotB) return
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
          teamAName: duelo.slotA.label,
          teamBName: duelo.slotB.label,
          teamAStats: buildStatsForAPI(duelo.slotA.team),
          teamBStats: buildStatsForAPI(duelo.slotB.team),
          h2hContext: buildContextoHistorico(duelo.slotA, duelo.slotB),
          resultA: null,
          resultB: null,
          probA: null,
          probB: null,
          probDraw: null,
          mode: "debate",
        }),
      })
      const data = await res.json()
      setCoachComment({ comment: data.comment ?? "", comment2: data.comment2 })
    } catch (err) {
      console.error("Error modo duelo:", err)
      setCoachComment({ comment: "Error generando comentario." })
    } finally {
      setIsLoadingComment(false)
    }
  }

  const canCompare = duelo.slotA !== null && duelo.slotB !== null
  const excludeA = duelo.slotA ? `${duelo.slotA.team.year}-${duelo.slotA.team.role}` : null
  const excludeB = duelo.slotB ? `${duelo.slotB.team.year}-${duelo.slotB.team.role}` : null

  return (
    <div className="w-full">

      {/* Loading inicial */}
      {isLoadingData && (
        <div className="flex items-center justify-center py-16">
          <div className="w-6 h-6 border-2 border-[#f5b942]/30 border-t-[#f5b942] rounded-full animate-spin" />
          <span className="ml-3 text-white/30 text-sm font-mono">Cargando datos históricos…</span>
        </div>
      )}

      {!isLoadingData && (
        <>
          {/* ── Intro copy ── */}
          <div className="mb-6">
            <p className="text-white/40 text-sm leading-relaxed">
              ¿Quién gana: la <span className="text-white/70">España del tiqui-taca</span> o el <span className="text-white/70">Brasil del '70</span>?
              Elegí dos selecciones históricas y enfrentalas con datos reales. Después activá el Modo Duelo y dejá que los DTs se peleen.
            </p>
          </div>

          {/* ── Selectores ── */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {(["A", "B"] as const).map(side => {
              const slot = side === "A" ? duelo.slotA : duelo.slotB
              const isGold = side === "A"
              return (
                <button
                  key={side}
                  onClick={() => setPickerTarget(side)}
                  className={`
                    relative rounded-2xl border p-4 text-left transition-all duration-200 min-h-[100px] cursor-pointer group
                    ${slot
                      ? isGold
                        ? "border-[#f5b942]/40 bg-[#f5b942]/[0.05]"
                        : "border-white/15 bg-white/[0.04]"
                      : "border-dashed border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {slot ? (
                    <>
                      <p className={`text-[10px] font-mono uppercase tracking-widest mb-1 ${isGold ? "text-[#f5b942]/70" : "text-white/35"}`}>
                        {slot.roleLabel}
                      </p>
                      <p className={`font-black text-base leading-tight mb-1 ${isGold ? "text-[#f5b942]" : "text-white/90"}`}>
                        {slot.label}
                      </p>
                      {slot.team.coach && (
                        <p className="text-white/35 text-[11px]">DT: {slot.team.coach}</p>
                      )}
                      {slot.team.formation && (
                        <p className="text-white/25 text-[11px]">{slot.team.formation}</p>
                      )}
                      <span className="absolute top-3 right-3 text-white/20 text-xs group-hover:text-white/40 transition-colors">✎</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 py-2">
                      <span className="text-2xl opacity-30">🏆</span>
                      <p className="text-white/30 text-xs font-mono text-center">
                        Selección {side === "A" ? "1" : "2"}
                        <br />
                        <span className="text-white/20">Tocá para elegir</span>
                      </p>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* ── Stats comparativas ── */}
          <AnimatePresence>
            {canCompare && duelo.slotA && duelo.slotB && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {/* Cabecera names */}
                <div className="flex justify-between items-center mb-4 px-1">
                  <span className="text-[#f5b942] font-bold text-sm">{duelo.slotA.label}</span>
                  <span className="text-white/20 text-xs font-mono">vs</span>
                  <span className="text-white/70 font-bold text-sm text-right">{duelo.slotB.label}</span>
                </div>

                {/* Barras de stats */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 mb-4">
                  <StatBar label="Posesión"      valA={duelo.slotA.team.avg_possession}    valB={duelo.slotB.team.avg_possession}    labelA={duelo.slotA.label} labelB={duelo.slotB.label} unit="%" />
                  <StatBar label="xG / partido"  valA={duelo.slotA.team.xg_per_match}      valB={duelo.slotB.team.xg_per_match}      labelA={duelo.slotA.label} labelB={duelo.slotB.label} decimals={2} />
                  <StatBar label="Prec. pase"    valA={duelo.slotA.team.pass_accuracy}     valB={duelo.slotB.team.pass_accuracy}     labelA={duelo.slotA.label} labelB={duelo.slotB.label} unit="%" />
                  <StatBar label="Pressing"      valA={duelo.slotA.team.pressing_intensity}valB={duelo.slotB.team.pressing_intensity}labelA={duelo.slotA.label} labelB={duelo.slotB.label} />
                  <StatBar label="Tiros / pdo"   valA={duelo.slotA.team.shots_per_match}   valB={duelo.slotB.team.shots_per_match}   labelA={duelo.slotA.label} labelB={duelo.slotB.label} />
                  <StatBar label="Goles / pdo"   valA={duelo.slotA.team.goals_per_match}   valB={duelo.slotB.team.goals_per_match}   labelA={duelo.slotA.label} labelB={duelo.slotB.label} decimals={2} />
                </div>

                {/* Grid de stats individuales */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {[
                    { label: "Partidos",      a: fmt(duelo.slotA.team.matches_played, 0),  b: fmt(duelo.slotB.team.matches_played, 0)  },
                    { label: "Goles a favor", a: fmt(duelo.slotA.team.goals_scored, 0),    b: fmt(duelo.slotB.team.goals_scored, 0)    },
                    { label: "Goles en contra",a: fmt(duelo.slotA.team.goals_conceded, 0), b: fmt(duelo.slotB.team.goals_conceded, 0)  },
                    { label: "Acc. defensivas",a: fmt(duelo.slotA.team.defensive_actions,0),b: fmt(duelo.slotB.team.defensive_actions,0)},
                    { label: "DT",            a: duelo.slotA.team.coach ?? "—",           b: duelo.slotB.team.coach ?? "—"           },
                    { label: "Formación",     a: duelo.slotA.team.formation ?? "—",       b: duelo.slotB.team.formation ?? "—"       },
                  ].map(s => (
                    <div key={s.label} className="col-span-2 flex items-center rounded-lg bg-white/[0.03] border border-white/[0.05] px-3 py-2">
                      <span className="text-[#f5b942] font-semibold text-xs flex-1 text-left">{s.a}</span>
                      <span className="text-[10px] font-mono text-white/25 uppercase tracking-wider flex-shrink-0 px-3">{s.label}</span>
                      <span className="text-white/60 font-semibold text-xs flex-1 text-right">{s.b}</span>
                    </div>
                  ))}
                </div>

                {/* Notas del torneo */}
                {(duelo.slotA.team.tournament_notes || duelo.slotB.team.tournament_notes) && (
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {[duelo.slotA, duelo.slotB].map((slot, i) => (
                      slot?.team.tournament_notes ? (
                        <div key={i} className={`rounded-xl border p-3 ${i === 0 ? "border-[#f5b942]/15 bg-[#f5b942]/[0.03]" : "border-white/[0.07] bg-white/[0.02]"}`}>
                          <p className={`text-[10px] font-mono uppercase tracking-wider mb-1 ${i === 0 ? "text-[#f5b942]/50" : "text-white/25"}`}>{slot.label}</p>
                          <p className="text-white/45 text-xs italic leading-relaxed">{slot.team.tournament_notes}</p>
                        </div>
                      ) : <div key={i} />
                    ))}
                  </div>
                )}

                {/* ── Modo Duelo section ── */}
                <div className="border-t border-white/[0.07] pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white font-black text-base">⚔️ Modo Duelo</p>
                      <p className="text-white/35 text-xs mt-0.5">Elegí dos DTs y dejá que se peleen con los datos</p>
                    </div>
                    <button
                      onClick={() => setModoDuelo(v => !v)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200
                        ${modoDuelo
                          ? "bg-[#f5b942]/20 border border-[#f5b942]/40 text-[#f5b942]"
                          : "bg-white/[0.05] border border-white/10 text-white/40 hover:text-white/60"
                        }
                      `}
                    >
                      {modoDuelo ? "Activo" : "Activar"}
                    </button>
                  </div>

                  <AnimatePresence>
                    {modoDuelo && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        {/* Selector de DTs */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {(["A", "B"] as const).map(side => {
                            const current = side === "A" ? coachA : coachB
                            const other = side === "A" ? coachB : coachA
                            const available = COACHES.filter(c => c.id !== other.id)
                            return (
                              <div key={side}>
                                <p className={`text-[10px] font-mono uppercase tracking-wider mb-1.5 ${side === "A" ? "text-[#f5b942]/60" : "text-white/30"}`}>
                                  DT {side === "A" ? duelo.slotA?.label : duelo.slotB?.label}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {available.map(c => (
                                    <button
                                      key={c.id}
                                      onClick={() => side === "A" ? setCoachA(c) : setCoachB(c)}
                                      className={`
                                        px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150
                                        ${current.id === c.id
                                          ? side === "A"
                                            ? "bg-[#f5b942]/20 border border-[#f5b942]/40 text-[#f5b942]"
                                            : "bg-white/10 border border-white/25 text-white/80"
                                          : "bg-white/[0.03] border border-white/[0.07] text-white/30 hover:text-white/50"
                                        }
                                      `}
                                    >
                                      {c.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* Botón activar debate */}
                        <button
                          onClick={handleActivarDuelo}
                          disabled={isLoadingComment}
                          className={`
                            w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 mb-4
                            ${isLoadingComment
                              ? "bg-white/[0.05] text-white/30 cursor-not-allowed"
                              : "bg-[#f5b942]/15 border border-[#f5b942]/30 text-[#f5b942] hover:bg-[#f5b942]/25 active:scale-[0.98]"
                            }
                          `}
                        >
                          {isLoadingComment
                            ? "Los DTs están debatiendo…"
                            : coachComment
                              ? "🔁 Nuevo debate"
                              : `⚔️ ${coachA.name} vs ${coachB.name} — Que empiece el debate`
                          }
                        </button>

                        {/* Comentarios de DTs */}
                        <AnimatePresence>
                          {coachComment && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3"
                            >
                              {/* DT A */}
                              <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#f5b942]/20 border border-[#f5b942]/30 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#f5b942]">
                                  {coachA.name[0]}
                                </div>
                                <div className="flex-1 rounded-xl rounded-tl-none bg-[#f5b942]/[0.06] border border-[#f5b942]/15 px-3 py-2.5">
                                  <p className="text-[10px] font-mono text-[#f5b942]/60 mb-1">{coachA.name}</p>
                                  <p className="text-white/80 text-sm leading-relaxed">
                                    <Typewriter text={coachComment.comment} onDone={() => setCommentDone(true)} />
                                  </p>
                                </div>
                              </div>

                              {/* DT B — aparece después de que termina el typewriter de A */}
                              <AnimatePresence>
                                {commentDone && coachComment.comment2 && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex gap-3 justify-end"
                                  >
                                    <div className="flex-1 rounded-xl rounded-tr-none bg-white/[0.05] border border-white/10 px-3 py-2.5">
                                      <p className="text-[10px] font-mono text-white/35 mb-1 text-right">{coachB.name}</p>
                                      <p className="text-white/70 text-sm leading-relaxed text-right">
                                        <Typewriter text={coachComment.comment2} />
                                      </p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white/50">
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

          {/* Empty state */}
          {!canCompare && (
            <div className="text-center py-8">
              <p className="text-white/20 text-sm font-mono">
                {!duelo.slotA && !duelo.slotB
                  ? "Elegí dos selecciones históricas para comparar"
                  : "Elegí la segunda selección para activar la comparación"
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* ── Modal picker ── */}
      <AnimatePresence>
        {pickerTarget !== null && (
          <EditionPicker
            onSelect={handleSelectSlot}
            onClose={() => setPickerTarget(null)}
            allTeams={allTeams}
            excludeKey={pickerTarget === "A" ? excludeA : excludeB}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Helper contexto histórico para el prompt del DT ─────────────────────────

function buildContextoHistorico(slotA: HistoricSlot, slotB: HistoricSlot): string {
  const a = slotA.team
  const b = slotB.team
  const lines: string[] = []

  if (a.avg_possession !== null && b.avg_possession !== null) {
    lines.push(`Posesión promedio: ${slotA.label} ${a.avg_possession?.toFixed(1)}% vs ${slotB.label} ${b.avg_possession?.toFixed(1)}%`)
  }
  if (a.xg_per_match !== null && b.xg_per_match !== null) {
    lines.push(`xG por partido: ${slotA.label} ${a.xg_per_match?.toFixed(2)} vs ${slotB.label} ${b.xg_per_match?.toFixed(2)}`)
  }
  if (a.goals_per_match !== null && b.goals_per_match !== null) {
    lines.push(`Goles por partido: ${slotA.label} ${a.goals_per_match?.toFixed(2)} vs ${slotB.label} ${b.goals_per_match?.toFixed(2)}`)
  }
  if (a.pass_accuracy !== null && b.pass_accuracy !== null) {
    lines.push(`Precisión de pase: ${slotA.label} ${a.pass_accuracy?.toFixed(1)}% vs ${slotB.label} ${b.pass_accuracy?.toFixed(1)}%`)
  }
  if (a.formation || b.formation) {
    lines.push(`Formaciones: ${slotA.label} ${a.formation ?? "N/D"} / ${slotB.label} ${b.formation ?? "N/D"}`)
  }
  if (a.coach || b.coach) {
    lines.push(`Entrenadores: ${slotA.label} dirigida por ${a.coach ?? "N/D"} / ${slotB.label} dirigida por ${b.coach ?? "N/D"}`)
  }

  return lines.length > 0
    ? lines.join("\n")
    : `${slotA.label} (${slotA.roleLabel}) vs ${slotB.label} (${slotB.roleLabel}) — comparación entre eras distintas.`
}

