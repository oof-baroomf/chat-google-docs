'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Loader2, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface DocumentIndexerProps {
  onIndexingStart: () => void
  onIndexingComplete: (docs: any[]) => void
  isIndexing: boolean
}

export function DocumentIndexer({ onIndexingStart, onIndexingComplete, isIndexing }: DocumentIndexerProps) {
  const [indexedCount, setIndexedCount] = useState(0)
  const { toast } = useToast()

  const handleIndexDocs = async () => {
    try {
      onIndexingStart()
      setIndexedCount(0)

      const response = await fetch('/api/index-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to index documents')
      }

      const data = await response.json()
      setIndexedCount(data.count)
      onIndexingComplete(data.documents)

      toast({
        title: "Indexing Complete",
        description: `Successfully indexed ${data.count} documents`,
      })

    } catch (error) {
      console.error('Error indexing documents:', error)
      toast({
        title: "Indexing Failed",
        description: "Failed to index your Google Docs. Please try again.",
        variant: "destructive",
      })
      onIndexingComplete([])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Index Your Google Docs</h3>
        <p className="text-muted-foreground mb-6">
          We'll scan your Google Docs and create vector embeddings to enable AI-powered search and chat.
        </p>
      </div>

      <Button 
        onClick={handleIndexDocs} 
        disabled={isIndexing}
        className="w-full"
        size="lg"
      >
        {isIndexing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Indexing Documents...
          </>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Start Indexing
          </>
        )}
      </Button>

      {isIndexing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Processing your Google Docs...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {indexedCount > 0 && !isIndexing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Successfully indexed {indexedCount} documents
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}