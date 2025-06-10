'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { ChatInterface } from '@/components/chat-interface'
import { DocumentIndexer } from '@/components/document-indexer'
import { SettingsDialog } from '@/components/settings-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings, LogOut, FileText } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexedDocs, setIndexedDocs] = useState<any[]>([])
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    // Load indexed documents from localStorage
    const stored = localStorage.getItem('indexedDocs')
    if (stored) {
      setIndexedDocs(JSON.parse(stored))
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              Chat with Google Docs
            </CardTitle>
            <CardDescription>
              Sign in with Google to access your documents and start chatting with AI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => signIn('google')} 
              className="w-full"
              size="lg"
            >
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Chat with Google Docs</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {indexedDocs.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Chat with Google Docs</CardTitle>
                <CardDescription>
                  First, let's index your Google Docs to enable AI-powered conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentIndexer
                  onIndexingStart={() => setIsIndexing(true)}
                  onIndexingComplete={(docs) => {
                    setIsIndexing(false)
                    setIndexedDocs(docs)
                    localStorage.setItem('indexedDocs', JSON.stringify(docs))
                  }}
                  isIndexing={isIndexing}
                />
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ChatInterface 
              indexedDocs={indexedDocs}
              onReindex={() => {
                setIndexedDocs([])
                localStorage.removeItem('indexedDocs')
              }}
            />
          </div>
        )}
      </main>

      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </div>
  )
}