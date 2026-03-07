// src/app/api/simulate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { saveSimulation } from '@/lib/supabase'
import type { DBHistoricTeam } from '@/lib/supabase'

// ─── Lógica de simulación probabilística ─────────────────────
// Sin ML. Basada en stats reales del torneo de cada equipo histórico.

function calculateWinProbability(teamA: DBHistoricTeam, teamB: DBHistoricTeam) {
  // Score ofensivo (xG + goles reales ponderados)
  const offA = (teamA.xg_per_match * 0.6) + (teamA.goals_per_match * 0.4)
  const offB = (teamB.xg_per_match * 0.6) + (teamB.goals_per_match * 0.4)

  // Score defensivo (inverso de goles concedidos por partido)
  const defA = 1 / (1 + teamA.goals_conceded / Math.max(teamA.matches_played, 1))
  const defB = 1 / (1 + teamB.goals_conceded / Math.max(teamB.matches_played, 1))

  // Score de posesión (equipos con más posesión controlan mejor el partido)
  const posA = teamA.avg_possession / 100
  const posB = teamB.avg_possession / 100

  // Score general ponderado
  const scoreA = (offA * 0.45) + (defA * 0.35) + (posA * 0.20)
  const scoreB = (offB * 0.45) + (defB * 0.35) + (posB * 0.20)

  const total = scoreA + scoreB
  const rawA = scoreA / total
  const rawB = scoreB / total

  // Ajuste: en fútbol siempre hay ~25-30% de probabilidad de empate
  const drawBase = 0.27
  const probA = rawA * (1 - drawBase)
  const probB = rawB * (1 - drawBase)
  const probDraw = drawBase

  // Simular resultado concreto basado en xG
  const expectedGoalsA = teamA.xg_per_match * (0.8 + Math.random() * 0.4)
  const expectedGoalsB = teamB.xg_per_match * (0.8 + Math.random() * 0.4)

  const resultA = Math.round(expectedGoalsA * (scoreA / (scoreA + scoreB)) * 1.5)
  const resultB = Math.round(expectedGoalsB * (scoreB / (scoreA + scoreB)) * 1.5)

  return {
    probA: Math.round(probA * 100 * 10) / 10,
    probB: Math.round(probB * 100 * 10) / 10,
    probDraw: Math.round(probDraw * 100 * 10) / 10,
    resultA: Math.max(0, resultA),
    resultB: Math.max(0, resultB),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { teamA, teamB, historicTeamA, historicTeamB } = await req.json()

    if (!historicTeamA || !historicTeamB) {
      return NextResponse.json({ error: 'Se requieren los equipos históricos' }, { status: 400 })
    }

    const result = calculateWinProbability(historicTeamA, historicTeamB)

    const simulationData = {
      teamA: { id: teamA, historic: historicTeamA },
      teamB: { id: teamB, historic: historicTeamB },
      ...result,
    }

    // Guardar en Supabase
    const simulationId = await saveSimulation({
      team_a_id: teamA,
      team_b_id: teamB,
      historic_team_a: historicTeamA.id,
      historic_team_b: historicTeamB.id,
      result_a: result.resultA,
      result_b: result.resultB,
      prob_a_win: result.probA,
      prob_draw: result.probDraw,
      prob_b_win: result.probB,
      simulation_data: simulationData,
    })

    return NextResponse.json({ simulationId, ...result })
  } catch (err) {
    console.error('Simulation error:', err)
    return NextResponse.json({ error: 'Error en simulación' }, { status: 500 })
  }
}
