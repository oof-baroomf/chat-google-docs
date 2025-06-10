'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Bot, User, RefreshCw, Settings } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: string[]
}

interface ChatInterfaceProps {
  indexedDocs: any[]
  onReindex: () => void
}

interface ModelInfo {
  id: string
  name: string
  provider: 'openai' | 'google' | 'anthropic'
  available: boolean
}

export function ChatInterface({ indexedDocs, onReindex }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState('')
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load chat history from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models')
        if (response.ok) {
          const data = await response.json()
          setAvailableModels(data.models)
          if (data.models.length > 0 && !selectedModel) {
            setSelectedModel(data.models[0].id)
          }
        }
      } catch (error) {
        console.error('Error fetching models:', error)
      }
    }
    fetchModels()
  }, [selectedModel])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !selectedModel) return

    const userMessage: ChatMessage = { role: 'user', content: input.trim() }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          history: messages,
          model: selectedModel,
          indexedDocs: indexedDocs
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      let assistantMessage: ChatMessage = { role: 'assistant', content: '', sources: [] }
      setMessages(prev => [...prev, assistantMessage])

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage.content += parsed.content
                if (parsed.sources) {
                  assistantMessage.sources = parsed.sources
                }
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = { ...assistantMessage }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignore parsing errors for streaming
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      // Remove the failed assistant message
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem('chatHistory')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with Your Documents
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={clearChat}>
              Clear
            </Button>
            <Button variant="outline" size="sm" onClick={onReindex}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation about your documents!</p>
                <p className="text-sm mt-2">
                  I can help you find information, summarize content, and answer questions about your Google Docs.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    message.role === 'user' ? 'user-message' : 'assistant-message'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <User className="h-6 w-6" />
                      ) : (
                        <Bot className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="prose prose-sm max-w-none">
                        {message.content}
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {message.sources.map((source, idx) => (
                            <span key={idx} className="source-pill">
                              {source}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="chat-message assistant-message">
                <div className="flex items-start gap-3">
                  <Bot className="h-6 w-6 flex-shrink-0" />
                  <div className="loading-dots">
                    <div></div>
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documents..."
              disabled={isLoading || !selectedModel}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim() || !selectedModel}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}