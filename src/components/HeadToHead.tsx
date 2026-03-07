"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type {
  DBTeam,
  DBHistoricTeam,
  DBH2HRecord,
  DBH2HMatch,
  DBCoachPersonality,
} from "@/lib/supabase";
import { useIsMobile } from "@/hooks/useMobilePerf";

// ─── HELPERS ─────────────────────────────────────────────────

const LABEL_CLASS = "text-slate-500 font-mono";

function FlagImg({ code, className }: { code: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt=""
      className={className}
      loading="lazy"
    />
  );
}

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

// ─── TEAM SELECTOR ────────────────────────────────────────────

function TeamSelector({
  teams,
  selected,
  onSelect,
  label,
  exclude,
}: {
  teams: DBTeam[];
  selected: DBTeam | null;
  onSelect: (t: DBTeam) => void;
  label: string;
  exclude?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = teams
    .filter((t) => t.id !== exclude)
    .filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80);
  }, [open]);

  return (
    <div className="relative flex-1">
      <div className={`text-[9px] uppercase tracking-widest mb-1.5 ${LABEL_CLASS}`}>{label}</div>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-colors text-left"
        style={{
          background: "rgba(13,17,23,0.97)",
          border: selected
            ? "1px solid rgba(245,185,66,0.3)"
            : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {selected ? (
          <>
            <FlagImg code={selected.flag_code} className="w-7 h-[17px] rounded-[2px] flex-shrink-0" />
            <span className="text-sm font-bold text-white truncate">{selected.name}</span>
          </>
        ) : (
          <span className="text-sm text-slate-600 font-mono">Elegir equipo…</span>
        )}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
          className="w-3.5 h-3.5 text-slate-600 ml-auto flex-shrink-0">
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => { setOpen(false); setQuery(""); }}
            />
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
              className="fixed left-4 right-4 z-50 rounded-2xl overflow-hidden"
              style={{
                top: "50%", transform: "translateY(-50%)",
                background: "rgba(10,14,20,0.99)",
                border: "1px solid rgba(255,255,255,0.10)",
                boxShadow: "0 24px 48px rgba(0,0,0,0.7)",
                maxHeight: "70vh",
              }}
            >
              <div className="p-3 border-b border-slate-800">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
                    className="w-3.5 h-3.5 text-slate-600 flex-shrink-0">
                    <circle cx="6.5" cy="6.5" r="4" />
                    <path d="M10 10l3 3" strokeLinecap="round" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar selección…"
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none font-mono"
                  />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 70px)" }}>
                {filtered.length === 0 ? (
                  <div className="px-4 py-8 text-center text-slate-600 text-sm font-mono">
                    Sin resultados
                  </div>
                ) : (
                  filtered.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => { onSelect(team); setOpen(false); setQuery(""); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-slate-900"
                    >
                      <FlagImg code={team.flag_code} className="w-7 h-[17px] rounded-[2px] flex-shrink-0" />
                      <span className="text-sm text-white font-semibold">{team.name}</span>
                      <span className={`text-[10px] ml-auto ${LABEL_CLASS}`}>{team.confederation}</span>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── HISTORIC VERSION SELECTOR ────────────────────────────────

function HistoricSelector({
  historicTeams,
  teamId,
  selected,
  onSelect,
  label,
}: {
  historicTeams: DBHistoricTeam[];
  teamId: string;
  selected: DBHistoricTeam | null;
  onSelect: (h: DBHistoricTeam) => void;
  label: string;
}) {
  const options = historicTeams.filter((h) => h.team_id === teamId);
  if (options.length === 0) return null;

  return (
    <div className="flex-1">
      <div className={`text-[9px] uppercase tracking-widest mb-1.5 ${LABEL_CLASS}`}>{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((h) => {
          const isSelected = selected?.id === h.id;
          return (
            <button
              key={h.id}
              onClick={() => onSelect(h)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: isSelected ? "rgba(245,185,66,0.15)" : "rgba(255,255,255,0.04)",
                border: isSelected ? "1px solid rgba(245,185,66,0.5)" : "1px solid rgba(255,255,255,0.07)",
                color: isSelected ? "#f5b942" : "#64748b",
              }}
            >
              {h.year}
              {h.role === "champion" && (
                <span className="ml-1 text-[9px]">★</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── H2H RECORD DISPLAY ──────────────────────────────────────

function H2HRecord({
  record,
  matches,
  teamA,
  teamB,
}: {
  record: DBH2HRecord | null;
  matches: DBH2HMatch[];
  teamA: DBTeam;
  teamB: DBTeam;
}) {
  if (!record) {
    return (
      <div className="rounded-2xl p-4 text-center"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <p className="text-slate-600 text-sm font-mono">Sin historial registrado entre estas selecciones</p>
      </div>
    );
  }

  // Normalizar: el record siempre tiene team_a < team_b alfabéticamente
  const aIsA = teamA.id < teamB.id;
  const winsA = aIsA ? record.team_a_wins : record.team_b_wins;
  const winsB = aIsA ? record.team_b_wins : record.team_a_wins;
  const goalsA = aIsA ? record.team_a_goals : record.team_b_goals;
  const goalsB = aIsA ? record.team_b_goals : record.team_a_goals;
  const total = record.played || 1;

  return (
    <div className="space-y-3">
      {/* Stats globales */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Historial Mundial · {record.played} partidos
          </span>
        </div>

        {/* Barra de dominio */}
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FlagImg code={teamA.flag_code} className="w-6 h-[15px] rounded-[2px]" />
              <span className="text-xl font-black text-white tabular-nums">{winsA}</span>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-slate-500 tabular-nums">{record.draws}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Empates</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tabular-nums">{winsB}</span>
              <FlagImg code={teamB.flag_code} className="w-6 h-[15px] rounded-[2px]" />
            </div>
          </div>
          {/* Barra visual */}
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div className="h-full bg-amber-400/70 transition-all duration-700"
              style={{ width: `${(winsA / total) * 100}%` }} />
            <div className="h-full bg-slate-700"
              style={{ width: `${(record.draws / total) * 100}%` }} />
            <div className="h-full bg-blue-400/70 transition-all duration-700"
              style={{ width: `${(winsB / total) * 100}%` }} />
          </div>
          {/* Goles */}
          <div className="flex justify-between mt-3">
            <div className="text-center">
              <div className="text-lg font-black text-white tabular-nums">{goalsA}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
            <div className="text-center">
              <div className={`text-[9px] uppercase ${LABEL_CLASS}`}>vs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-black text-white tabular-nums">{goalsB}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
          </div>
        </div>
      </div>

      {/* Partidos recientes */}
      {matches.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2.5 border-b border-slate-800">
            <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
              Partidos recientes
            </span>
          </div>
          <div className="divide-y divide-slate-900">
            {matches.slice(0, 6).map((m) => {
              const aIsA2 = m.team_a_id === teamA.id;
              const gA = aIsA2 ? m.team_a_goals : m.team_b_goals;
              const gB = aIsA2 ? m.team_b_goals : m.team_a_goals;
              const aWon = gA > gB;
              const bWon = gB > gA;
              return (
                <div key={m.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <FlagImg code={teamA.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                    <span className={`text-xs font-black tabular-nums ${aWon ? "text-amber-400" : "text-slate-400"}`}>
                      {gA}
                    </span>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div className="text-[10px] text-slate-600 font-mono">–</div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                    <span className={`text-xs font-black tabular-nums ${bWon ? "text-amber-400" : "text-slate-400"}`}>
                      {gB}
                    </span>
                    <FlagImg code={teamB.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[60px]">
                    <div className="text-[9px] font-mono text-slate-600">{m.year}</div>
                    {m.stage && <div className="text-[8px] text-slate-700 font-mono truncate">{m.stage}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STAT COMPARISON ROW ─────────────────────────────────────

function StatRow({
  label,
  valueA,
  valueB,
  unit = "",
  higherIsBetter = true,
}: {
  label: string;
  valueA: number;
  valueB: number;
  unit?: string;
  higherIsBetter?: boolean;
}) {
  const betterA = higherIsBetter ? valueA >= valueB : valueA <= valueB;
  const betterB = higherIsBetter ? valueB > valueA : valueB < valueA;
  const max = Math.max(valueA, valueB, 1);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center py-2 border-b border-slate-900">
      <div className="text-right">
        <span className={`text-sm font-black tabular-nums ${betterA ? "text-amber-400" : "text-slate-300"}`}>
          {valueA}{unit}
        </span>
        <div className="h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ml-auto ${betterA ? "bg-amber-400/70" : "bg-slate-600"}`}
            style={{ width: `${(valueA / max) * 100}%` }} />
        </div>
      </div>
      <div className={`text-[9px] text-center uppercase font-mono px-2 ${LABEL_CLASS}`}
        style={{ minWidth: 80 }}>
        {label}
      </div>
      <div>
        <span className={`text-sm font-black tabular-nums ${betterB ? "text-amber-400" : "text-slate-300"}`}>
          {valueB}{unit}
        </span>
        <div className="h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${betterB ? "bg-amber-400/70" : "bg-slate-600"}`}
            style={{ width: `${(valueB / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── SIMULATION RESULT ───────────────────────────────────────

function SimulationResult({
  resultA,
  resultB,
  probA,
  probB,
  probDraw,
  teamA,
  teamB,
  historicA,
  historicB,
  coaches,
}: {
  resultA: number;
  resultB: number;
  probA: number;
  probB: number;
  probDraw: number;
  teamA: DBTeam;
  teamB: DBTeam;
  historicA: DBHistoricTeam;
  historicB: DBHistoricTeam;
  coaches: DBCoachPersonality[];
}) {
  const [showCoaches, setShowCoaches] = useState(false);
  const [coachComments, setCoachComments] = useState<Record<string, string>>({});
  const [loadingCoaches, setLoadingCoaches] = useState(false);

  async function loadCoachComments() {
    if (showCoaches) { setShowCoaches(false); return; }
    setShowCoaches(true);
    if (Object.keys(coachComments).length > 0) return;
    setLoadingCoaches(true);
    // Cargar comentarios de 3 DTs random en paralelo
    const selected = [...coaches].sort(() => Math.random() - 0.5).slice(0, 3);
    const results = await Promise.all(
      selected.map(async (coach) => {
        try {
          const res = await fetch("/api/coach-comment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              coachSystemPrompt: coach.system_prompt,
              teamAName: teamA.name,
              teamBName: teamB.name,
              teamAYear: historicA.year,
              teamBYear: historicB.year,
              resultA,
              resultB,
              probA,
              probB,
              probDraw,
              formationA: historicA.formation,
              formationB: historicB.formation,
              notesA: historicA.tournament_notes,
              notesB: historicB.tournament_notes,
            }),
          });
          const data = await res.json();
          return { id: coach.id, comment: data.comment || "…" };
        } catch {
          return { id: coach.id, comment: "Sin señal del DT." };
        }
      })
    );
    const map: Record<string, string> = {};
    results.forEach((r) => { map[r.id] = r.comment; });
    setCoachComments(map);
    setLoadingCoaches(false);
  }

  const winner = resultA > resultB ? teamA : resultB > resultA ? teamB : null;

  return (
    <div className="space-y-3">
      {/* Marcador */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(245,185,66,0.2)" }}>
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
          <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-400"
            style={{ boxShadow: "0 0 6px #34d39980" }} />
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Resultado simulado · IA
          </span>
        </div>
        <div className="px-4 py-5">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex flex-col items-center gap-2">
              <FlagImg code={teamA.flag_code} className="w-10 h-[26px] rounded-[3px]" />
              <span className="text-[10px] font-bold text-white text-center leading-tight max-w-[60px]">
                {teamA.name}
              </span>
              <span className="text-[9px] text-slate-600 font-mono">{historicA.year}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-5xl font-black tabular-nums ${resultA > resultB ? "text-amber-400" : "text-white"}`}>
                {resultA}
              </span>
              <span className="text-2xl text-slate-700 font-black">–</span>
              <span className={`text-5xl font-black tabular-nums ${resultB > resultA ? "text-amber-400" : "text-white"}`}>
                {resultB}
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FlagImg code={teamB.flag_code} className="w-10 h-[26px] rounded-[3px]" />
              <span className="text-[10px] font-bold text-white text-center leading-tight max-w-[60px]">
                {teamB.name}
              </span>
              <span className="text-[9px] text-slate-600 font-mono">{historicB.year}</span>
            </div>
          </div>
          {winner && (
            <div className="text-center mb-4">
              <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">
                ★ {winner.name} ganaría
              </span>
            </div>
          )}
          {/* Probabilidades */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: teamA.name, prob: probA, color: "text-amber-400" },
              { label: "Empate", prob: probDraw, color: "text-slate-400" },
              { label: teamB.name, prob: probB, color: "text-blue-400" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`text-lg font-black tabular-nums ${item.color}`}>{item.prob}%</div>
                <div className={`text-[8px] uppercase truncate ${LABEL_CLASS}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botón DTs */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={loadCoachComments}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors"
        style={{
          background: showCoaches ? "rgba(245,185,66,0.08)" : "rgba(255,255,255,0.03)",
          border: showCoaches ? "1px solid rgba(245,185,66,0.25)" : "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(245,185,66,0.2)" }}>
            <motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <span className={`text-[10px] uppercase tracking-widest font-bold ${LABEL_CLASS}`}>
            {showCoaches ? "Cerrar análisis de DTs" : "Ver opinión de los DTs"}
          </span>
        </div>
        <motion.div animate={{ rotate: showCoaches ? 180 : 0 }} transition={{ duration: 0.2 }}
          className="text-slate-600 text-sm">↓</motion.div>
      </motion.button>

      {/* Coach comments */}
      <AnimatePresence>
        {showCoaches && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            {loadingCoaches ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl p-4"
                    style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      className="h-4 rounded bg-slate-800 w-3/4 mb-2" />
                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 + 0.1 }}
                      className="h-3 rounded bg-slate-800 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {coaches
                  .filter((c) => coachComments[c.id])
                  .map((coach) => (
                    <motion.div key={coach.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="rounded-xl p-4"
                      style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-black text-[11px] text-amber-400"
                          style={{ background: "rgba(245,185,66,0.1)", border: "1px solid rgba(245,185,66,0.2)" }}>
                          {coach.initials}
                        </div>
                        <div>
                          <div className="text-xs font-black text-white">{coach.name}</div>
                          <div className={`text-[9px] ${LABEL_CLASS}`}>{coach.role}</div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{coachComments[coach.id]}"
                      </p>
                    </motion.div>
                  ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

export default function HeadToHead() {
  const isMobile = useIsMobile();

  // Data
  const [teams, setTeams] = useState<DBTeam[]>([]);
  const [historicTeams, setHistoricTeams] = useState<DBHistoricTeam[]>([]);
  const [coaches, setCoaches] = useState<DBCoachPersonality[]>([]);
  const [loading, setLoading] = useState(true);

  // Selección
  const [teamA, setTeamA] = useState<DBTeam | null>(null);
  const [teamB, setTeamB] = useState<DBTeam | null>(null);
  const [historicA, setHistoricA] = useState<DBHistoricTeam | null>(null);
  const [historicB, setHistoricB] = useState<DBHistoricTeam | null>(null);

  // H2H record
  const [h2hRecord, setH2HRecord] = useState<DBH2HRecord | null>(null);
  const [h2hMatches, setH2HMatches] = useState<DBH2HMatch[]>([]);
  const [loadingH2H, setLoadingH2H] = useState(false);

  // Simulación
  const [simResult, setSimResult] = useState<{
    resultA: number; resultB: number;
    probA: number; probB: number; probDraw: number;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    async function loadData() {
      try {
        const [teamsRes, historicRes, coachesRes] = await Promise.all([
          supabase.from("teams").select("*").order("name"),
          supabase.from("historic_teams").select("*, teams(name,flag_code)").order("year", { ascending: false }),
          supabase.from("coach_personalities").select("*").eq("active", true),
        ]);
        if (teamsRes.data) setTeams(teamsRes.data);
        if (historicRes.data) setHistoricTeams(historicRes.data);
        if (coachesRes.data) setCoaches(coachesRes.data);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cargar H2H cuando se seleccionan ambos equipos
  useEffect(() => {
    if (!teamA || !teamB) return;
    setH2HRecord(null);
    setH2HMatches([]);
    setSimResult(null);
    setHistoricA(null);
    setHistoricB(null);

    async function loadH2H() {
      setLoadingH2H(true);
      try {
        const [a, b] = [teamA!.id, teamB!.id].sort();
        const [recordRes, matchesRes] = await Promise.all([
          supabase.from("h2h_records").select("*").eq("team_a_id", a).eq("team_b_id", b).maybeSingle(),
          supabase.from("h2h_matches").select("*")
            .or(`and(team_a_id.eq.${a},team_b_id.eq.${b}),and(team_a_id.eq.${b},team_b_id.eq.${a})`)
            .order("year", { ascending: false }).limit(10),
        ]);
        setH2HRecord(recordRes.data ?? null);
        setH2HMatches(matchesRes.data ?? []);
      } catch (err) {
        console.error("Error loading H2H:", err);
      } finally {
        setLoadingH2H(false);
      }
    }
    loadH2H();
  }, [teamA, teamB]);

  async function handleSimulate() {
    if (!historicA || !historicB) return;
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamA: teamA!.id,
          teamB: teamB!.id,
          historicTeamA: historicA,
          historicTeamB: historicB,
        }),
      });
      const data = await res.json();
      setSimResult({
        resultA: data.resultA,
        resultB: data.resultB,
        probA: data.probA,
        probB: data.probB,
        probDraw: data.probDraw,
      });
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  }

  const bothSelected = teamA && teamB;
  const bothHistoric = historicA && historicB;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }}
          className="w-8 h-8 rounded-full border-2 border-amber-400/40 border-t-amber-400"
          style={{ animation: "spin 1s linear infinite" }} />
        <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>Cargando datos…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">

      {/* Header */}
      <div className="pt-1">
        <div className={`text-[9px] uppercase tracking-widest mb-1 ${LABEL_CLASS}`}>Modo Duelo</div>
        <h2 className="text-xl font-black text-white tracking-wide">Head to Head</h2>
        <p className={`text-[11px] mt-0.5 ${LABEL_CLASS}`}>
          Compará selecciones históricas y simulá el partido
        </p>
      </div>

      {/* Selector de equipos */}
      <div className="rounded-2xl p-4 space-y-4"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex gap-3">
          <TeamSelector teams={teams} selected={teamA} onSelect={(t) => { setTeamA(t); setHistoricA(null); }}
            label="Selección A" exclude={teamB?.id} />
          <div className="flex items-end pb-1">
            <span className="text-slate-700 font-black text-lg">vs</span>
          </div>
          <TeamSelector teams={teams} selected={teamB} onSelect={(t) => { setTeamB(t); setHistoricB(null); }}
            label="Selección B" exclude={teamA?.id} />
        </div>

        {/* Selectores de versión histórica */}
        {bothSelected && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }} className="space-y-3 pt-1 border-t border-slate-900">
            <div className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
              Elegí la versión histórica de cada equipo
            </div>
            <div className="flex gap-4">
              <HistoricSelector historicTeams={historicTeams} teamId={teamA!.id}
                selected={historicA} onSelect={setHistoricA} label={teamA!.name} />
              <HistoricSelector historicTeams={historicTeams} teamId={teamB!.id}
                selected={historicB} onSelect={setHistoricB} label={teamB!.name} />
            </div>
          </motion.div>
        )}
      </div>

      {/* H2H Record */}
      <AnimatePresence>
        {bothSelected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}>
            {loadingH2H ? (
              <div className="rounded-2xl p-6 flex items-center justify-center gap-3"
                style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                  className="w-3 h-3 rounded-full bg-amber-400/50" />
                <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>
                  Cargando historial…
                </span>
              </div>
            ) : (
              <H2HRecord record={h2hRecord} matches={h2hMatches} teamA={teamA!} teamB={teamB!} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparación de stats históricas */}
      <AnimatePresence>
        {bothHistoric && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="px-4 py-2.5 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
                    Comparación de stats
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <FlagImg code={teamA!.flag_code} className="w-4 h-[10px] rounded-[1px]" />
                      <span className="text-[9px] text-slate-500 font-mono">{historicA!.year}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FlagImg code={teamB!.flag_code} className="w-4 h-[10px] rounded-[1px]" />
                      <span className="text-[9px] text-slate-500 font-mono">{historicB!.year}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-2">
                <StatRow label="Posesión" valueA={historicA!.avg_possession} valueB={historicB!.avg_possession} unit="%" />
                <StatRow label="Goles/PJ" valueA={historicA!.goals_per_match} valueB={historicB!.goals_per_match} />
                <StatRow label="Remates/PJ" valueA={historicA!.shots_per_match} valueB={historicB!.shots_per_match} />
                <StatRow label="xG/PJ" valueA={historicA!.xg_per_match} valueB={historicB!.xg_per_match} />
                <StatRow label="Precisión pase" valueA={historicA!.pass_accuracy} valueB={historicB!.pass_accuracy} unit="%" />
                <StatRow label="Pressing" valueA={historicA!.pressing_intensity} valueB={historicB!.pressing_intensity} />
                <StatRow label="Goles concedidos" valueA={historicA!.goals_conceded} valueB={historicB!.goals_conceded} higherIsBetter={false} />
              </div>
            </div>

            {/* Botón simular */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full mt-3 py-4 rounded-2xl font-black text-sm tracking-widest uppercase relative overflow-hidden transition-all"
              style={{
                background: simulating ? "rgba(245,185,66,0.1)" : "rgba(245,185,66,0.15)",
                border: "1px solid rgba(245,185,66,0.4)",
                color: simulating ? "#92784d" : "#f5b942",
              }}
            >
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse 80% 120% at 50% 0%, rgba(245,185,66,0.08) 0%, transparent 70%)" }} />
              <div className="relative flex items-center justify-center gap-2.5">
                {simulating ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 rounded-full border-2 border-amber-400/20 border-t-amber-400/60" />
                    Simulando partido…
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                      <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" />
                    </svg>
                    Simular partido
                  </>
                )}
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultado simulación */}
      <AnimatePresence>
        {simResult && teamA && teamB && historicA && historicB && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
            <SimulationResult
              {...simResult}
              teamA={teamA}
              teamB={teamB}
              historicA={historicA}
              historicB={historicB}
              coaches={coaches}
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
