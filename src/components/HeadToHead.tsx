"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type {
  DBTeam,
  DBH2HRecord,
  DBH2HMatch,
  DBCoachPersonality,
} from "@/lib/supabase";
import { useIsMobile } from "@/hooks/useMobilePerf";

// ─── HELPERS ──────────────────────────────────────────────────

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

// ─── TYPEWRITER HOOK (igual que Vestuario) ────────────────────

function useTypewriter(text: string, speed = 18, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false); let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++; setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(start);
  }, [text, speed, startDelay]);
  return { displayed, done };
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
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60"
              onClick={() => { setOpen(false); setQuery(""); }}
            />
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
                  <div className="px-4 py-8 text-center text-slate-600 text-sm font-mono">Sin resultados</div>
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

// ─── H2H RECORD ───────────────────────────────────────────────

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
      <div className="rounded-2xl p-5 text-center"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-2xl mb-2">⚡</div>
        <p className="text-slate-500 text-xs font-mono">Primer cruce en la historia del Mundial</p>
        <p className="text-slate-700 text-[10px] font-mono mt-1">No hay antecedentes registrados entre estas selecciones</p>
      </div>
    );
  }

  const aIsA = teamA.id < teamB.id;
  const winsA = aIsA ? record.team_a_wins : record.team_b_wins;
  const winsB = aIsA ? record.team_b_wins : record.team_a_wins;
  const goalsA = aIsA ? record.team_a_goals : record.team_b_goals;
  const goalsB = aIsA ? record.team_b_goals : record.team_a_goals;
  const total = record.played || 1;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Historial Mundial · {record.played} {record.played === 1 ? "partido" : "partidos"}
          </span>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-col items-center gap-1">
              <FlagImg code={teamA.flag_code} className="w-8 h-[20px] rounded-[2px]" />
              <span className="text-3xl font-black text-white tabular-nums">{winsA}</span>
              <span className={`text-[8px] uppercase ${LABEL_CLASS}`}>victorias</span>
            </div>
            <div className="text-center">
              <div className="text-xl font-black text-slate-600 tabular-nums">{record.draws}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Empates</div>
            </div>
            <div className="flex flex-col items-center gap-1">
              <FlagImg code={teamB.flag_code} className="w-8 h-[20px] rounded-[2px]" />
              <span className="text-3xl font-black text-white tabular-nums">{winsB}</span>
              <span className={`text-[8px] uppercase ${LABEL_CLASS}`}>victorias</span>
            </div>
          </div>
          {/* Barra dominancia */}
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden flex gap-0.5">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(winsA / total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-amber-400/70 rounded-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(record.draws / total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="h-full bg-slate-600 rounded-full" />
            <motion.div initial={{ width: 0 }} animate={{ width: `${(winsB / total) * 100}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="h-full bg-blue-400/70 rounded-full" />
          </div>
          <div className="flex justify-between mt-3 pt-3 border-t border-slate-900">
            <div className="text-center">
              <div className="text-base font-black text-white tabular-nums">{goalsA}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
            <div className={`text-[9px] self-center uppercase ${LABEL_CLASS}`}>vs</div>
            <div className="text-center">
              <div className="text-base font-black text-white tabular-nums">{goalsB}</div>
              <div className={`text-[8px] uppercase ${LABEL_CLASS}`}>Goles</div>
            </div>
          </div>
        </div>
      </div>

      {matches.length > 0 && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="px-4 py-2.5 border-b border-slate-800">
            <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>Partidos en Mundiales</span>
          </div>
          <div className="divide-y divide-slate-900">
            {matches.slice(0, 6).map((m) => {
              const aIsA2 = m.team_a_id === teamA.id;
              const gA = aIsA2 ? m.team_a_goals : m.team_b_goals;
              const gB = aIsA2 ? m.team_b_goals : m.team_a_goals;
              return (
                <div key={m.id} className="px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <FlagImg code={teamA.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                    <span className={`text-xs font-black tabular-nums ${gA > gB ? "text-amber-400" : "text-slate-400"}`}>{gA}</span>
                  </div>
                  <span className="text-[10px] text-slate-700 font-mono">–</span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className={`text-xs font-black tabular-nums ${gB > gA ? "text-amber-400" : "text-slate-400"}`}>{gB}</span>
                    <FlagImg code={teamB.flag_code} className="w-5 h-[13px] rounded-[2px] flex-shrink-0" />
                  </div>
                  <div className="text-right flex-shrink-0 min-w-[72px]">
                    <div className="text-[9px] font-mono text-slate-500">{m.year}</div>
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

// ─── STAT ROW ─────────────────────────────────────────────────

function StatRow({
  label, valueA, valueB, unit = "", higherIsBetter = true,
}: {
  label: string; valueA: number; valueB: number; unit?: string; higherIsBetter?: boolean;
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
      <div className={`text-[9px] text-center uppercase font-mono px-2 ${LABEL_CLASS}`} style={{ minWidth: 80 }}>
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

// ─── TYPEWRITER BUBBLE (DT) ───────────────────────────────────

function CoachBubble({
  coach,
  comment,
  delay,
  isRight,
}: {
  coach: DBCoachPersonality;
  comment: string;
  delay: number;
  isRight: boolean;
}) {
  const { displayed, done } = useTypewriter(comment, 18, delay);
  const [avatarFailed, setAvatarFailed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.35, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isRight ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden"
        style={{ border: "2px solid rgba(245,185,66,0.4)", boxShadow: "0 0 10px rgba(245,185,66,0.2)" }}>
        {!avatarFailed ? (
          <img src={coach.avatar_file} alt={coach.name} width={40} height={40}
            className="w-full h-full object-cover object-top"
            onError={() => setAvatarFailed(true)} loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-900">
            <span className="text-[10px] font-black font-mono text-amber-400">{coach.initials}</span>
          </div>
        )}
      </div>

      {/* Burbuja */}
      <div className="flex-1 min-w-0">
        <div className={`flex items-baseline gap-2 mb-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] font-bold text-amber-400 tracking-tight">{coach.name}</span>
          <span className="text-[9px] text-slate-500 font-mono truncate">{coach.role}</span>
        </div>
        <motion.div
          animate={
            !done
              ? { boxShadow: ["0 0 6px rgba(245,185,66,0.1)", "0 0 14px rgba(245,185,66,0.25)", "0 0 6px rgba(245,185,66,0.1)"] }
              : { boxShadow: "0 0 10px rgba(245,185,66,0.15)" }
          }
          transition={{ duration: 1.8, repeat: !done ? Infinity : 0 }}
          className="relative rounded-xl border border-amber-500/30 overflow-hidden"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
          <p className="px-4 py-3 text-[12px] text-slate-200 leading-relaxed font-sans">
            "{displayed}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[2px] h-3 bg-amber-400 ml-0.5 align-middle"
              />
            )}
            {done && '"'}
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── DT PICKER ───────────────────────────────────────────────

function DTSection({
  coaches,
  teamA,
  teamB,
  simResult,
  teamAStats,
  teamBStats,
}: {
  coaches: DBCoachPersonality[];
  teamA: DBTeam;
  teamB: DBTeam;
  simResult: { resultA: number; resultB: number; probA: number; probB: number; probDraw: number } | null;
  teamAStats: { played: number; won: number; drawn: number; lost: number; goals_for: number; goals_against: number; titles: number } | null;
  teamBStats: typeof teamAStats;
}) {
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function toggleCoach(id: string) {
    setSelectedCoachIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
    // Reset si cambia la selección
    setRevealed(false);
    setComments({});
  }

  async function loadComments() {
    if (selectedCoachIds.length === 0) return;
    setLoading(true);
    setRevealed(true);
    setComments({});

    const selected = coaches.filter((c) => selectedCoachIds.includes(c.id));
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
              teamAStats,
              teamBStats,
              resultA: simResult?.resultA ?? null,
              resultB: simResult?.resultB ?? null,
              probA: simResult?.probA ?? null,
              probB: simResult?.probB ?? null,
              probDraw: simResult?.probDraw ?? null,
              mode: simResult ? "simulation" : "h2h_analysis",
            }),
          });
          const data = await res.json();
          return { id: coach.id, comment: data.comment || "Sin señal del DT." };
        } catch {
          return { id: coach.id, comment: "Sin señal del DT." };
        }
      })
    );

    const map: Record<string, string> = {};
    results.forEach((r) => { map[r.id] = r.comment; });
    setComments(map);
    setLoading(false);
  }

  const selectedCoaches = coaches.filter((c) => selectedCoachIds.includes(c.id));

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>

      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <motion.div
          animate={{ opacity: [1, 0.3, 1], scale: [1, 1.15, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"
          style={{ boxShadow: "0 0 6px #34d39980" }}
        />
        <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
          Análisis de DTs · Elegí hasta 3
        </span>
      </div>

      {/* Coach chips */}
      <div className="p-3">
        <div className="flex flex-wrap gap-2">
          {coaches.map((coach) => {
            const isSelected = selectedCoachIds.includes(coach.id);
            const isDisabled = !isSelected && selectedCoachIds.length >= 3;
            const [failed, setFailed] = useState(false);
            return (
              <button
                key={coach.id}
                onClick={() => !isDisabled && toggleCoach(coach.id)}
                disabled={isDisabled}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all"
                style={{
                  background: isSelected ? "rgba(245,185,66,0.15)" : "rgba(255,255,255,0.04)",
                  border: isSelected ? "1px solid rgba(245,185,66,0.5)" : "1px solid rgba(255,255,255,0.08)",
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: isSelected ? "1px solid rgba(245,185,66,0.5)" : "1px solid rgba(255,255,255,0.1)" }}>
                  {!failed ? (
                    <img src={coach.avatar_file} alt={coach.name} width={20} height={20}
                      className="w-full h-full object-cover object-top"
                      onError={() => setFailed(true)} loading="lazy" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="text-[7px] font-black text-amber-400">{coach.initials}</span>
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-bold ${isSelected ? "text-amber-400" : "text-slate-500"}`}>
                  {coach.name}
                </span>
                {isSelected && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="text-amber-400 text-[8px]">✓</motion.span>
                )}
              </button>
            );
          })}
        </div>

        {selectedCoachIds.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={loadComments}
            disabled={loading}
            className="mt-3 w-full py-2.5 rounded-xl font-bold text-xs tracking-widest uppercase transition-all"
            style={{
              background: loading ? "rgba(245,185,66,0.06)" : "rgba(245,185,66,0.12)",
              border: "1px solid rgba(245,185,66,0.35)",
              color: loading ? "#6b5a2e" : "#f5b942",
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block w-3 h-3 rounded-full border-2 border-amber-400/20 border-t-amber-400/60" />
                Pensando…
              </span>
            ) : (
              `Escuchar a ${selectedCoachIds.length === 1 ? "este DT" : `estos ${selectedCoachIds.length} DTs`}`
            )}
          </motion.button>
        )}
      </div>

      {/* Burbujas typewriter */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-900"
          >
            <div className="px-4 py-4 space-y-5">
              {loading ? (
                [0, 1, 2].slice(0, selectedCoachIds.length).map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                      className="w-10 h-10 rounded-full bg-slate-800 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 + 0.05 }}
                        className="h-3 rounded bg-slate-800 w-24" />
                      <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 + 0.1 }}
                        className="h-16 rounded-xl bg-slate-800 w-full" />
                    </div>
                  </div>
                ))
              ) : (
                selectedCoaches
                  .filter((c) => comments[c.id])
                  .map((coach, i) => (
                    <CoachBubble
                      key={`${coach.id}-${Object.keys(comments).join("-")}`}
                      coach={coach}
                      comment={comments[coach.id]}
                      delay={i * 800}
                      isRight={i % 2 !== 0}
                    />
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SIMULACIÓN ───────────────────────────────────────────────

function SimulationPanel({
  teamA,
  teamB,
}: {
  teamA: DBTeam;
  teamB: DBTeam;
}) {
  const [simResult, setSimResult] = useState<{
    resultA: number; resultB: number;
    probA: number; probB: number; probDraw: number;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  async function handleSimulate() {
    setSimulating(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teamA: teamA.id, teamB: teamB.id }),
      });
      const data = await res.json();
      setSimResult({ resultA: data.resultA, resultB: data.resultB, probA: data.probA, probB: data.probB, probDraw: data.probDraw });
    } catch {
      // silencioso
    } finally {
      setSimulating(false);
    }
  }

  const winner = simResult
    ? simResult.resultA > simResult.resultB ? teamA
    : simResult.resultB > simResult.resultA ? teamB
    : null
    : null;

  return (
    <div className="space-y-3">
      {/* Botón simular */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSimulate}
        disabled={simulating}
        className="w-full py-4 rounded-2xl font-black text-sm tracking-widest uppercase relative overflow-hidden"
        style={{
          background: simulating ? "rgba(245,185,66,0.07)" : "rgba(245,185,66,0.13)",
          border: "1px solid rgba(245,185,66,0.4)",
          color: simulating ? "#6b5a2e" : "#f5b942",
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 120% at 50% 0%, rgba(245,185,66,0.07) 0%, transparent 70%)" }} />
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
              {simResult ? "Simular de nuevo" : "Simular partido"}
            </>
          )}
        </div>
      </motion.button>

      {/* Resultado */}
      <AnimatePresence>
        {simResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(245,185,66,0.2)" }}
          >
            <div className="px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 6px #34d39980" }} />
              <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
                Resultado simulado · IA
              </span>
            </div>
            <div className="px-4 py-5">
              {/* Marcador */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="flex flex-col items-center gap-1.5">
                  <FlagImg code={teamA.flag_code} className="w-10 h-[26px] rounded-[3px]" />
                  <span className="text-[9px] font-bold text-white text-center leading-tight max-w-[60px]">{teamA.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-5xl font-black tabular-nums ${simResult.resultA > simResult.resultB ? "text-amber-400" : "text-white"}`}>
                    {simResult.resultA}
                  </span>
                  <span className="text-2xl text-slate-700 font-black">–</span>
                  <span className={`text-5xl font-black tabular-nums ${simResult.resultB > simResult.resultA ? "text-amber-400" : "text-white"}`}>
                    {simResult.resultB}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5">
                  <FlagImg code={teamB.flag_code} className="w-10 h-[26px] rounded-[3px]" />
                  <span className="text-[9px] font-bold text-white text-center leading-tight max-w-[60px]">{teamB.name}</span>
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
                  { label: teamA.name, prob: simResult.probA, color: "text-amber-400" },
                  { label: "Empate", prob: simResult.probDraw, color: "text-slate-400" },
                  { label: teamB.name, prob: simResult.probB, color: "text-blue-400" },
                ].map((item) => (
                  <div key={item.label} className="text-center">
                    <div className={`text-lg font-black tabular-nums ${item.color}`}>{item.prob}%</div>
                    <div className={`text-[8px] uppercase truncate ${LABEL_CLASS}`}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retornar simResult para que el DTSection lo use */}
      {simResult && <SimResultContext result={simResult} />}
    </div>
  );
}

// Helper para pasar simResult al padre (pattern simple)
function SimResultContext({ result }: { result: any }) {
  useEffect(() => {
    window.__scabotni_lastSim = result;
  }, [result]);
  return null;
}

// ─── MODO 2 PLACEHOLDER ───────────────────────────────────────

function Modo2Placeholder() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-8 text-center space-y-3"
      style={{ background: "rgba(13,17,23,0.97)", border: "1px dashed rgba(245,185,66,0.2)" }}
    >
      <div className="text-3xl">🏆</div>
      <div className="text-sm font-black text-white tracking-wide">Selecciones Históricas</div>
      <p className="text-xs text-slate-500 font-mono leading-relaxed">
        Navegá por cada edición del Mundial, comparé campeones y subcampeones históricos, y simulá partidos entre leyendas.
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-mono"
        style={{ background: "rgba(245,185,66,0.08)", border: "1px solid rgba(245,185,66,0.2)", color: "#f5b942" }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}>●</motion.span>
        Próximamente
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────

export default function HeadToHead() {
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<"actual" | "historico">("actual");
  const [teams, setTeams] = useState<DBTeam[]>([]);
  const [coaches, setCoaches] = useState<DBCoachPersonality[]>([]);
  const [loading, setLoading] = useState(true);

  const [teamA, setTeamA] = useState<DBTeam | null>(null);
  const [teamB, setTeamB] = useState<DBTeam | null>(null);

  const [h2hRecord, setH2HRecord] = useState<DBH2HRecord | null>(null);
  const [h2hMatches, setH2HMatches] = useState<DBH2HMatch[]>([]);
  const [loadingH2H, setLoadingH2H] = useState(false);

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        const [teamsRes, coachesRes] = await Promise.all([
          supabase.from("teams").select("*").order("name"),
          supabase.from("coach_personalities").select("*").eq("active", true),
        ]);
        if (teamsRes.data) setTeams(teamsRes.data);
        if (coachesRes.data) setCoaches(coachesRes.data);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Cargar H2H al seleccionar ambos
  useEffect(() => {
    if (!teamA || !teamB) return;
    setH2HRecord(null);
    setH2HMatches([]);

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
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 rounded-full border-2 border-amber-400/20 border-t-amber-400" />
        <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>Cargando…</span>
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
          Historial en Mundiales · Simulación · Análisis de DTs
        </p>
      </div>

      {/* Toggle Modo */}
      <div className="flex gap-1.5 p-1 rounded-xl"
        style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
        {[
          { key: "actual", label: "Selecciones Actuales", sub: "WC 2026 · 48 equipos" },
          { key: "historico", label: "Históricas", sub: "Campeones · Leyendas" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as typeof mode)}
            className="flex-1 text-left px-3 py-2.5 rounded-lg transition-all"
            style={{
              background: mode === m.key ? "rgba(245,185,66,0.1)" : "transparent",
              border: mode === m.key ? "1px solid rgba(245,185,66,0.3)" : "1px solid transparent",
            }}
          >
            <div className={`text-[11px] font-bold ${mode === m.key ? "text-amber-400" : "text-slate-500"}`}>
              {m.label}
            </div>
            <div className="text-[9px] font-mono text-slate-700 mt-0.5">{m.sub}</div>
          </button>
        ))}
      </div>

      {/* MODO 2 */}
      <AnimatePresence mode="wait">
        {mode === "historico" && (
          <motion.div key="modo2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Modo2Placeholder />
          </motion.div>
        )}

        {/* MODO 1 */}
        {mode === "actual" && (
          <motion.div key="modo1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4">

            {/* Selector de equipos */}
            <div className="rounded-2xl p-4"
              style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex gap-3">
                <TeamSelector teams={teams} selected={teamA}
                  onSelect={(t) => setTeamA(t)} label="Selección A" exclude={teamB?.id} />
                <div className="flex items-end pb-1">
                  <span className="text-slate-700 font-black text-lg">vs</span>
                </div>
                <TeamSelector teams={teams} selected={teamB}
                  onSelect={(t) => setTeamB(t)} label="Selección B" exclude={teamA?.id} />
              </div>

              {/* Stats rápidas de ambos equipos */}
              <AnimatePresence>
                {bothSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className="overflow-hidden mt-3 pt-3 border-t border-slate-900"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {[teamA, teamB].map((team) => (
                        <div key={team!.id} className="space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FlagImg code={team!.flag_code} className="w-5 h-[13px] rounded-[2px]" />
                            <span className="text-[10px] font-bold text-white truncate">{team!.name}</span>
                          </div>
                          {[
                            { label: "Part.", value: team!.participations },
                            { label: "PJ", value: team!.played },
                            { label: "V", value: team!.won },
                            { label: "Títulos", value: team!.titles },
                          ].map((s) => (
                            <div key={s.label} className="flex justify-between items-center">
                              <span className={`text-[9px] ${LABEL_CLASS}`}>{s.label}</span>
                              <span className="text-[10px] font-bold text-white tabular-nums">{s.value}</span>
                            </div>
                          ))}
                          {team!.best_position && (
                            <div className="text-[8px] font-mono text-amber-400/60 leading-tight mt-1">
                              {team!.best_position}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* H2H Record */}
            <AnimatePresence>
              {bothSelected && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {loadingH2H ? (
                    <div className="rounded-2xl p-6 flex items-center justify-center gap-3"
                      style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                        className="w-3 h-3 rounded-full bg-amber-400/50" />
                      <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>Buscando historial…</span>
                    </div>
                  ) : (
                    <H2HRecord record={h2hRecord} matches={h2hMatches} teamA={teamA!} teamB={teamB!} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats comparativas */}
            <AnimatePresence>
              {bothSelected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  <div className="rounded-2xl overflow-hidden"
                    style={{ background: "rgba(13,17,23,0.97)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="px-4 py-2.5 border-b border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
                          Comparación histórica en Mundiales
                        </span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5">
                            <FlagImg code={teamA!.flag_code} className="w-4 h-[10px] rounded-[1px]" />
                            <span className="text-[9px] text-amber-400/70 font-mono">{teamA!.confederation}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FlagImg code={teamB!.flag_code} className="w-4 h-[10px] rounded-[1px]" />
                            <span className="text-[9px] text-blue-400/70 font-mono">{teamB!.confederation}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-2">
                      <StatRow label="Partidos WC" valueA={teamA!.played} valueB={teamB!.played} />
                      <StatRow label="Victorias" valueA={teamA!.won} valueB={teamB!.won} />
                      <StatRow label="Goles" valueA={teamA!.goals_for} valueB={teamB!.goals_for} />
                      <StatRow label="G/PJ" valueA={parseFloat((teamA!.goals_for / Math.max(teamA!.played, 1)).toFixed(2))}
                        valueB={parseFloat((teamB!.goals_for / Math.max(teamB!.played, 1)).toFixed(2))} />
                      <StatRow label="Títulos" valueA={teamA!.titles} valueB={teamB!.titles} />
                      <StatRow label="Finales" valueA={teamA!.finals} valueB={teamB!.finals} />
                      <StatRow label="G. concedidos" valueA={teamA!.goals_against} valueB={teamB!.goals_against}
                        higherIsBetter={false} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Simulación */}
            <AnimatePresence>
              {bothSelected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.05 }}>
                  <SimulationPanel teamA={teamA!} teamB={teamB!} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* DTs */}
            <AnimatePresence>
              {bothSelected && coaches.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} transition={{ duration: 0.25, delay: 0.1 }}>
                  <DTSection
                    coaches={coaches}
                    teamA={teamA!}
                    teamB={teamB!}
                    simResult={null}
                    teamAStats={{
                      played: teamA!.played, won: teamA!.won, drawn: teamA!.drawn, lost: teamA!.lost,
                      goals_for: teamA!.goals_for, goals_against: teamA!.goals_against, titles: teamA!.titles,
                    }}
                    teamBStats={{
                      played: teamB!.played, won: teamB!.won, drawn: teamB!.drawn, lost: teamB!.lost,
                      goals_for: teamB!.goals_for, goals_against: teamB!.goals_against, titles: teamB!.titles,
                    }}
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
