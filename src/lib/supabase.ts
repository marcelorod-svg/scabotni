// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Tipos ────────────────────────────────────────────────────

export interface DBTeam {
  id: string
  name: string
  flag_code: string
  confederation: string
  participations: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  titles: number
  best_position: string
  first_year: number
}

export interface DBHistoricTeam {
  id: string
  team_id: string
  year: number
  role: 'champion' | 'runner_up'
  coach: string
  formation: string
  tournament_notes: string
  goals_scored: number
  goals_conceded: number
  matches_played: number
  avg_possession: number
  goals_per_match: number
  shots_per_match: number
  xg_per_match: number
  pass_accuracy: number
  defensive_actions: number
  pressing_intensity: number
  // join
  teams?: DBTeam
}

export interface DBH2HRecord {
  id: number
  team_a_id: string
  team_b_id: string
  played: number
  team_a_wins: number
  team_b_wins: number
  draws: number
  team_a_goals: number
  team_b_goals: number
}

export interface DBH2HMatch {
  id: number
  team_a_id: string
  team_b_id: string
  team_a_goals: number
  team_b_goals: number
  year: number
  stage: string
  tournament: string
  notable: boolean
}

export interface DBCoachPersonality {
  id: string
  name: string
  role: string
  style: string
  language: string
  system_prompt: string
  avatar_file: string
  initials: string
}

export interface DBSimulation {
  id: string
  team_a_id: string
  team_b_id: string
  historic_team_a: string | null
  historic_team_b: string | null
  result_a: number
  result_b: number
  prob_a_win: number
  prob_draw: number
  prob_b_win: number
  simulation_data: Record<string, unknown>
  created_at: string
}

// ─── Queries ─────────────────────────────────────────────────

export async function getTeams(): Promise<DBTeam[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('name')
  if (error) throw error
  return data
}

export async function getHistoricTeams(): Promise<DBHistoricTeam[]> {
  const { data, error } = await supabase
    .from('historic_teams')
    .select('*, teams(name, flag_code, confederation)')
    .order('year', { ascending: false })
  if (error) throw error
  return data
}

export async function getH2HRecord(
  teamAId: string,
  teamBId: string
): Promise<{ record: DBH2HRecord | null; matches: DBH2HMatch[] }> {
  // Normalizar orden alfabético (el schema garantiza team_a < team_b)
  const [a, b] = [teamAId, teamBId].sort()

  const [{ data: record }, { data: matches }] = await Promise.all([
    supabase
      .from('h2h_records')
      .select('*')
      .eq('team_a_id', a)
      .eq('team_b_id', b)
      .maybeSingle(),
    supabase
      .from('h2h_matches')
      .select('*')
      .or(`and(team_a_id.eq.${a},team_b_id.eq.${b}),and(team_a_id.eq.${b},team_b_id.eq.${a})`)
      .order('year', { ascending: false })
      .limit(10),
  ])

  return { record: record ?? null, matches: matches ?? [] }
}

export async function getCoachPersonalities(): Promise<DBCoachPersonality[]> {
  const { data, error } = await supabase
    .from('coach_personalities')
    .select('*')
    .eq('active', true)
  if (error) throw error
  return data
}

export async function saveSimulation(sim: Omit<DBSimulation, 'id' | 'created_at'>): Promise<string> {
  const { data, error } = await supabase
    .from('simulations')
    .insert(sim)
    .select('id')
    .single()
  if (error) throw error
  return data.id
}

export async function saveVote(
  simulationId: string,
  userToken: string,
  vote: 'team_a' | 'team_b' | 'draw'
): Promise<void> {
  const { error } = await supabase
    .from('simulation_votes')
    .upsert({ simulation_id: simulationId, user_token: userToken, vote })
  if (error) throw error
}

export async function getVotes(simulationId: string) {
  const { data, error } = await supabase
    .from('simulation_votes')
    .select('vote')
    .eq('simulation_id', simulationId)
  if (error) throw error

  const counts = { team_a: 0, team_b: 0, draw: 0 }
  data?.forEach(v => { counts[v.vote as keyof typeof counts]++ })
  const total = data?.length ?? 0

  return {
    total,
    team_a: total ? Math.round((counts.team_a / total) * 100) : 0,
    team_b: total ? Math.round((counts.team_b / total) * 100) : 0,
    draw:   total ? Math.round((counts.draw   / total) * 100) : 0,
  }
}
