"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  worldCupTeams,
  worldCupEditions,
  h2hData,
  type TeamStats,
} from "@/lib/worldCupData";

// ─── CONFEDERATION SHIELDS (inline SVG paths) ─────────────────────────────────
// Clean geometric monogram-style shields, no external assets needed

function ConfederationShield({
  confederation,
  size = 32,
}: {
  confederation: string;
  size?: number;
}) {
  const configs: Record<
    string,
    { bg: string; text: string; abbr: string; accent: string }
  > = {
    CONMEBOL: { bg: "#1a2744", text: "#4a9eff", abbr: "CSB", accent: "#4a9eff" },
    UEFA:     { bg: "#0d1f3c", text: "#00d4aa", abbr: "UEFA", accent: "#00d4aa" },
    CONCACAF: { bg: "#1a1a2e", text: "#f5b942", abbr: "CCF", accent: "#f5b942" },
    CAF:      { bg: "#1a2a1a", text: "#4caf50", abbr: "CAF", accent: "#4caf50" },
    AFC:      { bg: "#1f1a2e", text: "#9c6fff", abbr: "AFC", accent: "#9c6fff" },
    OFC:      { bg: "#1a2a2a", text: "#26c6da", abbr: "OFC", accent: "#26c6da" },
  };
  const c = configs[confederation] ?? { bg: "#1a1a1a", text: "#888", abbr: "?", accent: "#888" };
  const fontSize = size < 28 ? size * 0.28 : size * 0.24;

  return (
    <svg
      width={size}
      height={size * 1.15}
      viewBox="0 0 40 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shield outline */}
      <path
        d="M20 2 L38 9 L38 24 C38 34 20 44 20 44 C20 44 2 34 2 24 L2 9 Z"
        fill={c.bg}
        stroke={c.accent}
        strokeWidth="1.5"
      />
      {/* Inner accent line */}
      <path
        d="M20 5 L35 11 L35 24 C35 32 20 41 20 41 C20 41 5 32 5 24 L5 11 Z"
        fill="none"
        stroke={c.accent}
        strokeWidth="0.5"
        opacity="0.3"
      />
      {/* Text abbreviation */}
      <text
        x="20"
        y="26"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={c.text}
        fontSize={fontSize}
        fontFamily="monospace"
        fontWeight="900"
        letterSpacing="-0.5"
      >
        {c.abbr}
      </text>
    </svg>
  );
}

// ─── FLAG ─────────────────────────────────────────────────────────────────────

function FlagImg({
  flagCode,
  size = "md",
}: {
  flagCode: string;
  size?: "xs" | "sm" | "md" | "lg";
}) {
  const dims =
    size === "lg" ? "w-14 h-[38px]" :
    size === "md" ? "w-9 h-6" :
    size === "sm" ? "w-6 h-4" :
    "w-5 h-[13px]";
  return (
    <img
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      alt={flagCode}
      className={`${dims} object-cover rounded-[3px] shadow-sm flex-shrink-0`}
      loading="lazy"
    />
  );
}

// ─── STAT BAR ─────────────────────────────────────────────────────────────────

function StatBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="h-full bg-sca-accent rounded-full"
      />
    </div>
  );
}

// ─── TEAM CARD (list) ─────────────────────────────────────────────────────────

function TeamCard({ team, onClick }: { team: TeamStats; onClick: () => void }) {
  const winRate = team.played > 0 ? Math.round((team.won / team.played) * 100) : 0;
  const isDebut = team.played === 0;

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full text-left rounded-sm border border-slate-700/50 bg-[#0d1117] hover:border-sca-accent/30 transition-colors overflow-hidden"
    >
      <div className="h-[2px] bg-slate-800" />
      <div className="flex items-stretch gap-0">
        {/* Shield column */}
        <div className="flex-shrink-0 w-14 flex items-center justify-center bg-slate-900/40 py-3">
          <ConfederationShield confederation={team.confederation} size={36} />
        </div>

        {/* Main content */}
        <div className="flex-1 px-3 py-2.5 min-w-0">
          {/* Top row: flag + name + debut/titles */}
          <div className="flex items-center gap-2 mb-2">
            <FlagImg flagCode={team.flagCode} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm leading-tight truncate">
                {team.name}
              </div>
              <div className="text-[9px] text-slate-600 font-mono mt-0.5">
                {team.confederation} · {team.participations} part.
              </div>
            </div>
            {team.titles > 0 && (
              <div className="flex gap-0.5 flex-shrink-0">
                {Array.from({ length: Math.min(team.titles, 5) }).map((_, i) => (
                  <span key={i} className="text-sca-gold text-xs">★</span>
                ))}
              </div>
            )}
            {isDebut && (
              <span className="text-[8px] font-bold bg-sca-accent/10 text-sca-accent border border-sca-accent/30 px-1.5 py-0.5 rounded-full flex-shrink-0">
                DEBUT
              </span>
            )}
          </div>

          {/* Stats row or debut message */}
          {isDebut ? (
            <div className="text-[10px] text-slate-700 italic">Sin historial en Copas del Mundo</div>
          ) : (
            <>
              <div className="flex gap-3 text-[10px] text-slate-500 mb-1.5">
                <span><span className="text-white font-bold">{team.played}</span> PJ</span>
                <span><span className="text-green-400 font-bold">{team.won}</span> G</span>
                <span><span className="text-slate-400 font-bold">{team.drawn}</span> E</span>
                <span><span className="text-red-400 font-bold">{team.lost}</span> P</span>
                <span className="ml-auto">
                  <span className="text-sca-accent font-bold">{winRate}%</span>
                </span>
              </div>
              <StatBar value={team.won} max={team.played} />
            </>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── TEAM DETAIL ──────────────────────────────────────────────────────────────

function TeamDetail({ team, onBack }: { team: TeamStats; onBack: () => void }) {
  const winRate = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : "—";
  const goalAvg = team.played > 0 ? (team.goalsFor / team.played).toFixed(2) : "—";
  const h2h = h2hData.find((h) => h.teamId === team.id);
  const [showH2H, setShowH2H] = useState(false);
  const isDebut = team.played === 0;
  const topRivalRecord = h2h?.records.reduce((a, b) => (a.played >= b.played ? a : b));

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="text-[10px] text-slate-600 hover:text-white flex items-center gap-1.5 font-mono tracking-wider uppercase transition-colors"
      >
        ← Todas las selecciones
      </button>

      {/* ── HEADER FICHA ─────────────────────────────────── */}
      <div className="rounded-sm border border-slate-700/50 bg-[#0d1117] overflow-hidden">
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2">
          <span className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase">
            Ficha de Selección · Copa del Mundo 2026
          </span>
        </div>

        {/* Identity block: shield + flag + name */}
        <div className="flex items-center gap-4 px-4 py-4 border-b border-slate-800">
          <ConfederationShield confederation={team.confederation} size={52} />
          <div className="flex-1 min-w-0">
            {/* Flag top, name below */}
            <FlagImg flagCode={team.flagCode} size="md" />
            <div className="text-2xl font-black text-white tracking-wide mt-1.5 leading-tight">
              {team.name}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {team.confederation} · {team.participations} participaciones
            </div>
          </div>
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            {team.titles > 0 ? (
              <>
                <div className="text-3xl font-black text-sca-gold">{team.titles}</div>
                <div className="text-[9px] font-mono text-sca-gold/60 uppercase tracking-widest">
                  Títulos
                </div>
              </>
            ) : (
              <div className="text-[9px] font-mono text-slate-700 uppercase tracking-wider text-center leading-tight max-w-[64px]">
                {team.bestPosition.split("(")[0].trim()}
              </div>
            )}
          </div>
        </div>

        {/* Best position */}
        <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
          <span className="text-[9px] font-mono text-amber-400/70 uppercase tracking-widest">
            Mejor posición:
          </span>
          <span className="text-[11px] font-bold text-white">{team.bestPosition}</span>
        </div>

        {isDebut ? (
          <div className="px-4 py-5 text-center">
            <div className="text-sca-accent font-bold text-sm">Primera participación en Copa del Mundo</div>
            <div className="text-slate-600 text-xs mt-1">Debuta en el Mundial 2026 · USA / México / Canadá</div>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div className="px-4 pt-3 pb-4">
              <div className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase mb-3">
                Estadísticas Copa del Mundo
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: "Partidos jugados", value: team.played },
                  { label: "Partidos ganados", value: team.won, color: "text-green-400" },
                  { label: "Empates", value: team.drawn },
                  { label: "Derrotas", value: team.lost, color: "text-red-400" },
                  { label: "Goles a favor", value: team.goalsFor, color: "text-sca-accent" },
                  { label: "Goles en contra", value: team.goalsAgainst },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex justify-between items-center py-1 border-b border-slate-800/60"
                  >
                    <span className="text-[10px] text-slate-500">{s.label}</span>
                    <span
                      className={`text-sm font-bold tabular-nums ${
                        (s as { color?: string }).color ?? "text-white"
                      }`}
                    >
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* KPIs row */}
            <div className="grid grid-cols-3 divide-x divide-slate-800 border-t border-slate-800">
              {[
                { label: "Rendimiento", value: `${winRate}%`, color: "text-sca-accent" },
                { label: "Goles / PJ", value: goalAvg, color: "text-amber-400" },
                { label: "Primera part.", value: team.firstYear, color: "text-slate-300" },
              ].map((k) => (
                <div key={k.label} className="flex flex-col items-center py-3 gap-1">
                  <span className={`text-lg font-black tabular-nums ${k.color}`}>{k.value}</span>
                  <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                    {k.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Top rival */}
            {topRivalRecord && (
              <div className="border-t border-slate-800 px-4 py-3 bg-slate-900/20">
                <div className="text-[9px] font-mono text-amber-400/70 uppercase tracking-widest mb-2">
                  Rival más frecuente
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{topRivalRecord.opponent}</span>
                  <div className="flex gap-2 text-[10px]">
                    <span className="text-slate-500">{topRivalRecord.played} PJ</span>
                    <span className="text-green-400 font-bold">{topRivalRecord.won}G</span>
                    <span className="text-slate-500">{topRivalRecord.drawn}E</span>
                    <span className="text-red-400 font-bold">{topRivalRecord.lost}P</span>
                    <span className="text-sca-accent font-bold ml-1">
                      {topRivalRecord.goalsFor}–{topRivalRecord.goalsAgainst}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── H2H EXPANDIBLE ───────────────────────────────── */}
      {!isDebut && h2h && (
        <div className="rounded-sm border border-slate-700/50 bg-[#0d1117] overflow-hidden">
          <button
            onClick={() => setShowH2H(!showH2H)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/40 transition-colors"
          >
            <span className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase">
              Historial vs otras selecciones
            </span>
            <motion.span
              animate={{ rotate: showH2H ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-600 text-xs"
            >
              ▼
            </motion.span>
          </button>
          <AnimatePresence>
            {showH2H && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-1">
                  {h2h.records.map((r) => (
                    <div
                      key={r.opponent}
                      className="flex items-center gap-2 text-[11px] py-2 border-b border-slate-800 last:border-0"
                    >
                      <span className="text-slate-300 font-semibold w-28 truncate">{r.opponent}</span>
                      <span className="text-slate-600 font-mono">{r.played}P</span>
                      <span className="text-green-400 font-bold ml-auto">{r.won}G</span>
                      <span className="text-slate-500">{r.drawn}E</span>
                      <span className="text-red-400 font-bold">{r.lost}P</span>
                      <span className="text-sca-accent font-bold ml-2">
                        {r.goalsFor}–{r.goalsAgainst}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* PRAGMA Banner */}
      <div className="rounded-sm border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-sm bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
          <span className="text-sca-accent text-sm font-black">P</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold text-sca-accent">Análisis avanzado by PRAGMA Intelligence</div>
          <div className="text-[9px] text-slate-600 mt-0.5">
            Modelos predictivos y estadísticas profundas para esta selección.
          </div>
        </div>
        <span className="text-[9px] bg-sca-accent/10 text-sca-accent px-2 py-0.5 rounded-full font-bold flex-shrink-0">
          PRÓXIMAMENTE
        </span>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const CONFEDERATIONS = ["all", "CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"] as const;

export default function CentralDeDatos() {
  const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [filter, setFilter] = useState<(typeof CONFEDERATIONS)[number]>("all");
  const [showEditions, setShowEditions] = useState(false);

  const filtered =
    filter === "all" ? worldCupTeams : worldCupTeams.filter((t) => t.confederation === filter);

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {selectedTeam ? (
          <TeamDetail key="detail" team={selectedTeam} onBack={() => setSelectedTeam(null)} />
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-white">Central de Datos</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                48 selecciones · Copa del Mundo 2026 · USA / México / Canadá
              </p>
            </div>

            {/* Confederation shields filter */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => setFilter("all")}
                className={`col-span-4 text-[9px] font-mono font-bold py-1.5 uppercase border rounded-[2px] transition-colors tracking-widest ${
                  filter === "all"
                    ? "bg-sca-accent/10 text-sca-accent border-sca-accent/40"
                    : "border-slate-800 text-slate-600 hover:text-slate-400"
                }`}
              >
                Todas ({worldCupTeams.length})
              </button>
              {(["CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"] as const).map((conf) => {
                const count = worldCupTeams.filter((t) => t.confederation === conf).length;
                const isActive = filter === conf;
                return (
                  <button
                    key={conf}
                    onClick={() => setFilter(conf)}
                    className={`flex flex-col items-center gap-1 py-2 border rounded-[2px] transition-all ${
                      isActive
                        ? "border-sca-accent/50 bg-sca-accent/5"
                        : "border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <ConfederationShield
                      confederation={conf}
                      size={isActive ? 26 : 22}
                    />
                    <span
                      className={`text-[8px] font-mono font-bold tracking-wide ${
                        isActive ? "text-sca-accent" : "text-slate-600"
                      }`}
                    >
                      {conf === "CONCACAF" ? "CCF" : conf} ({count})
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Editions toggle */}
            <div className="rounded-sm border border-slate-700/50 bg-[#0d1117] overflow-hidden">
              <button
                onClick={() => setShowEditions(!showEditions)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-900/40 transition-colors"
              >
                <span className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase">
                  Ediciones del Mundial (1930–2026)
                </span>
                <motion.span
                  animate={{ rotate: showEditions ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-slate-600 text-xs"
                >
                  ▼
                </motion.span>
              </button>
              <AnimatePresence>
                {showEditions && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-0 max-h-64 overflow-y-auto">
                      {worldCupEditions.map((e) => (
                        <div
                          key={e.year}
                          className="flex items-center gap-2 text-[10px] py-1.5 border-b border-slate-800 last:border-0"
                        >
                          <span
                            className={`font-bold w-10 tabular-nums ${
                              e.year === 2026 ? "text-sca-accent" : "text-amber-400/80"
                            }`}
                          >
                            {e.year}
                          </span>
                          <span className="text-slate-600 w-28 truncate">{e.host}</span>
                          <span className="text-white font-semibold flex-1 truncate">
                            {e.champion === "—" ? (
                              <span className="text-slate-700 italic">Por jugarse</span>
                            ) : (
                              `★ ${e.champion}`
                            )}
                          </span>
                          {e.runnerUp !== "—" && (
                            <span className="text-slate-600 truncate max-w-[80px]">{e.runnerUp}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Team list */}
            <div className="space-y-2">
              {filtered.map((team) => (
                <TeamCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} />
              ))}
            </div>

            {/* PRAGMA Banner */}
            <div className="rounded-sm border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sca-accent text-sm font-black">P</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-sca-accent">Análisis avanzado by PRAGMA Intelligence</div>
                <div className="text-[9px] text-slate-600 mt-0.5">
                  Seleccioná una selección para ver el análisis predictivo completo.
                </div>
              </div>
              <span className="text-[9px] bg-sca-accent/10 text-sca-accent px-2 py-0.5 rounded-full font-bold flex-shrink-0">
                PRÓXIMAMENTE
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
