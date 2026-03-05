"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  worldCupTeams,
  worldCupEditions,
  h2hData,
  type TeamStats,
} from "@/lib/worldCupData";

function FlagImg({ flagCode, size = "md" }: { flagCode: string; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-16 h-11" : size === "md" ? "w-9 h-6" : size === "sm" ? "w-6 h-4" : "w-9 h-6";
  return (
    <img
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      alt={flagCode}
      className={`${dims} object-cover rounded shadow-sm flex-shrink-0`}
      loading="lazy"
    />
  );
}

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

function TeamCard({ team, onClick }: { team: TeamStats; onClick: () => void }) {
  const winRate = team.played > 0 ? Math.round((team.won / team.played) * 100) : 0;
  const isDebut = team.played === 0;

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full text-left rounded-xl border border-slate-700/50 bg-sca-surface/60 p-4 hover:border-sca-accent/40 transition-colors"
    >
      <div className="flex items-center gap-3 mb-3">
        <FlagImg flagCode={team.flagCode} size="md" />
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{team.name}</div>
          <div className="text-xs text-slate-500">{team.confederation} · {team.participations} participaciones</div>
        </div>
        {team.titles > 0 && (
          <div className="flex items-center gap-0.5">
            {Array.from({ length: Math.min(team.titles, 5) }).map((_, i) => (
              <span key={i} className="text-sca-gold text-sm">🏆</span>
            ))}
          </div>
        )}
        {isDebut && (
          <span className="text-[9px] font-bold bg-sca-accent/20 text-sca-accent border border-sca-accent/30 px-1.5 py-0.5 rounded-full">
            DEBUT
          </span>
        )}
      </div>

      {isDebut ? (
        <div className="text-xs text-slate-600 italic">Sin historial en Copas del Mundo</div>
      ) : (
        <>
          <div className="flex gap-3 text-xs text-slate-400 mb-2">
            <span><span className="text-white font-semibold">{team.played}</span> PJ</span>
            <span><span className="text-green-400 font-semibold">{team.won}</span> G</span>
            <span><span className="text-slate-400 font-semibold">{team.drawn}</span> E</span>
            <span><span className="text-red-400 font-semibold">{team.lost}</span> P</span>
            <span className="ml-auto"><span className="text-sca-accent font-semibold">{winRate}%</span></span>
          </div>
          <StatBar value={team.won} max={team.played} />
        </>
      )}
    </motion.button>
  );
}

function TeamDetail({ team, onBack }: { team: TeamStats; onBack: () => void }) {
  const winRate = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : "—";
  const goalAvg = team.played > 0 ? (team.goalsFor / team.played).toFixed(2) : "—";
  const h2h = h2hData.find((h) => h.teamId === team.id);
  const [showH2H, setShowH2H] = useState(false);
  const isDebut = team.played === 0;

  // Find top rival (most played)
  const topRivalRecord = h2h?.records.reduce((a, b) => a.played >= b.played ? a : b);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
      >
        ← Todas las selecciones
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-700/50 bg-sca-surface/80 p-5">
        <div className="flex items-center gap-4 mb-4">
          <FlagImg flagCode={team.flagCode} size="lg" />
          <div>
            <h2 className="text-2xl font-black text-white">{team.name}</h2>
            <div className="text-sm text-slate-400">{team.confederation}</div>
            <div className="flex items-center gap-2 mt-1">
              {team.titles > 0 ? (
                <span className="text-sca-gold text-sm font-bold">
                  {Array.from({ length: Math.min(team.titles, 5) }).map(() => "🏆").join("")} {team.titles}x Campeón Mundial
                </span>
              ) : (
                <span className="text-slate-500 text-sm">Mejor posición: {team.bestPosition}</span>
              )}
            </div>
          </div>
        </div>

        {isDebut ? (
          <div className="rounded-lg bg-sca-accent/10 border border-sca-accent/20 p-3 text-center">
            <div className="text-sca-accent font-bold text-sm">Primera participación en Copa del Mundo</div>
            <div className="text-slate-500 text-xs mt-1">Debuta en el Mundial 2026 — USA/México/Canadá</div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Participaciones", value: team.participations, color: "text-sca-accent" },
              { label: "Títulos", value: team.titles, color: "text-sca-gold" },
              { label: "Finales", value: team.finals, color: "text-slate-300" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg bg-slate-800/60 p-3 text-center">
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed stats — only for teams with history */}
      {!isDebut && (
        <>
          <div className="rounded-xl border border-slate-700/50 bg-sca-surface/60 p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estadísticas Copa del Mundo</h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Partidos jugados", value: team.played },
                { label: "Partidos ganados", value: team.won, color: "text-green-400" },
                { label: "Empates", value: team.drawn },
                { label: "Derrotas", value: team.lost, color: "text-red-400" },
                { label: "Goles a favor", value: team.goalsFor, color: "text-sca-accent" },
                { label: "Goles en contra", value: team.goalsAgainst },
              ].map((s) => (
                <div key={s.label} className="flex justify-between items-center py-1 border-b border-slate-800">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <span className={`text-sm font-bold ${(s as {color?: string}).color || "text-white"}`}>{s.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Rendimiento general</span>
                <span className="text-sca-accent font-bold">{winRate}%</span>
              </div>
              <StatBar value={team.won} max={team.played} />
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-400">Promedio de goles por partido</span>
              <span className="text-sm font-bold text-sca-gold">{goalAvg}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-400">Mejor posición histórica</span>
              <span className="text-sm font-bold text-white text-right max-w-[180px]">{team.bestPosition}</span>
            </div>

            <div className="flex justify-between items-center py-1">
              <span className="text-xs text-slate-400">Primera participación</span>
              <span className="text-sm font-bold text-white">{team.firstYear}</span>
            </div>

            {/* Top rival highlight */}
            {topRivalRecord && (
              <div className="rounded-lg bg-slate-800/40 border border-slate-700/40 p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Rival más frecuente</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{topRivalRecord.opponent}</span>
                  <div className="flex gap-2 text-xs">
                    <span className="text-slate-400">{topRivalRecord.played} PJ</span>
                    <span className="text-green-400">{topRivalRecord.won}G</span>
                    <span className="text-slate-400">{topRivalRecord.drawn}E</span>
                    <span className="text-red-400">{topRivalRecord.lost}P</span>
                    <span className="text-sca-accent font-bold">{topRivalRecord.goalsFor}–{topRivalRecord.goalsAgainst}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* H2H Expandible */}
          {h2h && (
            <div className="rounded-xl border border-slate-700/50 bg-sca-surface/60 overflow-hidden">
              <button
                onClick={() => setShowH2H(!showH2H)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Historial vs otras selecciones
                </h3>
                <motion.span animate={{ rotate: showH2H ? 180 : 0 }} className="text-slate-500 text-sm">▼</motion.span>
              </button>
              <AnimatePresence>
                {showH2H && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {h2h.records.map((r) => (
                        <div key={r.opponent} className="flex items-center gap-2 text-xs py-2 border-b border-slate-800 last:border-0">
                          <span className="text-slate-300 font-semibold w-28 truncate">{r.opponent}</span>
                          <span className="text-slate-500">{r.played}P</span>
                          <span className="text-green-400 ml-auto">{r.won}G</span>
                          <span className="text-slate-500">{r.drawn}E</span>
                          <span className="text-red-400">{r.lost}P</span>
                          <span className="text-sca-accent ml-2">{r.goalsFor}–{r.goalsAgainst}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* PRAGMA Banner */}
      <div className="rounded-xl border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
          <span className="text-sca-accent text-sm font-black">P</span>
        </div>
        <div>
          <div className="text-xs font-bold text-sca-accent">Análisis avanzado by PRAGMA Intelligence</div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Modelos predictivos, patrones históricos y estadísticas profundas para esta selección.
          </div>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] bg-sca-accent/10 text-sca-accent px-2 py-0.5 rounded-full font-semibold">PRÓXIMAMENTE</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function CentralDeDatos() {
  const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [filter, setFilter] = useState<"all" | "CONMEBOL" | "UEFA" | "CONCACAF" | "CAF" | "AFC" | "OFC">("all");
  const [showEditions, setShowEditions] = useState(false);

  const filtered = filter === "all" ? worldCupTeams : worldCupTeams.filter((t) => t.confederation === filter);

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
              <p className="text-xs text-slate-500 mt-1">
                48 selecciones · Copa del Mundo 2026 USA / México / Canadá
              </p>
            </div>

            {/* Editions toggle */}
            <div className="rounded-xl border border-slate-700/50 bg-sca-surface/60 overflow-hidden">
              <button
                onClick={() => setShowEditions(!showEditions)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors"
              >
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  🏆 Ediciones del Mundial (1930–2026)
                </span>
                <motion.span animate={{ rotate: showEditions ? 180 : 0 }} className="text-slate-500 text-sm">▼</motion.span>
              </button>
              <AnimatePresence>
                {showEditions && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-1 max-h-64 overflow-y-auto">
                      {worldCupEditions.map((e) => (
                        <div key={e.year} className="flex items-center gap-2 text-xs py-1.5 border-b border-slate-800 last:border-0">
                          <span className={`font-bold w-10 ${e.year === 2026 ? "text-sca-accent" : "text-sca-gold"}`}>{e.year}</span>
                          <span className="text-slate-500 w-24 truncate">{e.host}</span>
                          <span className="text-white font-semibold flex-1">
                            {e.champion === "—" ? <span className="text-slate-600 italic">Por jugarse</span> : `🏆 ${e.champion}`}
                          </span>
                          <span className="text-slate-500">{e.runnerUp !== "—" ? e.runnerUp : ""}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confederation filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(["all", "CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${
                    filter === f
                      ? "bg-sca-accent text-sca-dark"
                      : "border border-slate-700 text-slate-500 hover:text-white"
                  }`}
                >
                  {f === "all" ? `Todas (${worldCupTeams.length})` : `${f} (${worldCupTeams.filter(t => t.confederation === f).length})`}
                </button>
              ))}
            </div>

            {/* Teams list */}
            <div className="space-y-3">
              {filtered.map((team) => (
                <TeamCard key={team.id} team={team} onClick={() => setSelectedTeam(team)} />
              ))}
            </div>

            {/* PRAGMA Banner */}
            <div className="rounded-xl border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sca-accent text-sm font-black">P</span>
              </div>
              <div>
                <div className="text-xs font-bold text-sca-accent">Análisis avanzado by PRAGMA Intelligence</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Seleccioná una selección para ver el análisis predictivo completo.
                </div>
              </div>
              <span className="ml-auto text-[10px] bg-sca-accent/10 text-sca-accent px-2 py-0.5 rounded-full font-semibold flex-shrink-0">PRÓXIMAMENTE</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
