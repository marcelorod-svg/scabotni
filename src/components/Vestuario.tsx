"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { players, MANAGERS, getVestuarioComments, type Player } from "@/lib/playerData";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const POSITION_LABEL: Record<string, string> = {
  GK: "ARQUERO",
  DEF: "DEFENSOR",
  MID: "MEDIOCAMPISTA",
  FWD: "DELANTERO",
};

const STAT_LABELS: Array<{ key: keyof Player; label: string }> = [
  { key: "pace", label: "VEL" },
  { key: "shooting", label: "DEF" },
  { key: "passing", label: "PAS" },
  { key: "dribbling", label: "DRI" },
  { key: "defending", label: "MAR" },
  { key: "physical", label: "FIS" },
];

const MANAGER_COLORS: Record<string, string> = {
  bilardo: "border-l-blue-500",
  ruggeri: "border-l-amber-500",
  scaloni: "border-l-sky-400",
};

const MANAGER_TAG_COLORS: Record<string, string> = {
  bilardo: "text-blue-400 bg-blue-400/10",
  ruggeri: "text-amber-400 bg-amber-400/10",
  scaloni: "text-sky-400 bg-sky-400/10",
};

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

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
    <div className="h-[3px] w-full bg-slate-800 rounded-sm overflow-hidden mt-1">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-slate-400 rounded-sm"
      />
    </div>
  );
}

function PlayerCard({ player, onClick }: { player: Player; onClick: () => void }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="w-full text-left rounded-sm border border-slate-700/60 bg-[#0d1117] hover:border-slate-500/60 transition-colors overflow-hidden"
    >
      {/* Top accent line */}
      <div className="h-[2px] w-full bg-slate-700" />

      <div className="flex gap-0">
        {/* Photo column */}
        <div className="w-20 flex-shrink-0 bg-slate-900/60 flex items-center justify-center overflow-hidden">
          {!imgError ? (
            <img
              src={player.imageUrl}
              alt={player.name}
              className="w-full h-full object-cover object-top"
              style={{ minHeight: "96px", maxHeight: "96px" }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-24 flex items-center justify-center">
              <span className="text-slate-600 text-xs font-mono">{player.number}</span>
            </div>
          )}
        </div>

        {/* Data column */}
        <div className="flex-1 p-3 min-w-0">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-0.5">
                {POSITION_LABEL[player.position]}
              </div>
              <div className="font-black text-white text-sm leading-tight tracking-wide">
                {player.name}
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <FlagImg code={player.flagCode} className="w-6 h-4 rounded-[2px]" />
              <span className="text-2xl font-black text-slate-300 leading-none tabular-nums">
                {player.overall}
              </span>
            </div>
          </div>

          {/* Stats row — 3 stats compact */}
          <div className="grid grid-cols-3 gap-x-3">
            {STAT_LABELS.slice(0, 3).map(({ key, label }) => (
              <div key={label}>
                <div className="flex justify-between items-baseline">
                  <span className="text-[9px] text-slate-600 font-mono">{label}</span>
                  <span className="text-[10px] font-bold text-slate-300 tabular-nums">
                    {player[key] as number}
                  </span>
                </div>
                <StatBar value={player[key] as number} />
              </div>
            ))}
          </div>

          {/* Footer row */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-[9px] text-slate-600 font-mono">
              {player.era === "current" ? "ACTIVO" : `HISTÓRICO · ${player.birthYear}`}
            </span>
            <span className="text-[9px] text-slate-500 font-mono">
              MF: {player.wc_partidos}PJ · {player.wc_goles}G
            </span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

function PlayerDetail({ player, onBack }: { player: Player; onBack: () => void }) {
  const [imgError, setImgError] = useState(false);
  const comments = getVestuarioComments(player.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1.5 font-mono tracking-wider uppercase transition-colors"
      >
        ← Volver al Vestuario
      </button>

      {/* ── FICHA PRINCIPAL ──────────────────────────────────────── */}
      <div className="rounded-sm border border-slate-700/60 bg-[#0d1117] overflow-hidden">
        {/* Header bar */}
        <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-2 flex items-center justify-between">
          <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">
            FICHA DE INTELIGENCIA DEPORTIVA
          </span>
          <span className="text-[9px] font-mono text-slate-600">
            REF-{player.id.toUpperCase().slice(0, 6)}
          </span>
        </div>

        <div className="flex gap-0">
          {/* Photo */}
          <div className="w-36 flex-shrink-0 bg-slate-900/40 overflow-hidden flex items-start justify-center">
            {!imgError ? (
              <img
                src={player.imageUrl}
                alt={player.name}
                className="w-full object-cover object-top"
                style={{ minHeight: "200px", maxHeight: "200px" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-48 flex items-center justify-center">
                <span className="text-slate-700 font-mono text-4xl font-black">
                  {player.number}
                </span>
              </div>
            )}
          </div>

          {/* Data */}
          <div className="flex-1 p-4 space-y-4">
            {/* Name block */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FlagImg code={player.flagCode} className="w-7 h-[18px] rounded-[2px]" />
                <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">
                  {player.country} · #{player.number}
                </span>
              </div>
              <div className="text-2xl font-black text-white tracking-wider leading-none">
                {player.name}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-mono">
                {player.fullName}
              </div>
            </div>

            {/* Overall + position */}
            <div className="flex items-center gap-3">
              <div>
                <div className="text-5xl font-black text-white leading-none tabular-nums">
                  {player.overall}
                </div>
                <div className="text-[9px] text-slate-600 font-mono mt-0.5">ÍNDICE GLOBAL</div>
              </div>
              <div className="h-10 w-px bg-slate-800" />
              <div>
                <div className="text-sm font-black text-slate-300 tracking-wide">
                  {POSITION_LABEL[player.position]}
                </div>
                <div className="text-[9px] text-slate-600 font-mono">
                  {player.era === "current" ? "ACTIVO" : `HISTÓRICO · n. ${player.birthYear}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="border-t border-slate-700/60 px-4 py-4">
          <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-3 uppercase">
            Indicadores de Rendimiento
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-3">
            {STAT_LABELS.map(({ key, label }) => (
              <div key={label}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-mono text-slate-500 tracking-wider">{label}</span>
                  <span className="text-lg font-black text-white tabular-nums leading-none">
                    {player[key] as number}
                  </span>
                </div>
                <StatBar value={player[key] as number} />
              </div>
            ))}
          </div>
        </div>

        {/* World Cup record */}
        <div className="border-t border-slate-700/60 px-4 py-3 bg-slate-900/30">
          <div className="text-[9px] font-mono text-slate-600 tracking-widest mb-2 uppercase">
            Historial Copa del Mundo
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "PARTICIPACIONES", value: player.wc_participaciones },
              { label: "PARTIDOS JUGADOS", value: player.wc_partidos },
              { label: "GOLES", value: player.wc_goles },
              { label: "TÍTULOS", value: player.wc_titulos },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-black text-white tabular-nums leading-none">
                  {s.value}
                </div>
                <div className="text-[8px] font-mono text-slate-600 mt-0.5 leading-tight">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ANÁLISIS TÉCNICO ─────────────────────────────────────── */}
      <div className="rounded-sm border border-slate-700/60 bg-[#0d1117] overflow-hidden">
        <div className="bg-slate-900 border-b border-slate-700/60 px-4 py-2">
          <span className="text-[9px] font-mono text-slate-500 tracking-widest uppercase">
            Análisis Técnico · Panel de DTs
          </span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {comments.map(({ managerId, comment }, i) => {
            const manager = MANAGERS.find((m) => m.id === managerId)!;
            const isRight = i % 2 !== 0;

            return (
              <motion.div
                key={managerId}
                initial={{ opacity: 0, x: isRight ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.35 }}
                className={`px-4 py-4 border-l-2 ${MANAGER_COLORS[managerId]}`}
              >
                {/* Manager header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[9px] font-black font-mono tracking-widest px-2 py-0.5 rounded-[2px] ${MANAGER_TAG_COLORS[managerId]}`}>
                    {manager.name}
                  </span>
                  <span className="text-[9px] font-mono text-slate-600">{manager.role}</span>
                </div>

                {/* Comment bubble */}
                <div className="relative bg-slate-900/60 border border-slate-700/40 rounded-sm px-3 py-2.5">
                  <p className="text-[12px] text-slate-300 leading-relaxed font-sans">
                    "{comment}"
                  </p>
                  {/* Left notch */}
                  <div className="absolute left-3 -top-[5px] w-2 h-2 bg-slate-900/60 border-l border-t border-slate-700/40 rotate-45" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

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
              <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase mb-1">
                Sistema de Información Deportiva
              </div>
              <h2 className="text-xl font-black text-white tracking-wider">VESTUARIO</h2>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Fichas técnicas · Figuras históricas y actuales
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              {/* Era filter */}
              <div className="flex gap-1.5">
                {(["all", "current", "historic"] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() => setEra(e)}
                    className={`flex-1 text-[9px] font-mono font-bold py-1.5 tracking-widest uppercase transition-colors border rounded-[2px] ${
                      era === e
                        ? "bg-slate-700 text-white border-slate-500"
                        : "border-slate-800 text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {e === "all" ? "TODOS" : e === "current" ? "ACTIVOS" : "HISTÓRICOS"}
                  </button>
                ))}
              </div>

              {/* Position filter */}
              <div className="flex gap-1.5">
                {(["all", "GK", "DEF", "MID", "FWD"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`flex-1 text-[9px] font-mono font-bold py-1.5 tracking-widest uppercase transition-colors border rounded-[2px] ${
                      position === pos
                        ? "bg-slate-700 text-white border-slate-500"
                        : "border-slate-800 text-slate-600 hover:text-slate-400"
                    }`}
                  >
                    {pos === "all" ? "POS" : pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div className="text-[9px] font-mono text-slate-600 tracking-widest uppercase">
              {filtered.length} FICHAS ENCONTRADAS
            </div>

            {/* List */}
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
              <div className="py-12 text-center text-[11px] font-mono text-slate-700 uppercase tracking-widest">
                Sin resultados para los filtros seleccionados
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
