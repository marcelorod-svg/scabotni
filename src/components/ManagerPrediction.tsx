"use client";

import Image from "next/image";
import { Prediction as PredictionType, Manager, Match } from "@/lib/types";
import { managers } from "@/lib/managers";
import { getCountryCode } from "@/lib/teamFlags";
import ManagerAvatar from "./ManagerAvatar";
import TypewriterPhrase from "./TypewriterPhrase";

function MatchContext({ match }: { match: Match }) {
  const homeCode = match.homeCountryCode ?? getCountryCode(match.homeTeam);
  const awayCode = match.awayCountryCode ?? getCountryCode(match.awayTeam);
  const Flag = ({ code }: { code: string }) => (
    <span className="flex-shrink-0 w-6 h-4 rounded overflow-hidden border border-slate-600/50">
      <Image src={`https://flagcdn.com/${code}.svg`} alt="" width={24} height={16} className="object-cover w-full h-full" />
    </span>
  );
  return (
    <div className="px-6 py-3 bg-slate-900/50 border-b border-slate-700/50">
      <div className="flex items-center justify-between gap-3 font-semibold text-slate-300">
        <span className="flex items-center gap-2 min-w-0">
          {homeCode && <Flag code={homeCode} />}
          <span className="truncate">{match.homeTeam}</span>
        </span>
        <span className="text-slate-500 flex-shrink-0">vs</span>
        <span className="flex items-center gap-2 min-w-0 justify-end">
          <span className="truncate">{match.awayTeam}</span>
          {awayCode && <Flag code={awayCode} />}
        </span>
      </div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">{match.league}</div>
    </div>
  );
}

interface ManagerPredictionProps {
  match: Match;
  prediction: PredictionType;
  onFollow: () => void;
  onContradict: () => void;
  userPrediction?: { homeScore: number; awayScore: number; followed: boolean };
  showUserInput?: boolean;
}

function getManager(id: string): Manager | undefined {
  return managers.find((m) => m.id === id);
}

export default function ManagerPrediction({
  match,
  prediction,
  onFollow,
  onContradict,
  userPrediction,
  showUserInput = true,
}: ManagerPredictionProps) {
  const manager = getManager(prediction.managerId);

  if (!manager) return null;

  return (
    <div
      className="rounded-2xl overflow-hidden border-2"
      style={{
        borderColor: manager.color,
        boxShadow: `0 0 40px ${manager.color}25`,
      }}
    >
      {/* Header with manager identity */}
      <div
        className="px-6 py-4 flex items-center gap-4"
        style={{ background: `${manager.color}20` }}
      >
        <ManagerAvatar avatarPath={manager.avatar} managerId={manager.id} size="lg" />
        <div>
          <h3 className="font-bold text-white text-lg">{manager.name}</h3>
          <p className="text-sm text-slate-400 italic">&quot;{manager.quote}&quot;</p>
        </div>
      </div>

      {/* Match context */}
      <MatchContext match={match} />


      {/* THEATRICAL PHRASE - Typewriter when first shown, static when done */}
      <div className="px-6 py-6 text-center">
        <div className="text-4xl sm:text-5xl font-black text-white mb-4 tabular-nums">
          {prediction.homeScore} — {prediction.awayScore}
        </div>
        {showUserInput && !userPrediction ? (
          <TypewriterPhrase
            text={prediction.phrase}
            className="text-lg sm:text-xl font-medium leading-relaxed max-w-xl mx-auto block"
            wordDelayMs={70}
          />
        ) : (
          <blockquote className="text-lg sm:text-xl font-medium text-slate-200 leading-relaxed max-w-xl mx-auto">
            &ldquo;{prediction.phrase}&rdquo;
          </blockquote>
        )}
      </div>

      {/* Actions */}
      {showUserInput && !userPrediction && (
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onFollow}
            className="flex-1 py-3 px-4 rounded-xl font-bold bg-sca-accent text-sca-dark hover:bg-sca-accent/90 transition-colors"
          >
            ✓ FOLLOW — Predict {prediction.homeScore}–{prediction.awayScore}
          </button>
          <button
            onClick={onContradict}
            className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-sca-gold text-sca-gold hover:bg-sca-gold/20 transition-colors"
          >
            ✗ CONTRADICT — Enter my own score
          </button>
        </div>
      )}

      {userPrediction && (
        <div className="px-6 pb-6 py-4 bg-slate-800/50 rounded-b-xl">
          <div className="text-sm text-slate-400 mb-1">Your prediction</div>
          <div className="font-bold text-sca-accent text-xl">
            {userPrediction.homeScore} — {userPrediction.awayScore}
            {userPrediction.followed && (
              <span className="ml-2 text-sm text-slate-500">(followed manager)</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
