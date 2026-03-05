"use client";

import Image from "next/image";
import { Match, MatchStatus } from "@/lib/types";
import { getCountryCode } from "@/lib/teamFlags";

interface MatchListProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
  selectedMatchId?: string;
}

function StatusBadge({ status }: { status: MatchStatus }) {
  const styles = {
    PENDING: "bg-sca-muted/30 text-slate-400 border-slate-600",
    LIVE: "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse",
    FINISHED: "bg-sca-accent/20 text-sca-accent border-sca-accent/50",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function TeamFlag({
  teamName,
  countryCode,
  reverse = false,
}: {
  teamName: string;
  countryCode?: string;
  reverse?: boolean;
}) {
  const code = countryCode ?? getCountryCode(teamName);
  const flag = code ? (
    <span className="flex-shrink-0 w-6 h-4 rounded overflow-hidden border border-slate-600/50 ring-1 ring-slate-700/50">
      <Image
        src={`https://flagcdn.com/${code}.svg`}
        alt=""
        width={24}
        height={16}
        className="object-cover w-full h-full"
      />
    </span>
  ) : null;
  const name = <span className="font-semibold text-white truncate">{teamName}</span>;
  if (!code) return name;
  return (
    <span className={`flex items-center gap-2 min-w-0 ${reverse ? "flex-row-reverse" : ""}`}>
      {flag}
      {name}
    </span>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDateHeader(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function groupMatchesByDate(matches: Match[]): { date: string; matches: Match[] }[] {
  const map = new Map<string, Match[]>();
  for (const match of matches) {
    const date = match.kickoff.slice(0, 10); // "YYYY-MM-DD"
    if (!map.has(date)) map.set(date, []);
    map.get(date)!.push(match);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, matches]) => ({ date, matches }));
}

export default function MatchList({
  matches,
  onSelectMatch,
  selectedMatchId,
}: MatchListProps) {
  const grouped = groupMatchesByDate(matches);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          FIFA World Cup 2026 · Group Stage
        </h2>
        <span className="text-xs text-slate-600">{matches.length} matches</span>
      </div>

      {grouped.map(({ date, matches: dayMatches }) => (
        <div key={date}>
          {/* Date header */}
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-sca-accent uppercase tracking-widest">
              {formatDateHeader(date)}
            </span>
            <div className="flex-1 h-px bg-slate-700/50" />
          </div>

          {/* Matches for this day */}
          <div className="space-y-2">
            {dayMatches.map((match) => {
              const isSelected = selectedMatchId === match.id;
              return (
                <button
                  key={match.id}
                  onClick={() => onSelectMatch(match)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover:border-sca-accent/50 ${
                    isSelected
                      ? "border-sca-accent bg-sca-accent/10"
                      : "border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                          {match.league}
                        </span>
                        <StatusBadge status={match.status} />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                          <TeamFlag
                            teamName={match.homeTeam}
                            countryCode={match.homeCountryCode}
                          />
                          {match.status !== "PENDING" && (
                            <span className="text-lg font-bold text-sca-accent tabular-nums">
                              {match.homeScore ?? "—"}
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-sm flex-shrink-0">
                          {match.status === "PENDING"
                            ? formatTime(match.kickoff)
                            : "—"}
                        </span>
                        <div className="flex-1 flex items-center gap-2 justify-end">
                          {match.status !== "PENDING" && (
                            <span className="text-lg font-bold text-sca-accent tabular-nums">
                              {match.awayScore ?? "—"}
                            </span>
                          )}
                          <TeamFlag
                            teamName={match.awayTeam}
                            countryCode={match.awayCountryCode}
                            reverse
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-slate-500 text-xl">›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
