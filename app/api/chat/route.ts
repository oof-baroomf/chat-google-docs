import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { ChatOpenAI } from '@langchain/openai'
import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { ChatAnthropic } from '@langchain/anthropic'
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { Document } from 'langchain/document'

export const dynamic = 'force-dynamic'
interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

interface ChatRequest {
  message: string
  history: ChatMessage[]
  model: string
  indexedDocs: {
    id: string;
    title: string;
    content: string;
    url: string;
    lastModified: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, history, model, indexedDocs }: ChatRequest = await req.json()

    // Initialize embeddings based on available API keys
    let embeddings
    if (process.env.GEMINI_API_KEY) {
      embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        modelName: 'text-embedding-004'
      })
    } else if (process.env.OPENAI_API_KEY) {
      embeddings = new OpenAIEmbeddings({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'text-embedding-3-small'
      })
    } else {
      return NextResponse.json({ error: 'No embedding API key available' }, { status: 500 })
    }

    // Create vector store from indexed documents
    const documents = indexedDocs.map(doc => new Document({
      pageContent: doc.content,
      metadata: { 
        title: doc.title, 
        id: doc.id,
        url: doc.url 
      }
    }))

    const vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings)

    // Generate search keywords using LLM
    const keywordLLM = getModelInstance('gemini-1.5-flash')
    const keywordPrompt = `Based on this user question, generate 3-5 relevant keywords for searching documents:
Question: ${message}

Return only the keywords separated by commas, no other text.`

    const keywordResponse = await keywordLLM.invoke(keywordPrompt)
    const keywords = keywordResponse.content.toString().split(',').map(k => k.trim())

    // Search for relevant documents using both the original query and keywords
    const searchQueries = [message, ...keywords]
    const allResults = []

    for (const query of searchQueries) {
      const results = await vectorStore.similaritySearch(query, 3)
      allResults.push(...results)
    }

    // Remove duplicates and limit context
    const uniqueResults = allResults.filter((doc, index, self) => 
      index === self.findIndex(d => d.metadata.id === doc.metadata.id)
    ).slice(0, 8)

    // Prepare context
    const context = uniqueResults.map(doc => 
      `Document: ${doc.metadata.title}\nContent: ${doc.pageContent}`
    ).join('\n\n')

    // Initialize the selected model
    const llm = getModelInstance(model)

    // Create the prompt
    const systemPrompt = `You are a helpful AI assistant that answers questions based on Google Docs content. 
Use the provided context to answer the user's question. If you reference specific information, 
include the document title in your response using this format: [Source: Document Title].

Context:
${context}

Previous conversation:
${history.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Current question: ${message}

Please provide a helpful and accurate response based on the context provided.`

    // Stream the response
    const stream = await llm.stream(systemPrompt)
    
    const encoder = new TextEncoder()
    const sources = uniqueResults.map(doc => doc.metadata.title)

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.content
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              content: text, 
              sources: sources.length > 0 ? sources : undefined 
            })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      }
    })

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function getModelInstance(modelName: string) {
  if (modelName.includes('gpt') && process.env.OPENAI_API_KEY) {
    return new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: modelName,
      streaming: true,
      temperature: 0.7
    })
  } else if (modelName.includes('claude') && process.env.ANTHROPIC_API_KEY) {
    return new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: modelName,
      streaming: true,
      temperature: 0.7
    })
  } else if (process.env.GEMINI_API_KEY) {
    return new ChatGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY,
      modelName: modelName.includes('gemini') ? modelName : 'gemini-1.5-flash',
      streaming: true,
      temperature: 0.7
    })
  }
  
  throw new Error('No suitable model available')
}