"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { players, managerComments, type Player } from "@/lib/playerData";

const MANAGERS = [
  { id: "mourinho", name: "Mourinho", avatar: "🕶️", style: "text-blue-300" },
  { id: "klopp", name: "Klopp", avatar: "😄", style: "text-red-300" },
  { id: "guardiola", name: "Guardiola", avatar: "🧠", style: "text-sky-300" },
  { id: "fergie", name: "Sir Alex", avatar: "🪄", style: "text-amber-300" },
];

const POSITION_COLOR: Record<string, string> = {
  GK: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  DEF: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  MID: "bg-green-500/20 text-green-400 border-green-500/30",
  FWD: "bg-red-500/20 text-red-400 border-red-500/30",
};

function StatRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500 w-6 uppercase">{label}</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className={`h-full rounded-full ${
            value >= 90 ? "bg-sca-accent" : value >= 75 ? "bg-green-400" : value >= 60 ? "bg-yellow-400" : "bg-slate-500"
          }`}
        />
      </div>
      <span className={`text-xs font-black w-7 text-right ${
        value >= 90 ? "text-sca-accent" : value >= 75 ? "text-green-400" : "text-slate-400"
      }`}>{value}</span>
    </div>
  );
}

function FifaCard({ player, onClick }: { player: Player; onClick: () => void }) {
  const overallColor =
    player.overall >= 97 ? "from-yellow-300 to-amber-400" :
    player.overall >= 93 ? "from-slate-300 to-slate-400" :
    "from-amber-700 to-amber-800";

  return (
    <motion.button
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="relative w-full text-left"
    >
      <div className={`relative rounded-xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-sca-surface to-slate-900 p-3`}>
        {/* Era badge */}
        <div className="absolute top-2 right-2">
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
            player.era === "current"
              ? "bg-sca-accent/20 text-sca-accent border border-sca-accent/30"
              : "bg-sca-gold/20 text-sca-gold border border-sca-gold/30"
          }`}>
            {player.era === "current" ? "ACTUAL" : "HISTÓRICO"}
          </span>
        </div>

        {/* Top: overall + position */}
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center">
            <div className={`text-2xl font-black bg-gradient-to-b ${overallColor} bg-clip-text text-transparent`}>
              {player.overall}
            </div>
            <span className={`text-[9px] font-black px-1 py-0.5 rounded border ${POSITION_COLOR[player.position]}`}>
              {player.position}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-lg">{player.flag}</span>
            </div>
            <div className="font-black text-white text-sm leading-tight">{player.shortName}</div>
            <div className="text-[10px] text-slate-500 truncate">{player.name}</div>
          </div>
          <div className="text-3xl">{player.emoji}</div>
        </div>

        {/* Stats mini */}
        <div className="mt-3 grid grid-cols-3 gap-1 text-center">
          {[
            { label: "PAC", value: player.pace },
            { label: "SHO", value: player.shooting },
            { label: "DRI", value: player.dribbling },
          ].map((s) => (
            <div key={s.label}>
              <div className={`text-sm font-black ${s.value >= 90 ? "text-sca-accent" : "text-white"}`}>{s.value}</div>
              <div className="text-[9px] text-slate-600">{s.label}</div>
            </div>
          ))}
        </div>

        {/* WC goals */}
        {player.worldCupGoals > 0 && (
          <div className="mt-2 text-[10px] text-slate-500 flex gap-2">
            <span>⚽ {player.worldCupGoals} goles MF</span>
            {player.worldCupTitles > 0 && <span>🏆 {player.worldCupTitles}x</span>}
          </div>
        )}

        {/* Trait */}
        <div className="mt-2 text-[10px] font-bold text-sca-gold/70 italic">"{player.trait}"</div>
      </div>
    </motion.button>
  );
}

function ManagerBubble({
  managerId,
  comment,
  index,
}: {
  managerId: string;
  comment: string;
  index: number;
}) {
  const manager = MANAGERS.find((m) => m.id === managerId)!;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4, ease: "easeOut" }}
      className={`flex items-start gap-2 ${isEven ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <div className={`w-9 h-9 rounded-full bg-slate-800 border-2 ${
          managerId === "mourinho" ? "border-blue-500/50" :
          managerId === "klopp" ? "border-red-500/50" :
          managerId === "guardiola" ? "border-sky-500/50" :
          "border-amber-500/50"
        } flex items-center justify-center text-lg`}>
          {manager.avatar}
        </div>
        <span className={`text-[9px] font-bold ${manager.style}`}>{manager.name}</span>
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
        isEven
          ? "rounded-tl-sm bg-slate-800/80 border border-slate-700/60"
          : "rounded-tr-sm bg-slate-700/50 border border-slate-600/40"
      }`}>
        {/* Tail */}
        <div className={`absolute top-2 ${isEven ? "-left-1.5" : "-right-1.5"} w-3 h-3 ${
          isEven ? "bg-slate-800/80" : "bg-slate-700/50"
        } rotate-45 ${isEven ? "border-l border-b border-slate-700/60" : "border-r border-t border-slate-600/40"}`} />

        <p className="text-xs text-slate-200 leading-relaxed italic">"{comment}"</p>

        {/* Decorative accent line */}
        <div className={`mt-1.5 h-0.5 w-8 rounded-full ${
          managerId === "mourinho" ? "bg-blue-500/40" :
          managerId === "klopp" ? "bg-red-500/40" :
          managerId === "guardiola" ? "bg-sky-500/40" :
          "bg-amber-500/40"
        } ${isEven ? "mr-auto" : "ml-auto"}`} />
      </div>
    </motion.div>
  );
}

function PlayerDetail({ player, onBack }: { player: Player; onBack: () => void }) {
  const comments = managerComments;
  const overallColor =
    player.overall >= 97 ? "from-yellow-300 to-amber-400" :
    player.overall >= 93 ? "from-slate-300 to-slate-400" :
    "from-amber-700 to-amber-800";

  // Build comment list: one per manager
  const commentList = MANAGERS.map((m, i) => {
    const managerCommentSet = comments[m.id];
    const playerComments = managerCommentSet?.[player.id] || managerCommentSet?.default || [];
    const comment = playerComments[i % playerComments.length] || playerComments[0] || "Sin comentarios.";
    return { managerId: m.id, comment };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="text-sm text-slate-500 hover:text-white flex items-center gap-1 transition-colors"
      >
        ← Volver al Vestuario
      </button>

      {/* FIFA Card full */}
      <div className={`rounded-2xl overflow-hidden border border-slate-700/60 bg-gradient-to-b from-sca-surface via-slate-900 to-sca-dark p-5`}>
        <div className="flex items-start gap-4">
          {/* Left: rating */}
          <div className="flex flex-col items-center gap-1">
            <div className={`text-5xl font-black bg-gradient-to-b ${overallColor} bg-clip-text text-transparent`}>
              {player.overall}
            </div>
            <span className={`text-xs font-black px-2 py-0.5 rounded border ${POSITION_COLOR[player.position]}`}>
              {player.position}
            </span>
            <span className="text-2xl mt-1">{player.flag}</span>
          </div>

          {/* Right: name + info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl font-black text-white leading-none">{player.shortName}</div>
                <div className="text-sm text-slate-400 mt-0.5">{player.name}</div>
                <div className="text-xs text-slate-500">{player.country} · #{player.number}</div>
              </div>
              <div className="text-5xl">{player.emoji}</div>
            </div>
            <div className="mt-2 flex gap-2 flex-wrap">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                player.era === "current"
                  ? "bg-sca-accent/20 text-sca-accent border border-sca-accent/30"
                  : "bg-sca-gold/20 text-sca-gold border border-sca-gold/30"
              }`}>
                {player.era === "current" ? "ACTUAL" : "HISTÓRICO"}
              </span>
              <span className="text-[10px] text-slate-500 font-bold italic">"{player.trait}"</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 space-y-2">
          <StatRow label="PAC" value={player.pace} />
          <StatRow label="SHO" value={player.shooting} />
          <StatRow label="PAS" value={player.passing} />
          <StatRow label="DRI" value={player.dribbling} />
          <StatRow label="DEF" value={player.defending} />
          <StatRow label="FIS" value={player.physical} />
        </div>

        {/* WC stats */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-black text-sca-accent">{player.worldCupGoals}</div>
            <div className="text-[10px] text-slate-500">Goles MF</div>
          </div>
          <div>
            <div className="text-lg font-black text-white">{player.worldCupApps}</div>
            <div className="text-[10px] text-slate-500">Partidos MF</div>
          </div>
          <div>
            <div className="text-lg font-black text-sca-gold">{player.worldCupTitles}</div>
            <div className="text-[10px] text-slate-500">Títulos</div>
          </div>
        </div>
      </div>

      {/* Manager debate */}
      <div className="rounded-xl border border-slate-700/50 bg-sca-surface/40 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            🎙️ Charla Técnica
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>
        <div className="space-y-4">
          {commentList.map((c, i) => (
            <ManagerBubble key={c.managerId} managerId={c.managerId} comment={c.comment} index={i} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

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
          <PlayerDetail key="detail" player={selectedPlayer} onBack={() => setSelectedPlayer(null)} />
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Header */}
            <div>
              <h2 className="text-xl font-black text-white">Vestuario</h2>
              <p className="text-xs text-slate-500 mt-1">Seleccioná un jugador y escuchá a los DTs</p>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {(["all", "current", "historic"] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() => setEra(e)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-colors ${
                      era === e
                        ? e === "current"
                          ? "bg-sca-accent/20 text-sca-accent border border-sca-accent/40"
                          : e === "historic"
                          ? "bg-sca-gold/20 text-sca-gold border border-sca-gold/40"
                          : "bg-slate-700 text-white border border-slate-600"
                        : "border border-slate-800 text-slate-500 hover:text-white"
                    }`}
                  >
                    {e === "all" ? "Todos" : e === "current" ? "Actuales" : "Históricos"}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {(["all", "GK", "DEF", "MID", "FWD"] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`flex-1 text-[10px] font-bold py-1.5 rounded-lg transition-colors border ${
                      position === pos
                        ? pos === "all"
                          ? "bg-slate-700 text-white border-slate-600"
                          : `${POSITION_COLOR[pos]} bg-opacity-20`
                        : "border-slate-800 text-slate-500 hover:text-white"
                    }`}
                  >
                    {pos === "all" ? "Todos" : pos}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3">
              {filtered.map((player) => (
                <FifaCard key={player.id} player={player} onClick={() => setSelectedPlayer(player)} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-600 text-sm">
                No hay jugadores con esos filtros
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
