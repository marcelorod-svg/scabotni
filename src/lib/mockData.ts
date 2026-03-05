import { Match } from "./types";
import { worldCup2026Groups } from "@/data/footballDB";
import { getCountryCode } from "@/lib/teamFlags";

// World Cup 2026 Group Stage: 3 matches per group, 12 groups = 36 matches
// Each group plays matchday 1 over ~3 days, we spread them realistically

const groupMatchdays: Record<string, { date: string; time: string }[]> = {
  A: [
    { date: "2026-06-11", time: "18:00" },
    { date: "2026-06-12", time: "15:00" },
    { date: "2026-06-15", time: "18:00" },
  ],
  B: [
    { date: "2026-06-12", time: "18:00" },
    { date: "2026-06-13", time: "15:00" },
    { date: "2026-06-16", time: "18:00" },
  ],
  C: [
    { date: "2026-06-13", time: "18:00" },
    { date: "2026-06-14", time: "15:00" },
    { date: "2026-06-17", time: "18:00" },
  ],
  D: [
    { date: "2026-06-12", time: "21:00" },
    { date: "2026-06-13", time: "21:00" },
    { date: "2026-06-16", time: "21:00" },
  ],
  E: [
    { date: "2026-06-14", time: "18:00" },
    { date: "2026-06-15", time: "15:00" },
    { date: "2026-06-18", time: "18:00" },
  ],
  F: [
    { date: "2026-06-14", time: "21:00" },
    { date: "2026-06-15", time: "21:00" },
    { date: "2026-06-18", time: "21:00" },
  ],
  G: [
    { date: "2026-06-15", time: "18:00" },
    { date: "2026-06-16", time: "15:00" },
    { date: "2026-06-19", time: "18:00" },
  ],
  H: [
    { date: "2026-06-15", time: "21:00" },
    { date: "2026-06-16", time: "21:00" },
    { date: "2026-06-19", time: "21:00" },
  ],
  I: [
    { date: "2026-06-16", time: "18:00" },
    { date: "2026-06-17", time: "15:00" },
    { date: "2026-06-20", time: "18:00" },
  ],
  J: [
    { date: "2026-06-16", time: "21:00" },
    { date: "2026-06-17", time: "21:00" },
    { date: "2026-06-20", time: "21:00" },
  ],
  K: [
    { date: "2026-06-17", time: "18:00" },
    { date: "2026-06-18", time: "15:00" },
    { date: "2026-06-21", time: "18:00" },
  ],
  L: [
    { date: "2026-06-17", time: "21:00" },
    { date: "2026-06-18", time: "21:00" },
    { date: "2026-06-21", time: "21:00" },
  ],
};

function buildGroupMatches(
  groupKey: string,
  teams: readonly string[],
  venue: string
): Match[] {
  const slots = groupMatchdays[groupKey];
  // Matchday 1: team[0] vs team[1], team[2] vs team[3]
  // Matchday 2: team[0] vs team[2], team[1] vs team[3]
  // Matchday 3: team[0] vs team[3], team[1] vs team[2]
  const pairs: [number, number][] = [
    [0, 1],
    [2, 3],
    [0, 2],
    [1, 3],
    [0, 3],
    [1, 2],
  ];

  return pairs.map(([h, a], i) => {
    const slot = slots[Math.floor(i / 2)];
    const kickoff = `${slot.date}T${slot.time}:00`;
    const homeTeam = teams[h];
    const awayTeam = teams[a];
    return {
      id: `wc26-${groupKey}-${i + 1}`,
      homeTeam,
      awayTeam,
      homeCountryCode: getCountryCode(homeTeam),
      awayCountryCode: getCountryCode(awayTeam),
      homeScore: undefined,
      awayScore: undefined,
      status: "PENDING" as const,
      kickoff,
      league: `FIFA World Cup 2026 · Group ${groupKey} · ${venue}`,
    };
  });
}

export const mockMatches: Match[] = Object.entries(worldCup2026Groups).flatMap(
  ([groupKey, group]) =>
    buildGroupMatches(groupKey, group.teams, group.venue)
);
