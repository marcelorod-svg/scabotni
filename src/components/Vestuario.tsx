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

// Convert "MESSI" → "Messi", "VINÍCIUS JR." → "Vinícius Jr."
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

// Amber as the accent for labels — elegant, readable against dark bg
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

// Monochrome stat bar — slate track, amber fill
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

function ManagerAvatar({ manager }: { manager: ManagerDef }) {
  return (
    <div
      className={`w-8 h-8 rounded-sm border ${manager.accentColor} bg-slate-900 flex items-center justify-center flex-shrink-0`}
    >
      <span className="text-[9px] font-black font-mono text-slate-300 tracking-wider">
        {manager.initials}
      </span>
    </div>
  );
}

function TypewriterBubble({
  manager,
  comment,
  delay,
  isRight,
}: {
  manager: ManagerDef;
  comment: string;
  delay: number;
  isRight: boolean;
}) {
  const { displayed, done } = useTypewriter(comment, 18, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.3 }}
      className={`flex items-start gap-2.5 ${isRight ? "flex-row-reverse" : "flex-row"}`}
    >
      <ManagerAvatar manager={manager} />

      <div className="flex-1 min-w-0 space-y-1">
        <div className={`flex items-center gap-2 ${isRight ? "flex-row-reverse" : ""}`}>
          <span
            className={`text-[9px] font-black font-mono tracking-widest px-1.5 py-0.5 rounded-[2px] ${manager.tagColor}`}
          >
            {manager.name}
          </span>
          <span className="text-[9px] font-mono text-slate-600 truncate">{manager.role}</span>
        </div>

        <div
          className={`relative border border-slate-700/50 bg-slate-900/70 rounded-sm px-3 py-2.5 border-l-2 ${manager.accentColor}`}
        >
          <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
            "{displayed}
            {!done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="inline-block w-[2px] h-3 bg-slate-400 ml-0.5 align-middle"
              />
            )}
            {done && '"'}
          </p>
        </div>
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
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-slate-800" />

      <div className="flex">
        {/* Photo — glow card border */}
        <div
          className="w-[72px] flex-shrink-0 relative"
          style={{ height: 96 }}
        >
          <div
            className="absolute inset-0 rounded-none"
            style={{
              background: "linear-gradient(135deg, #f5b94240 0%, #00d4aa20 50%, #f5b94240 100%)",
              padding: "1px",
            }}
          >
            <div className="w-full h-full overflow-hidden" style={{ height: "100%" }}>
              <PlayerImage
                playerId={player.id}
                name={player.name}
                className="w-full h-full object-cover object-top"
                style={{ height: 96 }}
              />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="flex-1 px-3 py-2.5 min-w-0">
          {/* Name row */}
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

          {/* Stats — 3 cols */}
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

          {/* Footer */}
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
    const count = Math.floor(Math.random() * 2) + 2; // 2 or 3
    const managers = pickRandomManagers(count);
    setPanel(
      managers.map((m, i) => ({
        manager: m,
        comment: getComment(m.id, playerId, i),
      }))
    );
  }, [playerId, refreshKey]);

  return (
    <div className="space-y-4">
      {panel.map(({ manager, comment }, i) => (
        <TypewriterBubble
          key={`${manager.id}-${refreshKey}`}
          manager={manager}
          comment={comment}
          delay={i * 900}
          isRight={i % 2 !== 0}
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
        {/* Header bar */}
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Ficha de Inteligencia Deportiva
          </span>
          <span className="text-[9px] font-mono text-slate-700">
            REF-{player.id.toUpperCase().slice(0, 8)}
          </span>
        </div>

        <div className="flex">
          {/* Photo — FIFA glow frame */}
          <div className="w-36 flex-shrink-0 relative p-[1.5px]" style={{ height: 216 }}>
            {/* Glow border gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(160deg, #f5b942 0%, #00d4aa 40%, #f5b942 80%, #00d4aa 100%)",
                borderRadius: 2,
              }}
            />
            {/* Outer glow */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: "0 0 18px 3px #f5b94230, 0 0 32px 6px #00d4aa18",
                borderRadius: 2,
              }}
            />
            {/* Image */}
            <div
              className="relative overflow-hidden w-full h-full"
              style={{ borderRadius: 1 }}
            >
              <PlayerImage
                playerId={player.id}
                name={player.name}
                className="w-full h-full object-cover object-top"
                style={{ height: 213 }}
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
                  {player.era === "current"
                    ? "Activo"
                    : `Histórico · ${player.birthYear}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Indicadores de Rendimiento ── */}
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

        {/* ── Historial Copa del Mundo ── */}
        <div className="border-t border-slate-800 px-4 pt-3 pb-4 bg-slate-900/30">
          <div className={`text-[9px] uppercase tracking-widest mb-3 ${LABEL_CLASS}`}>
            Historial Copa del Mundo
          </div>
          {/* 4 cols with explicit min-height so number and label never overlap */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Participaciones", value: player.wc_participaciones },
              { label: "Partidos", value: player.wc_partidos },
              { label: "Goles", value: player.wc_goles },
              { label: "Títulos", value: player.wc_titulos },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-start gap-1.5 min-h-[52px]"
              >
                <span className="text-xl font-black text-white tabular-nums leading-none">
                  {s.value}
                </span>
                <span
                  className={`text-[9px] text-center leading-tight px-1 ${LABEL_CLASS}`}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PANEL DE DEBATE ─────────────────────────────────────────── */}
      <div className="rounded-sm border border-slate-700/50 bg-[#0d1117] overflow-hidden">
        <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2 flex items-center justify-between">
          <span className={`text-[9px] uppercase tracking-widest ${LABEL_CLASS}`}>
            Panel de análisis técnico
          </span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 hover:text-amber-400 transition-colors border border-slate-800 hover:border-amber-400/30 px-2 py-1 rounded-[2px]"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              className="w-3 h-3"
            >
              <path d="M13.7 2.3A7 7 0 1 0 15 8" strokeLinecap="round" />
              <path d="M11 2h3V5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Nuevo debate
          </button>
        </div>

        <div className="px-4 py-4">
          {/* Pool chips */}
          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
            <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">
              Técnicos disponibles:
            </span>
            {ALL_MANAGERS.map((m) => (
              <span
                key={m.id}
                className="text-[8px] font-mono text-slate-700 border border-slate-800 px-1 py-0.5 rounded-[2px]"
              >
                {m.initials}
              </span>
            ))}
          </div>

          <DebatePanel playerId={player.id} refreshKey={refreshKey} />
        </div>
      </div>
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
            {/* Header */}
            <div className="border-b border-slate-800 pb-3">
              <div className={`text-[9px] uppercase tracking-widest mb-1 ${LABEL_CLASS}`}>
                Sistema de Información Deportiva
              </div>
              <h2 className="text-xl font-black text-white tracking-wider">Vestuario</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Fichas técnicas · Figuras históricas y actuales
              </p>
            </div>

            {/* Filters */}
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
