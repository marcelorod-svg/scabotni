"use client";

import { useState } from "react";

interface UserScoreInputProps {
  match: { homeTeam: string; awayTeam: string };
  onSave: (homeScore: number, awayScore: number) => void;
  onCancel: () => void;
}

export default function UserScoreInput({
  match,
  onSave,
  onCancel,
}: UserScoreInputProps) {
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 space-y-4">
      <h3 className="font-bold text-white">Your Prediction</h3>
      <div className="flex items-center justify-center gap-4">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-500">{match.homeTeam}</span>
          <input
            type="number"
            min={0}
            max={15}
            value={homeScore}
            onChange={(e) => setHomeScore(Math.max(0, Math.min(15, +e.target.value)))}
            className="w-16 h-14 text-center text-2xl font-bold rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
        <span className="text-2xl text-slate-500 font-bold">—</span>
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-500">{match.awayTeam}</span>
          <input
            type="number"
            min={0}
            max={15}
            value={awayScore}
            onChange={(e) => setAwayScore(Math.max(0, Math.min(15, +e.target.value)))}
            className="w-16 h-14 text-center text-2xl font-bold rounded-lg bg-slate-900 border border-slate-600 text-white"
          />
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave(homeScore, awayScore)}
          className="flex-1 py-3 rounded-xl font-bold bg-sca-accent text-sca-dark hover:bg-sca-accent/90"
        >
          Save Prediction
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-xl font-medium border border-slate-600 text-slate-400 hover:bg-slate-800"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
