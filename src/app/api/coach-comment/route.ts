// src/app/api/coach-comment/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  try {
    const {
      coachSystemPrompt,
      coachSystemPrompt2,      // segundo DT en modo debate
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
      mode,                    // "simulation" | "h2h_analysis" | "debate"
    } = await req.json()

    // ── Construir contexto de stats ────────────────────────────
    function statsToText(name: string, stats: { played: number; won: number; drawn: number; lost: number; goals_for: number; goals_against: number; titles: number } | null) {
      if (!stats) return `${name}: sin datos`
      const gxpj = stats.played > 0 ? (stats.goals_for / stats.played).toFixed(2) : '0'
      return `${name}: ${stats.played} PJ, ${stats.won}V ${stats.drawn}E ${stats.lost}D, ${stats.goals_for} goles a favor (${gxpj}/PJ), ${stats.goals_against} en contra, ${stats.titles} título(s) mundial(es)`
    }

    const statsContext = [
      statsToText(teamAName, teamAStats),
      statsToText(teamBName, teamBStats),
    ].join('\n')

    const h2hLine = h2hContext
      ? `\nHISTORIAL DIRECTO EN MUNDIALES:\n${h2hContext}`
      : `\nNo hay antecedentes entre ${teamAName} y ${teamBName} en Mundiales — sería su primer cruce.`

    const simLine = (resultA !== null && resultA !== undefined)
      ? `\nRESULTADO SIMULADO: ${teamAName} ${resultA} – ${resultB} ${teamBName} | Probabilidades: ${teamAName} ${probA}% | Empate ${probDraw}% | ${teamBName} ${probB}%`
      : ''

    // ── MODO DEBATE: dos DTs dialogan ─────────────────────────
    if (mode === 'debate' && coachSystemPrompt2) {
      const debatePrompt = `
PARTIDO: ${teamAName} vs ${teamBName}

ESTADÍSTICAS HISTÓRICAS EN MUNDIALES:
${statsContext}
${h2hLine}
${simLine}

Dos DTs están debatiendo sobre este partido: ${coachName} y ${coachName2}.
Generá UN intercambio de debate entre ellos. Formato ESTRICTO:
${coachName}: [frase — máximo 2 oraciones, con su personalidad]
${coachName2}: [respuesta directa a lo anterior — máximo 2 oraciones, con su personalidad]

Que debatan sobre quién gana y por qué. Usá los datos del historial si existen.
      `.trim()

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: `Sos un moderador de debate deportivo. Conocés a la perfección la personalidad de estos DTs:\n- ${coachName}: ${coachSystemPrompt}\n- ${coachName2}: ${coachSystemPrompt2}\nEscribí el debate en el idioma/estilo de cada uno.`,
        messages: [{ role: 'user', content: debatePrompt }],
      })

      const raw = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map(b => b.text)
        .join('')

      // Parsear las dos líneas del debate
      const lines = raw.split('\n').filter(l => l.trim())
      const line1 = lines.find(l => l.startsWith(coachName + ':'))?.replace(coachName + ':', '').trim() ?? raw
      const line2 = lines.find(l => l.startsWith(coachName2 + ':'))?.replace(coachName2 + ':', '').trim() ?? ''

      return NextResponse.json({ comment: line1, comment2: line2 })
    }

    // ── MODO INDIVIDUAL: un solo DT opina ────────────────────
    const userPrompt = `
PARTIDO: ${teamAName} vs ${teamBName}

ESTADÍSTICAS HISTÓRICAS EN MUNDIALES:
${statsContext}
${h2hLine}
${simLine}

${mode === 'simulation'
  ? 'Reaccioná al resultado simulado con tu personalidad. Máximo 2 oraciones.'
  : 'Analizá este enfrentamiento usando los datos históricos disponibles. Máximo 2 oraciones.'
}
    `.trim()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      system: coachSystemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const comment = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('')

    return NextResponse.json({ comment })

  } catch (err) {
    console.error('Coach comment error:', err)
    return NextResponse.json({ error: 'Error generando comentario' }, { status: 500 })
  }
}
