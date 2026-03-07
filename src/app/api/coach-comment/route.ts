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
      teamAName,
      teamBName,
      teamAYear,
      teamBYear,
      resultA,
      resultB,
      probA,
      probB,
      probDraw,
      formationA,
      formationB,
      notesA,
      notesB,
    } = await req.json()

    const userPrompt = `
Contexto del partido simulado:
- ${teamAName} ${teamAYear} (${formationA}) vs ${teamBName} ${teamBYear} (${formationB})
- Resultado: ${teamAName} ${resultA} – ${resultB} ${teamBName}
- Probabilidades: ${teamAName} ${probA}% | Empate ${probDraw}% | ${teamBName} ${probB}%
- Nota histórica ${teamAName}: ${notesA}
- Nota histórica ${teamBName}: ${notesB}

Dá tu reacción al resultado. Mantené tu personalidad. Máximo 2 oraciones.
    `.trim()

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 180,
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
