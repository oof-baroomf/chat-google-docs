import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

interface ModelInfo {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic'
  available: boolean
}

interface OpenAIModel {
  id: string;
}

interface GoogleModel {
  name: string;
  displayName: string;
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
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch OpenAI models')
        const { data } = await response.json()
        const openAIModels = data
          .filter((model: OpenAIModel) => model.id.includes('gpt'))
          .map((model: OpenAIModel) => ({
            id: model.id,
            name: model.id,
            provider: 'openai',
            available: true
          }))
        models.push(...openAIModels)
      } catch (error) {
        console.error("Could not fetch OpenAI models, using fallback list.", error)
        models.push(
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', available: true },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', available: true },
          { id: 'o4-mini', name: 'o4-mini', provider: 'openai', available: true },
          { id: 'o3', name: 'o3', provider: 'openai', available: true }
        )
      }
    }

    // Google Models
    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: {
            'x-goog-api-key': `${process.env.GEMINI_API_KEY}`
          }
        })
        if (!response.ok) throw new Error('Failed to fetch Google models')
        const { models: googleModels } = await response.json()
        const geminiModels = googleModels
          .filter((model: GoogleModel) => model.name.includes('gemini'))
          .map((model: GoogleModel) => ({
            id: model.name,
            name: model.displayName,
            provider: 'google',
            available: true
          }))
        models.push(...geminiModels)
      } catch (error) {
        console.error("Could not fetch Google models, using fallback list.", error)
        models.push(
          { id: 'gemini-2.5-pro-preview-06-05', name: 'Gemini 2.5 Pro (06-05)', provider: 'google', available: true },
          { id: 'gemini-2.5-flash-preview-05-20', name: 'Gemini 2.5 Flash', provider: 'google', available: true }
        )
      }
    }

    // Anthropic Models
    if (process.env.ANTHROPIC_API_KEY) {
      // Anthropic does not have a public models API, so we use a hardcoded list.
      // This list is based on the official documentation and can be updated manually.
      models.push(
        { id: 'claude-opus-4-20250514', name: 'Claude Opus 4', provider: 'anthropic', available: true },
        { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', provider: 'anthropic', available: true },
        { id: 'claude-3-7-sonnet-20250219', name: 'Claude Sonnet 3.7', provider: 'anthropic', available: true },
        { id: 'claude-3-5-haiku-20241022', name: 'Claude Haiku 3.5', provider: 'anthropic', available: true }
      )
    }

    return NextResponse.json({ models })
  } catch (error) {
    console.error('Models API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}