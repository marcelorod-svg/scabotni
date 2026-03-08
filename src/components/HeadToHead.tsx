"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { DBTeam, DBCoachPersonality } from "@/lib/supabase";

const LABEL_CLASS = "text-slate-500 font-mono";
const SIDE_COLORS = {
  A: { text: "#ef4444", border: "rgba(239,68,68,0.4)", bg: "rgba(239,68,68,0.12)" },
  B: { text: "#60a5fa", border: "rgba(96,165,250,0.4)", bg: "rgba(96,165,250,0.12)" },
};

const TEAM_COLOR_BY_ID: Record<string, string> = {
  argentina: "#75AADB",
  brazil: "#F7D117",
  uruguay: "#7EC8E3",
  colombia: "#FCD116",
  ecuador: "#F4D03F",
  paraguay: "#EF4444",
  chile: "#DC2626",
  peru: "#B91C1C",
  venezuela: "#F59E0B",
  bolivia: "#16A34A",

  germany: "#111827",
  france: "#1D4ED8",
  spain: "#DC2626",
  england: "#EF4444",
  netherlands: "#F97316",
  portugal: "#16A34A",
  italy: "#2563EB",
  croatia: "#EF4444",
  belgium: "#F59E0B",
  switzerland: "#DC2626",
  denmark: "#DC2626",
  poland: "#DC2626",
  sweden: "#FACC15",
  ukraine: "#2563EB",
  serbia: "#DC2626",
  romania: "#FACC15",
  turkey: "#DC2626",
  slovakia: "#2563EB",
  hungary: "#16A34A",
  austria: "#DC2626",
  scotland: "#2563EB",
  czech_republic: "#DC2626",
  albania: "#B91C1C",
  georgia: "#EF4444",
  norway: "#DC2626",

  united_states: "#2563EB",
  usa: "#2563EB",
  mexico: "#16A34A",
  canada: "#DC2626",
  costa_rica: "#DC2626",
  panama: "#DC2626",
  honduras: "#2563EB",
  jamaica: "#FACC15",
  curacao: "#2563EB",
  haiti: "#2563EB",

  morocco: "#DC2626",
  senegal: "#16A34A",
  nigeria: "#16A34A",
  cameroon: "#16A34A",
  ghana: "#F59E0B",
  ivory_coast: "#F97316",
  south_africa: "#16A34A",
  tunisia: "#DC2626",
  algeria: "#16A34A",
  egypt: "#DC2626",
  mali: "#FACC15",
  cape_verde: "#2563EB",

  japan: "#DC2626",
  south_korea: "#DC2626",
  iran: "#16A34A",
  australia: "#FACC15",
  saudi_arabia: "#16A34A",
  qatar: "#6D28D9",
  jordan: "#DC2626",
  uzbekistan: "#2563EB",
  indonesia: "#DC2626",

  new_zealand: "#111827",
};

function getTeamColor(team: DBTeam, side: "A" | "B") {
  return TEAM_COLOR_BY_ID[team.id] ?? (side === "A" ? SIDE_COLORS.A.text : SIDE_COLORS.B.text);
}

const COACH_AVATAR_BY_ID: Record<string, string> = {
  alfaro: "alfaro",
  bilardo: "bilardo",
  cr7personality: "cristiano",
  pepbot: "guardiola",
  mou: "mourinho",
  piojo: "piojo",
  ruggeri: "ruggeri",
  scabotni: "scaloni",
};

function coachAvatarSrc(coach: DBCoachPersonality) {
  const mapped = COACH_AVATAR_BY_ID[coach.id];
  return mapped ? `/avatars/${mapped}.png` : coach.avatar_file;
}

function FlagImg({ code, className }: { code: string; className?: string }) {
  return <img src={`https://flagcdn.com/${code}.svg`} alt="" className={className} loading="lazy" />;
}

function useTypewriter(text: string, speed = 18, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

const CONF_ORDER = ["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"];
const CONF_COLORS: Record<string, string> = {
  CONMEBOL: "#f5b942",
  UEFA: "#60a5fa",
  CONCACAF: "#34d399",
  CAF: "#f87171",
  AFC: "#a78bfa",
  OFC: "#94a3b8",
};

// ── Tipos H2H ──────────────────────────────────────────────────
interface H2HElimination {
  year: number;
  stage: string;
  score_a: number;
  score_b: number;
  conditions: string | null;
}
interface H2HMatch {
  year: number;
  stage: string;
  score_a: number;
  score_b: number;
  winner: string | null;
  conditions: string | null;
}
interface H2HSummary {
  played: number;
  wins_a: number;
  wins_b: number;
  draws: number;
  goals_a: number;
  goals_b: number;
  last_year: number | null;
  last_stage: string | null;
  last_score_a: number | null;
  last_score_b: number | null;
  last_winner: string | null;
  eliminations_a: H2HElimination[];
  eliminations_b: H2HElimination[];
  finals_played: Array<{ year: number; winner: string; score_a: number; score_b: number }>;
  all_matches: H2HMatch[];
}

const STAGE_LABELS: Record<string, string> = {
  "Group stage": "Fase de Grupos",
  "First round": "Primera Ronda",
  "First group stage": "Primera Fase",
  "Second group stage": "Segunda Fase",
  "Final stage": "Fase Final",
  "Round of 16": "Octavos",
  "Quarter-finals": "Cuartos",
  "Semi-finals": "Semifinal",
  "Third-place match": "3er Puesto",
  Final: "Final",
};
function stageLabel(s: string): string {
  for (const [k, v] of Object.entries(STAGE_LABELS)) {
    if (s.toLowerCase().includes(k.toLowerCase())) return v;
  }
  return s;
}

// ── Team Selector ──────────────────────────────────────────────
function TeamSelector({
  teams,
  selected,
  onSelect,
  label,
  exclude,
  side,
}: {
  teams: DBTeam[];
  selected: DBTeam | null;
  onSelect: (t: DBTeam) => void;
  label: string;
  exclude?: string;
  side: "A" | "B";
}) {
  const [open, setOpen] = useState(false);
  const [activeConf, setActiveConf] = useState("CONMEBOL");
  const sc = SIDE_COLORS[side];
  const selectedColor = selected ? getTeamColor(selected, side) : sc.text;
  const available = teams.filter((t) => t.id !== exclude);

  const grouped = CONF_ORDER.reduce((acc, conf) => {
    acc[conf] = available.filter((t) => t.confederation === conf);
    return acc;
  }, {} as Record<string, DBTeam[]>);

  return (
    <div className="relative flex-1">
      <div className={`text-[9px] uppercase tracking-widest mb-1.5 ${LABEL_CLASS}`}>{label}</div>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
        style={{
          background: "rgba(13,17,23,0.97)",
          border: selected ? `1px solid ${sc.border}` : "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {selected ? (
          <>
            <FlagImg code={selected.flag_code} className="w-7 h-[17px] rounded-[2px] flex-shrink-0" />
            <span className="text-sm font-bold truncate" style={{ color: selectedColor }}>
              {selected.name}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-600 font-mono">Elegir equipo…</span>
        )}
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5 text-slate-600 ml-auto flex-shrink-0">
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 10 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="fixed left-3 right-3 top-[10vh] bottom-[10vh] z-50 rounded-2xl overflow-hidden flex flex-col min-h-0"
              style={{
                background: "rgba(8,12,18,0.99)",
                border: `1px solid ${sc.border}`,
                boxShadow: `0 0 40px rgba(0,0,0,0.8), 0 0 20px ${sc.bg}`,
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 flex-shrink-0">
                <div>
                  <div className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>Seleccioná un equipo</div>
                  <div className="text-sm font-black text-white mt-0.5">{label}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#64748b" }}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="flex gap-1 px-3 py-2.5 border-b border-slate-800/60 overflow-x-auto flex-shrink-0" style={{ scrollbarWidth: "none" }}>
                {CONF_ORDER.map((conf) => {
                  const count = grouped[conf]?.length ?? 0;
                  if (count === 0) return null;
                  const isActive = activeConf === conf;
                  const cc = CONF_COLORS[conf];
                  return (
                    <button
                      key={conf}
                      onClick={() => setActiveConf(conf)}
                      className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all"
                      style={{
                        background: isActive ? `${cc}18` : "transparent",
                        border: isActive ? `1px solid ${cc}50` : "1px solid transparent",
                      }}
                    >
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: isActive ? cc : "#475569" }}>
                        {conf}
                      </span>
                      <span className="text-[8px] font-mono tabular-nums" style={{ color: isActive ? `${cc}99` : "#334155" }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className="overflow-y-auto flex-1 min-h-0 p-3"
                style={{ scrollbarWidth: "thin", WebkitOverflowScrolling: "touch" as const }}
              >
                <div className="grid grid-cols-6 gap-2">
                  {(grouped[activeConf] ?? []).map((team) => {
                    const isSel = selected?.id === team.id;
                    const teamColor = getTeamColor(team, side);
                    return (
                      <motion.button
                        key={team.id}
                        onClick={() => {
                          onSelect(team);
                          setOpen(false);
                        }}
                        whileTap={{ scale: 0.93 }}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all"
                        style={{
                          background: isSel ? sc.bg : "rgba(255,255,255,0.03)",
                          border: isSel ? `1px solid ${sc.border}` : "1px solid rgba(255,255,255,0.05)",
                          boxShadow: isSel ? `0 0 12px ${sc.bg}` : "none",
                        }}
                      >
                        <div className="relative">
                          <FlagImg code={team.flag_code} className="w-9 h-6 rounded-[3px] object-cover" />
                          {isSel && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                              style={{ background: teamColor }}
                            >
                              <svg viewBox="0 0 10 10" fill="none" className="w-2 h-2">
                                <path d="M2 5l2 2 4-4" stroke="#fff" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </motion.div>
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-center leading-tight line-clamp-2" style={{ color: isSel ? teamColor : "#64748b", wordBreak: "break-word" }}>
                          {team.name}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


// ── H2H Record ────────────────────────────────────────────────
function H2HRecord({ summary, teamA, teamB }: { summary: H2HSummary | null; teamA: DBTeam; teamB: DBTeam }) {
  const colorA = getTeamColor(teamA, "A");
  const colorB = getTeamColor(teamB, "B");

  if (!summary || summary.played === 0) {
    return (
      <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-2xl mb-2">⚡</div>
        <p className="text-slate-400 text-xs font-bold">Primer cruce en la historia del Mundial</p>
        <p className="text-slate-700 text-[10px] font-mono mt-1">
          {teamA.name} y {teamB.name} nunca se enfrentaron en una Copa del Mundo
        </p>
      </div>
    );
  }
  const { played, wins_a, wins_b, draws, goals_a, goals_b, eliminations_a, eliminations_b, finals_played, all_matches } = summary;
  const total = played || 1;
  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Historial en Mundiales · {played} {played === 1 ? "partido" : "partidos"}
          </span>
          {finals_played.length > 0 && (
            <span className="text-[8px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245,185,66,0.1)", color: "#f5b942", border: "1px solid rgba(245,185,66,0.25)" }}>
              🏆 {finals_played.length === 1 ? "1 Final" : `${finals_played.length} Finales`}
            </span>
          )}
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col items-center gap-1">
              <FlagImg code={teamA.flag_code} className="w-8 h-[20px] rounded-[2px]" />
              <span className="text-3xl font-black tabular-nums" style={{ color: colorA }}>
                {wins_a}
              </span>
              <span className={`text-[8px] uppercase ${LABEL_CLASS}`}>victorias</span>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-slate-600 tabular-nums">{draws}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Empates</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FlagImg code={teamB.flag_code} className="w-8 h-[20px] rounded-[2px]" />
              <span className="text-3xl font-black tabular-nums" style={{ color: colorB }}>
                {wins_b}
              </span>
              <span className={`text-[8px] uppercase ${LABEL_CLASS}`}>victorias</span>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex gap-0.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(wins_a / total) * 100}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: colorA + "b3" }} />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(draws / total) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full bg-slate-600 rounded-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(wins_b / total) * 100}%` }} transition={{ duration: 0.8, delay: 0.2 }} className="h-full rounded-full" style={{ background: colorB + "b3" }} />
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-900">
            <div className="text-center">
              <div className="text-base font-black text-white tabular-nums">{goals_a}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
            <div className={`text-[9px] self-center uppercase ${LABEL_CLASS}`}>vs</div>
            <div className="text-center">
              <div className="text-base font-black text-white tabular-nums">{goals_b}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
          </div>
        </div>
      </div>

      {(eliminations_a.length > 0 || eliminations_b.length > 0) && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2.5 border-b border-slate-800">
            <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>⚡ Eliminaciones directas</span>
          </div>
          <div className="px-4 py-3 space-y-2">
            {eliminations_a.map((e, i) => (
              <div key={`a-${i}`} className="flex items-center gap-2">
                <FlagImg code={teamA.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                <span className="text-[10px] font-bold" style={{ color: colorA }}>
                  {teamA.name} eliminó a {teamB.name}
                </span>
                <span className="ml-auto text-[9px] font-mono text-slate-500">
                  {e.year} · {stageLabel(e.stage)} · {e.score_a}-{e.score_b}
                  {e.conditions && e.conditions !== "normal" ? ` (${e.conditions === "penalties" ? "pen." : "p.e."})` : ""}
                </span>
              </div>
            ))}
            {eliminations_b.map((e, i) => (
              <div key={`b-${i}`} className="flex items-center gap-2">
                <FlagImg code={teamB.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                <span className="text-[10px] font-bold" style={{ color: colorB }}>
                  {teamB.name} eliminó a {teamA.name}
                </span>
                <span className="ml-auto text-[9px] font-mono text-slate-500">
                  {e.year} · {stageLabel(e.stage)} · {e.score_a}-{e.score_b}
                  {e.conditions && e.conditions !== "normal" ? ` (${e.conditions === "penalties" ? "pen." : "p.e."})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {all_matches.length > 0 && (
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2.5 border-b border-slate-800">
            <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>Todos los partidos</span>
          </div>
          <div className="divide-y divide-slate-900">
            {all_matches.map((m, i) => {
              const winnerIsA = m.winner === teamA.id;
              const winnerIsB = m.winner === teamB.id;
              const isFinal = m.stage?.toLowerCase() === "final";
              return (
                <div key={i} className="px-4 py-2.5 flex items-center gap-3" style={{ background: isFinal ? "rgba(245,185,66,0.04)" : "transparent" }}>
                  <div className="flex items-center gap-2 flex-1">
                    <FlagImg code={teamA.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                    <span className="text-xs font-black tabular-nums" style={{ color: winnerIsA ? colorA : "#94a3b8" }}>
                      {m.score_a}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-700 font-mono">–</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className="text-xs font-black tabular-nums" style={{ color: winnerIsB ? colorB : "#94a3b8" }}>
                      {m.score_b}
                    </span>
                    <FlagImg code={teamB.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[80px]">
                    <div className="text-[9px] font-mono text-slate-500 flex items-center gap-1 justify-end">
                      {isFinal && <span className="text-amber-400">🏆</span>}
                      {m.year}
                    </div>
                    <div className="text-[8px] text-slate-700 font-mono truncate">{stageLabel(m.stage)}</div>
                    {m.conditions && m.conditions !== "normal" && <div className="text-[7px] text-slate-700 font-mono">{m.conditions === "penalties" ? "penales" : "p. extra"}</div>}
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

// ── StatRow ────────────────────────────────────────────────────
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
          {valueA}
          {unit}
        </span>
        <div className="h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ml-auto ${betterA ? "bg-amber-400/70" : "bg-slate-600"}`} style={{ width: `${(valueA / max) * 100}%` }} />
        </div>
      </div>
      <div className={`text-[9px] text-center uppercase font-mono px-2 ${LABEL_CLASS}`} style={{ minWidth: 80 }}>
        {label}
      </div>
      <div>
        <span className={`text-sm font-black tabular-nums ${betterB ? "text-amber-400" : "text-slate-300"}`}>
          {valueB}
          {unit}
        </span>
        <div className="h-1 rounded-full bg-slate-800 mt-1 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${betterB ? "bg-amber-400/70" : "bg-slate-600"}`} style={{ width: `${(valueB / max) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── CoachBubble ────────────────────────────────────────────────
function CoachBubble({ coach, comment, delay, isRight }: { coach: DBCoachPersonality; comment: string; delay: number; isRight: boolean }) {
  const { displayed, done } = useTypewriter(comment, 18, delay);
  const [avatarFailed, setAvatarFailed] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: delay / 1000, duration: 0.35 }} className={`flex items-start gap-3 ${isRight ? "flex-row-reverse" : "flex-row"}`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden" style={{ border: "2px solid rgba(245,185,66,0.4)", boxShadow: "0 0 10px rgba(245,185,66,0.2)" }}>
        {!avatarFailed ? (
          <img src={coachAvatarSrc(coach)} alt={coach.name} width={40} height={40} className="w-full h-full object-cover object-top" onError={() => setAvatarFailed(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <span className="text-[10px] font-black font-mono text-amber-400">{coach.initials}</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`flex items-baseline gap-2 mb-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] font-bold text-amber-400 tracking-tight">{coach.name}</span>
          <span className="text-[9px] text-slate-500 font-mono truncate">{coach.role}</span>
        </div>
        <motion.div
          animate={!done ? { boxShadow: ["0 0 6px rgba(245,185,66,0.1)", "0 0 14px rgba(245,185,66,0.25)", "0 0 6px rgba(245,185,66,0.1)"] } : { boxShadow: "0 0 10px rgba(245,185,66,0.15)" }}
          transition={{ duration: 1.8, repeat: !done ? Infinity : 0 }}
          className="relative rounded-xl border border-amber-500/30 overflow-hidden"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <p className="px-4 py-3 text-[12px] text-slate-200 leading-relaxed font-sans">
            "{displayed}
            {!done && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }} className="inline-block w-[2px] h-3 bg-amber-400 ml-0.5 align-middle" />}
            {done && '"'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── CoachChip ──────────────────────────────────────────────────
function CoachChip({ coach, isSelected, isDisabled, onToggle }: { coach: DBCoachPersonality; isSelected: boolean; isDisabled: boolean; onToggle: () => void }) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      onClick={onToggle}
      disabled={isDisabled}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
      style={{
        background: isSelected ? "rgba(245,185,66,0.15)" : "rgba(255,255,255,0.04)",
        border: isSelected ? "1px solid rgba(245,185,66,0.5)" : "1px solid rgba(255,255,255,0.08)",
        opacity: isDisabled ? 0.4 : 1,
      }}
    >
      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0" style={{ border: isSelected ? "1px solid rgba(245,185,66,0.5)" : "1px solid rgba(255,255,255,0.1)" }}>
        {!failed ? (
          <img src={coachAvatarSrc(coach)} alt={coach.name} width={20} height={20} className="w-full h-full object-cover object-top" onError={() => setFailed(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <span className="text-[7px] font-black text-amber-400">{coach.initials}</span>
          </div>
        )}
      </div>
      <span className={`text-[10px] font-bold ${isSelected ? "text-amber-400" : "text-slate-500"}`}>{coach.name}</span>
      {isSelected && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-amber-400 text-[8px]">
          ✓
        </motion.span>
      )}
    </button>
  );
}

type TeamStats = { played: number; won: number; drawn: number; lost: number; goals_for: number; goals_against: number; titles: number };

function buildContextText(summary: H2HSummary | null, teamAId: string, teamAName: string, teamBId: string, teamBName: string): string {
  if (!summary || summary.played === 0) return `${teamAName} y ${teamBName} nunca se enfrentaron en una Copa del Mundo. Si se cruzan en el WC 2026, será la primera vez en la historia.`;
  const { played, wins_a, wins_b, draws, goals_a, goals_b, eliminations_a, eliminations_b, finals_played, last_year, last_stage, last_score_a, last_score_b, last_winner } = summary;
  const lines: string[] = [];
  lines.push(
    `${teamAName} vs ${teamBName} en Mundiales: ${played} partido${played !== 1 ? "s" : ""}. ${teamAName} ganó ${wins_a}, ${teamBName} ganó ${wins_b}, ${draws} empate${draws !== 1 ? "s" : ""}. Goles: ${teamAName} ${goals_a} - ${teamBName} ${goals_b}.`,
  );
  if (finals_played.length > 0) {
    const desc = finals_played.map((f) => `${f.year} (ganó ${f.winner === teamAId ? teamAName : teamBName} ${f.score_a}-${f.score_b})`).join(", ");
    lines.push(`Se cruzaron en ${finals_played.length === 1 ? "una final" : "finales"}: ${desc}.`);
  }
  if (eliminations_a.length > 0) {
    const desc = eliminations_a
      .map((e) => `${e.year} en ${stageLabel(e.stage)} ${e.score_a}-${e.score_b}${e.conditions && e.conditions !== "normal" ? ` (${e.conditions === "penalties" ? "penales" : "prórroga"})` : ""}`)
      .join(", ");
    lines.push(`${teamAName} eliminó a ${teamBName} en: ${desc}.`);
  }
  if (eliminations_b.length > 0) {
    const desc = eliminations_b
      .map((e) => `${e.year} en ${stageLabel(e.stage)} ${e.score_a}-${e.score_b}${e.conditions && e.conditions !== "normal" ? ` (${e.conditions === "penalties" ? "penales" : "prórroga"})` : ""}`)
      .join(", ");
    lines.push(`${teamBName} eliminó a ${teamAName} en: ${desc}.`);
  }
  if (wins_a > 0 && wins_b === 0) lines.push(`${teamAName} nunca perdió contra ${teamBName} en un Mundial.`);
  else if (wins_b > 0 && wins_a === 0) lines.push(`${teamBName} nunca perdió contra ${teamAName} en un Mundial.`);
  if (last_year) {
    const lwName = last_winner === teamAId ? teamAName : last_winner === teamBId ? teamBName : "nadie (empate)";
    lines.push(`Último encuentro: ${last_year} en ${stageLabel(last_stage || "")} — ${teamAName} ${last_score_a}-${last_score_b} ${teamBName} (ganó ${lwName}).`);
  }
  return lines.join(" ");
}

// ── DT Section ────────────────────────────────────────────────
function DTSection({
  coaches,
  teamA,
  teamB,
  teamAStats,
  teamBStats,
  h2hSummary,
}: {
  coaches: DBCoachPersonality[];
  teamA: DBTeam;
  teamB: DBTeam;
  teamAStats: TeamStats | null;
  teamBStats: TeamStats | null;
  h2hSummary: H2HSummary | null;
}) {
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isDebate = selectedCoachIds.length === 2;

  useEffect(() => {
    setSelectedCoachIds([]);
    setComments({});
    setLoading(false);
    setRevealed(false);
  }, [teamA.id, teamB.id]);

  function toggleCoach(id: string) {
    setSelectedCoachIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 2 ? [...prev, id] : prev));
    setRevealed(false);
    setComments({});
  }

  async function loadComments() {
    if (selectedCoachIds.length === 0) return;
    setLoading(true);
    setRevealed(true);
    setComments({});
    const h2hContext = buildContextText(h2hSummary, teamA.id, teamA.name, teamB.id, teamB.name);
    const base = {
      teamAName: teamA.name,
      teamBName: teamB.name,
      teamAStats,
      teamBStats,
      h2hContext,
      resultA: null,
      resultB: null,
      probA: null,
      probB: null,
      probDraw: null,
    };
    try {
      if (isDebate) {
        const [c1, c2] = selectedCoachIds.map((id) => coaches.find((c) => c.id === id)!);
        const res = await fetch("/api/coach-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...base, mode: "debate", coachSystemPrompt: c1.system_prompt, coachSystemPrompt2: c2.system_prompt, coachName: c1.name, coachName2: c2.name }),
        });
        const data = await res.json();
        setComments({ [c1.id]: data.comment || "Sin señal.", [c2.id]: data.comment2 || "..." });
      } else {
        const coach = coaches.find((c) => c.id === selectedCoachIds[0])!;
        const res = await fetch("/api/coach-comment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...base, mode: "h2h_analysis", coachSystemPrompt: coach.system_prompt, coachName: coach.name }),
        });
        const data = await res.json();
        setComments({ [coach.id]: data.comment || "Sin señal del DT." });
      }
    } catch {
      selectedCoachIds.forEach((id) => setComments((p) => ({ ...p, [id]: "Sin señal del DT." })));
    }
    setLoading(false);
  }

  const selectedCoaches = coaches.filter((c) => selectedCoachIds.includes(c.id));
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <motion.div animate={{ opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: "0 0 6px #34d39980" }} />
        <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>{isDebate ? "Modo Debate" : "Análisis de DT · Elegí hasta 2"}</span>
        {isDebate && (
          <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(245,185,66,0.12)", color: "#f5b942", border: "1px solid rgba(245,185,66,0.3)" }}>
            ⚡ Debate
          </motion.span>
        )}
      </div>
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {coaches.map((coach) => (
            <CoachChip
              key={coach.id}
              coach={coach}
              isSelected={selectedCoachIds.includes(coach.id)}
              isDisabled={!selectedCoachIds.includes(coach.id) && selectedCoachIds.length >= 2}
              onToggle={() => {
                if (!selectedCoachIds.includes(coach.id) && selectedCoachIds.length >= 2) return;
                toggleCoach(coach.id);
              }}
            />
          ))}
        </div>
        <AnimatePresence>
          {isDebate && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 px-3 py-2 rounded-xl text-[10px] font-mono" style={{ background: "rgba(245,185,66,0.06)", border: "1px solid rgba(245,185,66,0.15)", color: "#a16207" }}>
              Los DTs van a debatir entre sí sobre este partido
            </motion.div>
          )}
        </AnimatePresence>
        {selectedCoachIds.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={loadComments}
            disabled={loading}
            className="mt-3 w-full py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all"
            style={{ background: loading ? "rgba(245,185,66,0.06)" : "rgba(245,185,66,0.12)", border: "1px solid rgba(245,185,66,0.35)", color: loading ? "#6b5a2e" : "#f5b942" }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="inline-block w-3 h-3 rounded-full border-2 border-amber-400/20 border-t-amber-400/60" />
                {isDebate ? "Generando debate…" : "Pensando…"}
              </span>
            ) : isDebate ? (
              `Que debatan: ${selectedCoaches.map((c) => c.name).join(" vs ")}`
            ) : (
              `Escuchar a ${selectedCoaches[0]?.name}`
            )}
          </motion.button>
        )}
      </div>
      <AnimatePresence>
        {revealed && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t border-slate-900">
            <div className="px-4 py-4 space-y-5">
              {loading ? (
                [0, 1].slice(0, selectedCoachIds.length).map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 + 0.05 }} className="h-3 rounded bg-slate-800 w-24" />
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 + 0.1 }} className="h-16 rounded-xl bg-slate-800 w-full" />
                    </div>
                  </div>
                ))
              ) : (
                selectedCoaches.filter((c) => comments[c.id]).map((coach, i) => <CoachBubble key={`${coach.id}-${Object.keys(comments).join("-")}`} coach={coach} comment={comments[coach.id]} delay={i * 800} isRight={isDebate ? i % 2 !== 0 : false} />)
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modo2Placeholder() {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-8 text-center space-y-3" style={{ background: "rgba(13,17,23,0.97)", border: "1px dashed rgba(245,185,66,0.2)" }}>
      <div className="text-3xl">🏆</div>
      <div className="text-sm font-black text-white tracking-wide">Selecciones Históricas</div>
      <p className="text-xs text-slate-500 font-mono leading-relaxed">Navegá por cada edición del Mundial, comparé campeones y subcampeones históricos, y simulá partidos entre leyendas.</p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono" style={{ background: "rgba(245,185,66,0.08)", border: "1px solid rgba(245,185,66,0.2)", color: "#f5b942" }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          ●
        </motion.span>
        Próximamente
      </div>
    </motion.div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
export default function HeadToHead() {
  const [mode, setMode] = useState<"actual" | "historico">("actual");
  const [teams, setTeams] = useState<DBTeam[]>([]);
  const [coaches, setCoaches] = useState<DBCoachPersonality[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamA, setTeamA] = useState<DBTeam | null>(null);
  const [teamB, setTeamB] = useState<DBTeam | null>(null);
  const [h2hSummary, setH2HSummary] = useState<H2HSummary | null>(null);
  const [loadingH2H, setLoadingH2H] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [teamsRes, coachesRes] = await Promise.all([supabase.from("teams").select("*").order("name"), supabase.from("coach_personalities").select("*").eq("active", true)]);
        if (teamsRes.data) setTeams(teamsRes.data);
        if (coachesRes.data) setCoaches(coachesRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!teamA || !teamB) return;

    const teamAId = teamA.id;
    const teamBId = teamB.id;

    setH2HSummary(null);

    async function loadH2H() {
      setLoadingH2H(true);
      try {
        const { data, error } = await supabase.rpc("get_h2h_summary", { team_a: teamAId, team_b: teamBId }).single();

        if (error || !data) {
          setH2HSummary(null);
          return;
        }

        const d = data as Partial<H2HSummary>;

        setH2HSummary({
          played: d.played ?? 0,
          wins_a: d.wins_a ?? 0,
          wins_b: d.wins_b ?? 0,
          draws: d.draws ?? 0,
          goals_a: d.goals_a ?? 0,
          goals_b: d.goals_b ?? 0,
          last_year: d.last_year ?? null,
          last_stage: d.last_stage ?? null,
          last_score_a: d.last_score_a ?? null,
          last_score_b: d.last_score_b ?? null,
          last_winner: d.last_winner ?? null,
          eliminations_a: d.eliminations_a ?? [],
          eliminations_b: d.eliminations_b ?? [],
          finals_played: d.finals_played ?? [],
          all_matches: d.all_matches ?? [],
        });
      } catch {
        setH2HSummary(null);
      } finally {
        setLoadingH2H(false);
      }
    }

    loadH2H();
  }, [teamA, teamB]);

  const bothSelected = teamA && teamB;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-8 h-8 rounded-full border-2 border-amber-400/20 border-t-amber-400" />
        <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>Cargando…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="pt-1">
        <div className={`text-[9px] uppercase tracking-widest mb-1 ${LABEL_CLASS}`}>Modo Duelo</div>
        <h2 className="text-xl font-black text-white tracking-wide">Head to Head</h2>
        <p className={`text-[11px] mt-0.5 ${LABEL_CLASS}`}>Historial en Mundiales · Análisis de DTs</p>
      </div>

      <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[{ key: "actual", label: "Selecciones Actuales", sub: "WC 2026 · 48 equipos" }, { key: "historico", label: "Históricas", sub: "Campeones · Leyendas" }].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as typeof mode)}
            className="flex-1 text-left px-3 py-2.5 rounded-lg transition-all"
            style={{ background: mode === m.key ? "rgba(245,185,66,0.1)" : "transparent", border: mode === m.key ? "1px solid rgba(245,185,66,0.3)" : "1px solid transparent" }}
          >
            <div className={`text-[11px] font-bold ${mode === m.key ? "text-amber-400" : "text-slate-500"}`}>{m.label}</div>
            <div className="text-[9px] font-mono text-slate-700 mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === "historico" && (
          <motion.div key="modo2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modo2Placeholder />
          </motion.div>
        )}
        {mode === "actual" && (
          <motion.div key="modo1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-3">
                <TeamSelector
                  teams={teams}
                  selected={teamA}
                  onSelect={(t) => {
                    setTeamA(t);
                    setH2HSummary(null);
                  }}
                  label="Selección A"
                  exclude={teamB?.id}
                  side="A"
                />
                <div className="flex items-end pb-1">
                  <span className="text-slate-700 font-black text-lg">vs</span>
                </div>
                <TeamSelector
                  teams={teams}
                  selected={teamB}
                  onSelect={(t) => {
                    setTeamB(t);
                    setH2HSummary(null);
                  }}
                  label="Selección B"
                  exclude={teamA?.id}
                  side="B"
                />
              </div>
              <AnimatePresence>
                {bothSelected && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden mt-3 pt-3 border-t border-slate-900">
                    <div className="grid grid-cols-2 gap-3">
                      {([teamA, teamB] as [DBTeam, DBTeam]).map((team, idx) => (
                        <div key={team.id} className="space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FlagImg code={team.flag_code} className="w-5 h-[13px] rounded-[2px]" />
                            <span className="text-[10px] font-bold truncate" style={{ color: getTeamColor(team, idx === 0 ? "A" : "B") }}>
                              {team.name}
                            </span>
                          </div>
                          {[{ label: "Part.", value: team.participations }, { label: "PJ", value: team.played }, { label: "V", value: team.won }, { label: "Títulos", value: team.titles }].map((s) => (
                            <div key={s.label} className="flex justify-between items-center">
                              <span className={`text-[9px] ${LABEL_CLASS}`}>{s.label}</span>
                              <span className="text-[10px] font-bold text-white tabular-nums">{s.value}</span>
                            </div>
                          ))}
                          {team.best_position && <div className="text-[8px] font-mono text-amber-400/60 leading-tight mt-1">{team.best_position}</div>}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {bothSelected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingH2H ? (
                    <div className="rounded-2xl p-6 flex items-center justify-center gap-3" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }} className="w-3 h-3 rounded-full bg-amber-400/50" />
                      <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>Consultando historial…</span>
                    </div>
                  ) : (
                    <H2HRecord summary={h2hSummary} teamA={teamA!} teamB={teamB!} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {bothSelected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>Comparación histórica en Mundiales</span>
                        <div className="flex items-center gap-3">
                          {([teamA, teamB] as [DBTeam, DBTeam]).map((t, i) => (
                            <div key={t.id} className="flex items-center gap-1.5">
                              <FlagImg code={t.flag_code} className="w-4 h-[10px] rounded-[1px]" />
                              <span className="text-[9px] font-mono" style={{ color: getTeamColor(t, i === 0 ? "A" : "B") + "b3" }}>
                                {t.confederation}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <StatRow label="Partidos WC" valueA={teamA!.played} valueB={teamB!.played} />
                      <StatRow label="Victorias" valueA={teamA!.won} valueB={teamB!.won} />
                      <StatRow label="Goles" valueA={teamA!.goals_for} valueB={teamB!.goals_for} />
                      <StatRow label="G/PJ" valueA={parseFloat((teamA!.goals_for / Math.max(teamA!.played, 1)).toFixed(2))} valueB={parseFloat((teamB!.goals_for / Math.max(teamB!.played, 1)).toFixed(2))} />
                      <StatRow label="Títulos" valueA={teamA!.titles} valueB={teamB!.titles} />
                      <StatRow label="G. concedidos" valueA={teamA!.goals_against} valueB={teamB!.goals_against} higherIsBetter={false} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {bothSelected && coaches.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
                  <DTSection
                    coaches={coaches}
                    teamA={teamA!}
                    teamB={teamB!}
                    h2hSummary={h2hSummary}
                    teamAStats={{ played: teamA!.played, won: teamA!.won, drawn: teamA!.drawn, lost: teamA!.lost, goals_for: teamA!.goals_for, goals_against: teamA!.goals_against, titles: teamA!.titles }}
                    teamBStats={{ played: teamB!.played, won: teamB!.won, drawn: teamB!.drawn, lost: teamB!.lost, goals_for: teamB!.goals_for, goals_against: teamB!.goals_against, titles: teamB!.titles }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
