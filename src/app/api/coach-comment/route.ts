// src/app/api/coach-comment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const {
      coachSystemPrompt,
      coachSystemPrompt2,
      coachName,
      coachName2,
      teamAName,
      teamBName,
      teamAStats,
      teamBStats,
      h2hContext,
      resultA,
      resultB,
      probA,
      probB,
      probDraw,
      mode,
    } = await req.json()

    const statsLine = (
  name: string,
  s: {
    played: number
    won: number
    drawn: number
    lost: number
    goals_for: number
    goals_against: number
    titles: number
  } | null
) => {
  if (!s) return `${name}: sin estadísticas`
  const gpj = s.played > 0 ? (s.goals_for / s.played).toFixed(2) : '0'
  return `${name}: ${s.played} PJ, ${s.won}V ${s.drawn}E ${s.lost}D, ${s.goals_for} goles (${gpj}/PJ), ${s.goals_against} en contra, ${s.titles} título(s)`
}


    const statsBlock = [statsLine(teamAName, teamAStats), statsLine(teamBName, teamBStats)].join('\n')
    const h2hBlock = h2hContext
      ? `\nHISTORIAL EN MUNDIALES:\n${h2hContext}`
      : `\n${teamAName} y ${teamBName} nunca se enfrentaron en un Mundial.`
    const simBlock = resultA != null
      ? `\nRESULTADO SIMULADO: ${teamAName} ${resultA}–${resultB} ${teamBName} | ${teamAName} ${probA}% / Empate ${probDraw}% / ${teamBName} ${probB}%`
      : ''

    if (mode === 'debate' && coachSystemPrompt2) {
      const prompt = `PARTIDO: ${teamAName} vs ${teamBName}\n\nESTADÍSTICAS:\n${statsBlock}${h2hBlock}${simBlock}\n\nFormato ESTRICTO sin markdown:\n${coachName}: [máx 2 oraciones con su personalidad y los datos]\n${coachName2}: [respuesta directa, máx 2 oraciones]`.trim()

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 320,
        system: `Moderador de debate deportivo. Personalidades:\n- ${coachName}: ${coachSystemPrompt}\n- ${coachName2}: ${coachSystemPrompt2}\nEscribí cada línea en el idioma/estilo de cada DT.`,
        messages: [{ role: 'user', content: prompt }],
      })

      const raw = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('')
      const lines = raw.split('\n').filter(l => l.trim())
      const line1 = lines.find(l => l.startsWith(coachName + ':'))?.replace(coachName + ':', '').trim() ?? raw
      const line2 = lines.find(l => l.startsWith(coachName2 + ':'))?.replace(coachName2 + ':', '').trim() ?? '...'

      return NextResponse.json({ comment: line1, comment2: line2 })
    }

    const prompt = `PARTIDO: ${teamAName} vs ${teamBName}\n\nESTADÍSTICAS:\n${statsBlock}${h2hBlock}${simBlock}\n\n${mode === 'simulation' ? 'Reaccioná al resultado con tu personalidad. Máx 2 oraciones.' : 'Analizá este enfrentamiento con los datos. Máx 2 oraciones.'}`.trim()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      system: coachSystemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const comment = response.content.filter((b): b is Anthropic.TextBlock => b.type === 'text').map(b => b.text).join('')
    return NextResponse.json({ comment })

  } catch (err) {
    console.error('Coach comment error:', err)
    return NextResponse.json({ error: 'Error generando comentario' }, { status: 500 })
  }
}
