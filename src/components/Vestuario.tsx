"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  players,
  ALL_MANAGERS,
  pickRandomManagers,
  getComment,
  type Player,
  type ManagerDef,
} from "@/lib/playerData";
import PlayerImage from "@/components/PlayerImage";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const POSITION_LABEL: Record<string, string> = {
  GK: "Arquero",
  DEF: "Defensor",
  MID: "Mediocampista",
  FWD: "Delantero",
};

const STAT_LABELS: Array<{ key: keyof Player; label: string }> = [
  { key: "pace",      label: "VEL" },
  { key: "shooting",  label: "TIR" },
  { key: "passing",   label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "MAR" },
  { key: "physical",  label: "FIS" },
];

const LABEL_CLASS = "text-amber-400/80 font-mono tracking-wider";

// ─── TYPEWRITER HOOK ──────────────────────────────────────────────────────────

function useTypewriter(text: string, speed = 20, startDelay = 0) {
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

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function FlagImg({ code, className = "" }: { code: string; className?: string }) {
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={code}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}

function StatBar({ value }: { value: number }) {
  return (
    <div className="h-[3px] w-full bg-slate-800 rounded-sm overflow-hidden mt-[3px]">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="h-full bg-amber-400/50 rounded-sm"
      />
    </div>
  );
}

// ── Manager Avatar — real photo from /public/avatars/{id}.png, fallback to initials
function ManagerAvatar({
  manager,
  size = 40,
}: {
  manager: ManagerDef;
  size?: number;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className="flex-shrink-0 rounded-full overflow-hidden"
      style={{
        width: size,
        height: size,
        border: "2px solid",
        borderColor: "#f59e0b60",
        boxShadow: "0 0 8px rgba(251,191,36,0.25)",
      }}
    >
      {!failed ? (
        <img
          src={`/avatars/${manager.id}.png`}
          alt={manager.name}
          width={size}
          height={size}
          className="w-full h-full object-cover object-top"
          onError={() => setFailed(true)}
          loading="lazy"
        />
      ) : (
        // Fallback: initials in a colored circle
        <div
          className="w-full h-full flex items-center justify-center bg-slate-900"
        >
          <span className="text-[10px] font-black font-mono text-amber-400 tracking-wider">
            {manager.initials}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Pitch background SVG lines (very subtle, field markings)
function PitchLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer boundary */}
      <rect x="20" y="15" width="360" height="270" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Center line */}
      <line x1="200" y1="15" x2="200" y2="285" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Center circle */}
      <circle cx="200" cy="150" r="45" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Center dot */}
      <circle cx="200" cy="150" r="2" fill="white" opacity="0.06" />
      {/* Left penalty area */}
      <rect x="20" y="90" width="70" height="120" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Left goal area */}
      <rect x="20" y="120" width="30" height="60" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Right penalty area */}
      <rect x="310" y="90" width="70" height="120" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Right goal area */}
      <rect x="350" y="120" width="30" height="60" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Left penalty arc */}
      <path d="M 90 120 A 35 35 0 0 1 90 180" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Right penalty arc */}
      <path d="M 310 120 A 35 35 0 0 0 310 180" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      {/* Corner arcs */}
      <path d="M 20 25 A 8 8 0 0 1 28 15" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      <path d="M 372 15 A 8 8 0 0 1 380 25" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      <path d="M 20 275 A 8 8 0 0 0 28 285" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
      <path d="M 372 285 A 8 8 0 0 0 380 275" fill="none" stroke="white" strokeWidth="0.6" opacity="0.07" />
    </svg>
  );
}

// ── Typewriter bubble — premium dark module with amber border
function TypewriterBubble({
  manager,
  comment,
  delay,
  isRight,
  isActive,
}: {
  manager: ManagerDef;
  comment: string;
  delay: number;
  isRight: boolean;
  isActive: boolean;
}) {
  const { displayed, done } = useTypewriter(comment, 18, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.35, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isRight ? "flex-row-reverse" : "flex-row"}`}
    >
      <ManagerAvatar manager={manager} size={40} />

      <div className="flex-1 min-w-0">
        {/* Name + role header */}
        <div className={`flex items-baseline gap-2 mb-1.5 ${isRight ? "flex-row-reverse" : ""}`}>
          <span className="text-[11px] font-bold text-amber-400 tracking-tight">
            {toTitleCase(manager.name)}
          </span>
          <span className="text-[9px] text-slate-500 font-mono truncate">{manager.role}</span>
        </div>

        {/* Premium bubble */}
        <motion.div
          animate={isActive && !done ? {
            boxShadow: [
              "0 0 6px rgba(251,191,36,0.1)",
              "0 0 14px rgba(251,191,36,0.25)",
              "0 0 6px rgba(251,191,36,0.1)",
            ],
          } : {
            boxShadow: done ? "0 0 10px rgba(251,191,36,0.15)" : "none",
          }}
          transition={{ duration: 1.8, repeat: isActive && !done ? Infinity : 0 }}
          className="relative rounded-xl border border-amber-500/30 overflow-hidden"
          style={{ background: "rgba(0,0,0,0.75)" }}
        >
          {/* Subtle amber top line */}
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

          <p className="px-4 py-3 text-[12px] text-slate-200 leading-relaxed font-sans">
            "{displayed}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
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

// ─── PLAYER CARD (list view) ──────────────────────────────────────────────────

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.012 }}
      whileTap={{ scale: 0.988 }}
      onClick={onClick}
      className="w-full text-left rounded-sm border border-slate-700/50 bg-[#0d1117] hover:border-amber-500/30 transition-colors overflow-hidden"
    >
      <div className="h-[2px] w-full bg-slate-800" />
      <div className="flex">
        {/* Photo — uniform 72×96, object-cover object-top with glow border */}
        <div
          className="flex-shrink-0 relative overflow-hidden"
          style={{ width: 72, height: 96 }}
        >
          <div
            className="absolute inset-0 z-10 pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #f5b94230 0%, #00d4aa15 50%, #f5b94230 100%)",
              padding: "1px",
            }}
          />
          <PlayerImage
            playerId={player.id}
            name={player.name}
            className="w-full h-full object-cover object-top"
            style={{ width: 72, height: 96 }}
          />
        </div>

        {/* Data */}
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className={`text-[9px] uppercase mb-0.5 ${LABEL_CLASS}`}>
                {POSITION_LABEL[player.position]}
              </div>
              <div className="font-black text-white text-sm leading-tight tracking-wide truncate">
                {toTitleCase(player.name)}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <FlagImg code={player.flagCode} className="w-6 h-[15px] rounded-[2px]" />
              <span className="text-xl font-black text-white leading-none tabular-nums">
                {player.overall}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-x-3">
            {STAT_LABELS.slice(0, 3).map(({ key, label }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline">
                  <span className={`text-[9px] ${LABEL_CLASS}`}>{label}</span>
                  <span className="text-[10px] font-bold text-white tabular-nums">
                    {player[key] as number}
                  </span>
                </div>
                <StatBar value={player[key] as number} />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-slate-700 font-mono">
              {player.era === "current" ? "Activo" : "Histórico"}
            </span>
            <span className="text-[9px] text-slate-600 font-mono">
              MF · {player.wc_partidos} PJ · {player.wc_goles} G
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ─── DEBATE PANEL ─────────────────────────────────────────────────────────────

function DebatePanel({ playerId, refreshKey }: { playerId: string; refreshKey: number }) {
  const [panel, setPanel] = useState<Array<{ manager: ManagerDef; comment: string }>>([]);

  useEffect(() => {
    const count = Math.floor(Math.random() * 2) + 2;
    const managers = pickRandomManagers(count);
    setPanel(
      managers.map((m, i) => ({
        manager: m,
        comment: getComment(m.id, playerId, i),
      }))
    );
  }, [playerId, refreshKey]);

  return (
    <div className="space-y-5">
      {panel.map(({ manager, comment }, i) => (
        <TypewriterBubble
          key={`${manager.id}-${refreshKey}-${i}`}
          manager={manager}
          comment={comment}
          delay={i * 950}
          isRight={i % 2 !== 0}
          isActive={true}
        />
      ))}
    </div>
  );
}

// ─── PLAYER DETAIL ────────────────────────────────────────────────────────────

function PlayerDetail({ player, onBack }: { player: Player; onBack: () => void }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="text-[10px] text-slate-600 hover:text-slate-300 flex items-center gap-1.5 font-mono tracking-widest uppercase transition-colors"
      >
        ← Volver al vestuario
      </button>

      {/* ── FICHA PRINCIPAL ─────────────────────────────────────────── */}
      <div className="rounded-sm border border-slate-700/50 bg-[#0d1117] overflow-hidden">
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Ficha de Inteligencia Deportiva
          </span>
          <span className="text-[9px] font-mono text-slate-700">
            REF-{player.id.toUpperCase().slice(0, 8)}
          </span>
        </div>

        <div className="flex">
          {/* Photo — uniform size with FIFA glow frame */}
          <div
            className="flex-shrink-0 relative p-[1.5px]"
            style={{ width: 144, height: 216 }}
          >
            <div
              className="absolute inset-0 rounded-[2px]"
              style={{
                background: "linear-gradient(160deg, #f5b942 0%, #00d4aa 40%, #f5b942 80%, #00d4aa 100%)",
              }}
            />
            <div
              className="absolute inset-0 rounded-[2px]"
              style={{ boxShadow: "0 0 18px 3px #f5b94230, 0 0 32px 6px #00d4aa18" }}
            />
            <div className="relative w-full overflow-hidden rounded-[1px]" style={{ height: 213 }}>
              <PlayerImage
                playerId={player.id}
                name={player.name}
                className="w-full h-full object-cover object-top"
                style={{ width: 141, height: 213 }}
              />
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 p-4 space-y-3 min-w-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlagImg code={player.flagCode} className="w-7 h-[17px] rounded-[2px]" />
                <span className={`text-[9px] uppercase tracking-widest truncate ${LABEL_CLASS}`}>
                  {player.country} · #{player.number}
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-wider leading-tight">
                {toTitleCase(player.name)}
              </div>
              <div className="text-[10px] text-slate-600 mt-0.5 font-mono truncate">
                {player.fullName}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>
                <div className="text-4xl font-black text-white leading-none tabular-nums">
                  {player.overall}
                </div>
                <div className={`text-[8px] mt-1 uppercase ${LABEL_CLASS}`}>
                  Índice global
                </div>
              </div>
              <div className="w-px h-10 bg-slate-800" />
              <div>
                <div className="text-xs font-black text-slate-300 tracking-wider uppercase">
                  {POSITION_LABEL[player.position]}
                </div>
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">
                  {player.era === "current" ? "Activo" : `Histórico · ${player.birthYear}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores */}
        <div className="border-t border-slate-800 px-4 pt-3 pb-4">
          <div className={`text-[9px] uppercase tracking-widest mb-3 ${LABEL_CLASS}`}>
            Indicadores de rendimiento
          </div>
          <div className="grid grid-cols-3 gap-x-5 gap-y-3">
            {STAT_LABELS.map(({ key, label }) => (
              <div key={label}>
                <div className="flex items-baseline justify-between">
                  <span className={`text-[10px] ${LABEL_CLASS}`}>{label}</span>
                  <span className="text-lg font-black text-white tabular-nums leading-none">
                    {player[key] as number}
                  </span>
                </div>
                <StatBar value={player[key] as number} />
              </div>
            ))}
          </div>
        </div>

        {/* WC record */}
        <div className="border-t border-slate-800 px-4 pt-3 pb-4 bg-slate-900/30">
          <div className={`text-[9px] uppercase tracking-widest mb-3 ${LABEL_CLASS}`}>
            Historial Copa del Mundo
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Participaciones", value: player.wc_participaciones },
              { label: "Partidos", value: player.wc_partidos },
              { label: "Goles", value: player.wc_goles },
              { label: "Títulos", value: player.wc_titulos },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-1.5 min-h-[52px]">
                <span className="text-xl font-black text-white tabular-nums leading-none">
                  {s.value}
                </span>
                <span className={`text-[9px] text-center leading-tight px-1 ${LABEL_CLASS}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PIZARRA TÁCTICA DE INTELIGENCIA ─────────────────────────── */}
      <motion.div
        className="rounded-xl overflow-hidden border border-amber-500/20 relative"
        style={{
          boxShadow: "0 0 24px rgba(251,191,36,0.08), 0 0 1px rgba(251,191,36,0.3)",
        }}
      >
        {/* Background: dark green tactical board + pitch lines */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at 50% 40%, #0d2218 0%, #081410 50%, #050e0a 100%)",
          }}
        />
        <PitchLines />

        {/* Content over background */}
        <div className="relative z-10">
          {/* Header */}
          <div
            className="border-b border-amber-500/15 px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(0,0,0,0.4)" }}
          >
            <div className="flex items-center gap-2">
              {/* Pulsing green dot — AI active */}
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-emerald-400"
                style={{ boxShadow: "0 0 6px #34d39980" }}
              />
              <span className={`text-[10px] uppercase tracking-widest ${LABEL_CLASS}`}>
                Pizarra táctica · Análisis técnico en vivo
              </span>
            </div>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 hover:text-amber-400 transition-colors border border-slate-700/50 hover:border-amber-400/30 px-2.5 py-1 rounded-full"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3 h-3">
                <path d="M13.7 2.3A7 7 0 1 0 15 8" strokeLinecap="round" />
                <path d="M11 2h3V5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Nuevo debate
            </button>
          </div>

          {/* Técnicos disponibles */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-2 flex-wrap">
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
              Panel activo:
            </span>
            {ALL_MANAGERS.map((m) => (
              <div key={m.id} className="flex items-center gap-1">
                <ManagerAvatar manager={m} size={18} />
                <span className="text-[8px] font-mono text-slate-600">
                  {toTitleCase(m.name.split(" ")[0])}
                </span>
              </div>
            ))}
          </div>

          {/* Debate bubbles */}
          <div className="px-4 pb-5 pt-2">
            <DebatePanel playerId={player.id} refreshKey={refreshKey} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function Vestuario() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [era, setEra] = useState<"all" | "current" | "historic">("all");
  const [position, setPosition] = useState<"all" | "GK" | "DEF" | "MID" | "FWD">("all");

  const filtered = players.filter((p) => {
    if (era !== "all" && p.era !== era) return false;
    if (position !== "all" && p.position !== position) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {selectedPlayer ? (
          <PlayerDetail
            key="detail"
            player={selectedPlayer}
            onBack={() => setSelectedPlayer(null)}
          />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="border-b border-slate-800 pb-3">
              <div className={`text-[9px] uppercase tracking-widest mb-1 ${LABEL_CLASS}`}>
                Sistema de Información Deportiva
              </div>
              <h2 className="text-xl font-black text-white tracking-wider">Vestuario</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Fichas técnicas · Figuras históricas y actuales
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {(["all", "current", "historic"] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() => setEra(e)}
                    className={`flex-1 text-[9px] font-mono font-bold py-1.5 tracking-widest uppercase border rounded-[2px] transition-colors ${
                      era === e
                        ? "bg-amber-400/10 text-amber-400 border-amber-400/40"
                        : "border-slate-800 text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {e === "all" ? "Todos" : e === "current" ? "Activos" : "Históricos"}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {(["all", "GK", "DEF", "MID", "FWD"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`flex-1 text-[9px] font-mono font-bold py-1.5 tracking-widest uppercase border rounded-[2px] transition-colors ${
                      position === pos
                        ? "bg-amber-400/10 text-amber-400 border-amber-400/40"
                        : "border-slate-800 text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {pos === "all" ? "Pos" : pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9px] font-mono text-slate-700 tracking-widest uppercase">
              {filtered.length} fichas encontradas
            </div>

            <div className="space-y-2">
              {filtered.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  onClick={() => setSelectedPlayer(player)}
                />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center text-[10px] font-mono text-slate-700 uppercase tracking-widest">
                Sin resultados para los filtros seleccionados
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
