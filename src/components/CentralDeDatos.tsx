"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  worldCupTeams,
  worldCupEditions,
  type TeamStats,
} from "@/lib/worldCupData";
import { ScaBOTni_Slider } from "@/components/ScaBOTni_Slider";
import { useIsMobile } from "@/hooks/useMobilePerf";

// ─── CONF COLORS ──────────────────────────────────────────────────────────────

const CONF_COLORS: Record<string, { bg: string; text: string; abbr: string; accent: string }> = {
  CONMEBOL: { bg: "#0d1f44", text: "#60a5fa", abbr: "CON",  accent: "#3b82f6" },
  UEFA:     { bg: "#0a1a2e", text: "#34d399", abbr: "UEFA", accent: "#10b981" },
  CONCACAF: { bg: "#1c1408", text: "#fbbf24", abbr: "CCA",  accent: "#f59e0b" },
  CAF:      { bg: "#0d1f0d", text: "#4ade80", abbr: "CAF",  accent: "#22c55e" },
  AFC:      { bg: "#1a0d2e", text: "#c084fc", abbr: "AFC",  accent: "#a855f7" },
  OFC:      { bg: "#081a1f", text: "#22d3ee", abbr: "OFC",  accent: "#06b6d4" },
};

function FallbackShield({ confederation, size }: { confederation: string; size: number }) {
  const c = CONF_COLORS[confederation] ?? { bg: "#1a1a1a", text: "#888", abbr: "?", accent: "#888" };
  const fontSize = size < 28 ? size * 0.28 : size * 0.24;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 40 46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2 L38 9 L38 24 C38 34 20 44 20 44 C20 44 2 34 2 24 L2 9 Z" fill={c.bg} stroke={c.accent} strokeWidth="1.5" />
      <path d="M20 5 L35 11 L35 24 C35 32 20 41 20 41 C20 41 5 32 5 24 L5 11 Z" fill="none" stroke={c.accent} strokeWidth="0.5" opacity="0.3" />
      <text x="20" y="26" textAnchor="middle" dominantBaseline="middle" fill={c.text} fontSize={fontSize} fontFamily="monospace" fontWeight="900" letterSpacing="-0.5">{c.abbr}</text>
    </svg>
  );
}

const CONF_LOGO_FILE: Record<string, string> = {
  CONMEBOL: "conmebol", UEFA: "uefa", CONCACAF: "concacaf", CAF: "caf", AFC: "asianfc", OFC: "ofc",
};

function ConfederationLogo({ confederation, size = 28 }: { confederation: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const file = CONF_LOGO_FILE[confederation];
  if (!file || failed) return <FallbackShield confederation={confederation} size={size} />;
  return (
    <img
      src={`/images/confederations/${file}.png`}
      alt={confederation}
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size, filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.5))" }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function TeamCrest({ teamId, confederation, size = 36 }: { teamId: string; confederation: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <FallbackShield confederation={confederation} size={size} />;
  return (
    <img
      src={`/images/crests/${teamId}.png`}
      alt={teamId}
      width={size}
      height={size}
      className="object-contain flex-shrink-0"
      style={{ width: size, height: size, filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.55)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))" }}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}

function FlagImg({ flagCode, size = "md" }: { flagCode: string; size?: "xs" | "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-14 h-[38px]" : size === "md" ? "w-9 h-6" : size === "sm" ? "w-6 h-4" : "w-5 h-[13px]";
  return (
    <img
      src={`https://flagcdn.com/w80/${flagCode}.png`}
      alt={flagCode}
      className={`${dims} object-cover rounded-[3px] shadow-sm flex-shrink-0`}
      loading="lazy"
    />
  );
}

// PATCH: StatBar sin Framer Motion en mobile.
// Con 48 cards × 6 barras = 288 motion.div activos en el listado.
// En mobile usamos div puro: mismo visual, cero overhead de animación.
function StatBar({ value, max }: { value: number; max: number }) {
  const isMobile = useIsMobile();
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
      {isMobile ? (
        <div
          className="h-full bg-sca-accent rounded-full"
          style={{ width: `${pct}%` }}
        />
      ) : (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full bg-sca-accent rounded-full"
        />
      )}
    </div>
  );
}

const TEAM_GRADIENTS: Record<string, [string, string, string]> = {
  argentina: ["#74b9e8","#2563eb","#60a5fa"], brazil: ["#22c55e","#15803d","#4ade80"],
  uruguay: ["#60a5fa","#1e40af","#93c5fd"], colombia: ["#fbbf24","#d97706","#fde68a"],
  ecuador: ["#facc15","#a16207","#fef08a"], paraguay: ["#ef4444","#991b1b","#fca5a5"],
  germany: ["#6b7280","#374151","#d1d5db"], france: ["#3b82f6","#1d4ed8","#93c5fd"],
  spain: ["#ef4444","#b91c1c","#fca5a5"], england: ["#e2e8f0","#64748b","#f1f5f9"],
  netherlands: ["#f97316","#c2410c","#fdba74"], portugal: ["#dc2626","#991b1b","#fca5a5"],
  croatia: ["#ef4444","#7f1d1d","#fca5a5"], belgium: ["#dc2626","#1a1a1a","#fca5a5"],
  switzerland: ["#dc2626","#7f1d1d","#fca5a5"], austria: ["#dc2626","#7f1d1d","#fca5a5"],
  scotland: ["#3b82f6","#1e3a5f","#93c5fd"], norway: ["#dc2626","#1a1a1a","#fca5a5"],
  usa: ["#3b82f6","#7f1d1d","#93c5fd"], mexico: ["#22c55e","#166534","#4ade80"],
  canada: ["#ef4444","#7f1d1d","#fca5a5"], panama: ["#ef4444","#1e3a8a","#fca5a5"],
  curacao: ["#f59e0b","#1e3a8a","#fde68a"], haiti: ["#1d4ed8","#7f1d1d","#93c5fd"],
  morocco: ["#dc2626","#14532d","#fca5a5"], senegal: ["#16a34a","#facc15","#4ade80"],
  south_africa: ["#22c55e","#facc15","#4ade80"], ghana: ["#facc15","#7f1d1d","#fef08a"],
  ivory_coast: ["#f97316","#16a34a","#fdba74"], tunisia: ["#dc2626","#1a1a1a","#fca5a5"],
  algeria: ["#f8fafc","#16a34a","#e2e8f0"], egypt: ["#dc2626","#1a1a1a","#fca5a5"],
  cape_verde: ["#3b82f6","#16a34a","#93c5fd"], japan: ["#1d4ed8","#0f172a","#93c5fd"],
  south_korea: ["#dc2626","#1e3a8a","#fca5a5"], iran: ["#16a34a","#dc2626","#4ade80"],
  australia: ["#facc15","#16a34a","#fef08a"], saudi_arabia: ["#16a34a","#1a1a1a","#4ade80"],
  qatar: ["#9f1239","#1a1a1a","#fda4af"], jordan: ["#dc2626","#15803d","#fca5a5"],
  uzbekistan: ["#3b82f6","#16a34a","#93c5fd"], new_zealand: ["#64748b","#1e293b","#cbd5e1"],
};

function getTeamGradient(teamId: string): [string, string, string] {
  return TEAM_GRADIENTS[teamId] ?? ["#1e293b", "#0f172a", "#94a3b8"];
}

const TEXTURE_SVG = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='white' stroke-width='0.4' opacity='0.08'%3E%3Cpolygon points='20,2 38,11 38,29 20,38 2,29 2,11'/%3E%3Cpolygon points='20,8 32,14 32,26 20,32 8,26 8,14'/%3E%3Cline x1='20' y1='2' x2='20' y2='38'/%3E%3Cline x1='2' y1='20' x2='38' y2='20'/%3E%3C/g%3E%3C/svg%3E")`;

// ─── TEAM CARD ────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  onClick,
  cardRef,
}: {
  team: TeamStats;
  onClick: () => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  const isMobile = useIsMobile();
  const winRate = team.played > 0 ? Math.round((team.won / team.played) * 100) : 0;
  const isDebut = team.played === 0;
  const [from, , glow] = getTeamGradient(team.id);

  return (
    <motion.button
      ref={cardRef}
      // PATCH: sin whileHover en mobile (no hay hover real en touch).
      // whileTap ligeramente menos agresivo en mobile.
      {...(!isMobile && { whileHover: { scale: 1.018, y: -1 } })}
      whileTap={{ scale: isMobile ? 0.978 : 0.982 }}
      onClick={onClick}
      className="w-full text-left overflow-hidden relative"
      style={{
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.10)",
        // Glass suave en mobile: blur(6px) — mitad del costo de blur(10px).
        // Solo en el listado estático. TeamDetail dentro del Slider sigue sólido.
        // Sin textura SVG (capa extra innecesaria en mobile).
        background: isMobile ? "rgba(13, 17, 23, 0.72)" : "rgba(13, 17, 23, 0.55)",
        backdropFilter: isMobile ? "blur(6px)" : "blur(10px)",
        WebkitBackdropFilter: isMobile ? "blur(6px)" : "blur(10px)",
        boxShadow: isMobile ? "0 2px 16px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 90% 130% at 0% 50%, ${from}45 0%, ${from}18 40%, transparent 72%)`,
          borderRadius: 12,
        }}
      />
      {/* Highlight superior: en mobile versión suave, en desktop full */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "50%",
          background: isMobile
            ? "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)",
          borderRadius: "12px 12px 0 0",
        }}
      />
      {/* Textura SVG solo en desktop */}
      {!isMobile && (
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.055]"
          style={{ backgroundImage: TEXTURE_SVG, borderRadius: 12 }}
        />
      )}
      <div className="relative flex items-center" style={{ minHeight: 80, padding: "0 16px 0 0" }}>
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: 80, height: 80 }}>
          <FlagImg flagCode={team.flagCode} size="lg" />
        </div>
        <div className="flex-1 min-w-0 py-3">
          <div
            className="font-black text-white text-base leading-tight truncate"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.7)" }}
          >
            {team.name}
          </div>
          <div className="text-[10px] mt-0.5 font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
            {team.confederation} · {team.participations} part.
          </div>
          <div className="mt-2">
            {isDebut ? (
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(0,212,170,0.15)",
                  color: "#00d4aa",
                  border: "1px solid rgba(0,212,170,0.3)",
                }}
              >
                DEBUT · WC 2026
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex gap-2 text-[10px]">
                  <span className="text-white font-bold">
                    {team.played}
                    <span style={{ opacity: 0.55 }} className="font-normal"> PJ</span>
                  </span>
                  <span className="text-white font-bold">
                    {team.won}
                    <span style={{ opacity: 0.55 }} className="font-normal"> G</span>
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.55)" }}>
                    {team.drawn}E · {team.lost}P
                  </span>
                </div>
                <span
                  className="ml-auto text-[11px] font-black text-white"
                  style={{ textShadow: `0 0 10px ${glow}` }}
                >
                  {winRate}%
                </span>
              </div>
            )}
          </div>
        </div>
        {team.titles > 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(245,185,66,0.35)",
              // PATCH: sin backdropFilter en badge pequeño en mobile
              ...(isMobile ? {} : { backdropFilter: "blur(6px)" }),
            }}
          >
            {Array.from({ length: Math.min(team.titles, 5) }).map((_, i) => (
              <span key={i} className="text-sca-gold leading-none" style={{ fontSize: 9 }}>★</span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

// ─── TEAM DETAIL ──────────────────────────────────────────────────────────────

// Skeleton liviano que se muestra mientras la animación de apertura está corriendo.
// Solo texto y bandera — cero drop-shadows, cero gradientes complejos.
function TeamDetailSkeleton({ team, g0 }: { team: TeamStats; g0: string }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "rgba(13,17,23,0.97)",
        minHeight: 180,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 110% 170% at 0% 0%, ${g0}40 0%, ${g0}18 45%, transparent 70%)` }}
      />
      <div className="relative px-4 pt-3 pb-2 border-b border-white/[0.07]">
        <span className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase">
          Ficha de Selección · Copa del Mundo 2026
        </span>
      </div>
      <div className="relative flex items-center gap-4 px-4 py-5">
        {/* Placeholder del crest — sin imagen ni drop-shadow */}
        <div
          className="flex-shrink-0 rounded-lg bg-white/5"
          style={{ width: 76, height: 76 }}
        />
        <div className="flex-1 min-w-0">
          <div className="text-2xl font-black text-white tracking-wide leading-tight">
            {team.name}
          </div>
          <div className="text-[10px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
            {team.confederation} · {team.participations} participaciones
          </div>
          {team.titles > 0 && (
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: Math.min(team.titles, 5) }).map((_, i) => (
                <span key={i} className="text-sca-gold leading-none" style={{ fontSize: 13 }}>★</span>
              ))}
            </div>
          )}
        </div>
        <FlagImg flagCode={team.flagCode} size="lg" />
      </div>
      {/* Indicador de carga sutil */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="h-1 rounded-full bg-amber-400/20 flex-1"
        />
      </div>
    </div>
  );
}

function TeamDetail({ team, onBack }: { team: TeamStats; onBack?: () => void }) {
  const isMobile = useIsMobile();
  const winRate = team.played > 0 ? ((team.won / team.played) * 100).toFixed(1) : "—";
  const goalAvg = team.played > 0 ? (team.goalsFor / team.played).toFixed(2) : "—";
  const isDebut = team.played === 0;
  const [g0] = getTeamGradient(team.id);

  // PATCH: deferred render en mobile.
  // Durante la animación de apertura del Slider (~220ms), el thread de render
  // está ocupado calculando la animación. Si montamos todo el contenido pesado
  // al mismo tiempo (TeamCrest con triple drop-shadow, stats grid, gradientes),
  // competimos por el mismo thread y la animación se traba.
  //
  // Estrategia: mostrar el skeleton liviano inmediatamente, esperar a que
  // la animación termine (~220ms) y recién entonces montar el contenido real.
  // El usuario ve la card aparecer instantáneamente con nombre + bandera,
  // y el contenido completo aparece 220ms después con un fade suave.
  const [contentReady, setContentReady] = useState(!isMobile);
  useEffect(() => {
    if (!isMobile) return;
    setContentReady(false);
    const timer = setTimeout(() => setContentReady(true), 230);
    return () => clearTimeout(timer);
  }, [team.id, isMobile]);

  return (
    <motion.div
      initial={isMobile ? { opacity: 0 } : { opacity: 0, x: 16 }}
      animate={isMobile ? { opacity: 1 } : { opacity: 1, x: 0 }}
      exit={isMobile ? { opacity: 0 } : { opacity: 0, x: -16 }}
      transition={isMobile ? { duration: 0.15 } : { duration: 0.25 }}
      className="space-y-4"
    >
      {onBack && (
        <button
          onClick={onBack}
          className="text-[10px] text-slate-600 hover:text-white flex items-center gap-1.5 font-mono tracking-wider uppercase transition-colors"
        >
          ← Todas las selecciones
        </button>
      )}

      {/* En mobile: skeleton durante la animación, contenido real después */}
      {isMobile && !contentReady ? (
        <TeamDetailSkeleton team={team} g0={g0} />
      ) : (
        <motion.div
          initial={isMobile ? { opacity: 0 } : false}
          animate={isMobile ? { opacity: 1 } : undefined}
          transition={isMobile ? { duration: 0.18 } : undefined}
        >
          <div
            className="relative overflow-hidden"
            style={{
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.10)",
              background: isMobile ? "rgba(13,17,23,0.97)" : "rgba(13,17,23,0.55)",
              ...(isMobile ? {} : {
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
              }),
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: `radial-gradient(ellipse 110% 170% at 0% 0%, ${g0}40 0%, ${g0}18 45%, transparent 70%)` }}
            />
            {!isMobile && (
              <>
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: TEXTURE_SVG }} />
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: "35%", background: "linear-gradient(180deg,rgba(255,255,255,0.06) 0%,transparent 100%)" }} />
              </>
            )}

            <div className="relative px-4 pt-3 pb-2 border-b border-white/[0.07]">
              <span className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase">
                Ficha de Selección · Copa del Mundo 2026
              </span>
            </div>

            <div className="relative flex items-center gap-4 px-4 py-5 border-b border-white/[0.07]">
              <div
                className="flex-shrink-0"
                style={{ filter: "drop-shadow(0 0 14px rgba(255,255,255,0.28)) drop-shadow(0 4px 10px rgba(0,0,0,0.7))" }}
              >
                <TeamCrest teamId={team.id} confederation={team.confederation} size={76} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-2xl font-black text-white tracking-wide leading-tight" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>
                  {team.name}
                </div>
                <div className="text-[10px] mt-1 font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {team.confederation} · {team.participations} participaciones
                </div>
                {team.titles > 0 && (
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {Array.from({ length: Math.min(team.titles, 5) }).map((_, i) => (
                      <span key={i} className="text-sca-gold leading-none" style={{ fontSize: 13, filter: "drop-shadow(0 0 4px rgba(245,185,66,0.6))" }}>★</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0 flex items-center">
                <FlagImg flagCode={team.flagCode} size="lg" />
              </div>
            </div>

            <div className="relative px-4 py-2.5 border-b border-white/[0.07] flex items-baseline gap-2">
              <span className="text-[9px] font-mono text-amber-400/70 uppercase tracking-widest flex-shrink-0">Mejor posición:</span>
              <span className="text-[11px] font-bold text-white leading-snug">{team.bestPosition}</span>
            </div>

            {isDebut ? (
              <div className="relative px-4 py-5 text-center">
                <div className="text-sca-accent font-bold text-sm">Primera participación en Copa del Mundo</div>
                <div className="text-[10px] mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>Debuta en el Mundial 2026 · USA / México / Canadá</div>
              </div>
            ) : (
              <>
                <div className="relative px-4 pt-3 pb-4">
                  <div className="text-[9px] font-mono text-amber-400/70 tracking-widest uppercase mb-3">Estadísticas Copa del Mundo</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { label: "Partidos jugados",  value: team.played,       color: "" },
                      { label: "Partidos ganados",  value: team.won,          color: "text-green-400" },
                      { label: "Empates",           value: team.drawn,        color: "" },
                      { label: "Derrotas",          value: team.lost,         color: "text-red-400" },
                      { label: "Goles a favor",     value: team.goalsFor,     color: "text-sca-accent" },
                      { label: "Goles en contra",   value: team.goalsAgainst, color: "" },
                    ].map((s) => (
                      <div key={s.label} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
                        <span className={`text-sm font-bold tabular-nums ${s.color || "text-white"}`}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative grid grid-cols-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { label: "Rendimiento",   value: `${winRate}%`,  color: "text-sca-accent" },
                    { label: "Goles / PJ",    value: goalAvg,        color: "text-amber-400" },
                    { label: "Primera part.", value: team.firstYear, color: "text-slate-300" },
                  ].map((k, i) => (
                    <div key={k.label} className="flex flex-col items-center py-3 gap-1" style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                      <span className={`text-lg font-black tabular-nums ${k.color}`}>{k.value}</span>
                      <span className="text-[8px] font-mono uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{k.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* PRAGMA Banner */}
          <div className="rounded-sm border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-sm bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
              <span className="text-sca-accent text-sm font-black">P</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-sca-accent">Análisis avanzado by PRAGMA Intelligence</div>
              <div className="text-[9px] text-slate-600 mt-0.5">Modelos predictivos y estadísticas profundas para esta selección.</div>
            </div>
            <span className="text-[9px] bg-sca-accent/10 text-sca-accent px-2 py-0.5 rounded-full font-bold flex-shrink-0">PRÓXIMAMENTE</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const CONFEDERATIONS = ["all", "CONMEBOL", "UEFA", "CONCACAF", "CAF", "AFC", "OFC"] as const;

export default function CentralDeDatos() {
  const isMobile = useIsMobile();
  const [selectedTeam, setSelectedTeam] = useState<TeamStats | null>(null);
  const [filter, setFilter] = useState<(typeof CONFEDERATIONS)[number]>("all");
  const [showEditions, setShowEditions] = useState(false);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered =
    filter === "all" ? worldCupTeams : worldCupTeams.filter((t) => t.confederation === filter);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, filtered.length);
  }, [filtered.length]);

  function openSlider(index: number) {
    const rect = cardRefs.current[index]?.getBoundingClientRect() ?? null;
    setOriginRect(rect);
    setSliderIndex(index);
    setSliderOpen(true);
  }

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
            // PATCH: transición ultrarrápida en mobile para cambio de tab.
            // AnimatePresence mode="wait" espera el exit antes del enter:
            // en mobile eso suma 2× la duración. Con 0.1s queda en ~200ms total.
            transition={{ duration: isMobile ? 0.1 : 0.25 }}
            className="space-y-4"
          >
            <div>
              <h2 className="text-xl font-black text-white">Central de Datos</h2>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                48 selecciones · Copa del Mundo 2026 · USA / México / Canadá
              </p>
            </div>

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
                    <ConfederationLogo confederation={conf} size={isActive ? 30 : 26} />
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

            <div className="space-y-2">
              {filtered.map((team, index) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  cardRef={(el) => { cardRefs.current[index] = el; }}
                  onClick={() => openSlider(index)}
                />
              ))}
            </div>

            <div className="rounded-sm border border-sca-accent/20 bg-gradient-to-r from-sca-accent/5 to-transparent p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-sm bg-sca-accent/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sca-accent text-sm font-black">P</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-sca-accent">
                  Análisis avanzado by PRAGMA Intelligence
                </div>
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

      <ScaBOTni_Slider
        items={filtered}
        initialIndex={sliderIndex}
        isOpen={sliderOpen}
        onClose={() => { setSliderOpen(false); setOriginRect(null); }}
        renderCard={(team) => (
          <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
            <TeamDetail team={team as TeamStats} />
          </div>
        )}
        originRect={originRect}
      />
    </div>
  );
}
