import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

interface ModelInfo {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic'
  available: boolean
}

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const models: ModelInfo[] = []

    // OpenAI Models
    if (process.env.OPENAI_API_KEY) {
      models.push(
        { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', available: true },
        { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', available: true },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', available: true },
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', available: true }
      )
    }

    // Google Models
    if (process.env.GEMINI_API_KEY) {
      models.push(
        { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', available: true },
        { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', available: true },
        { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro', provider: 'google', available: true }
      )
    }

    // Anthropic Models
    if (process.env.ANTHROPIC_API_KEY) {
      models.push(
        { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', available: true },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', available: true },
        { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', provider: 'anthropic', available: true }
      )
    }

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}