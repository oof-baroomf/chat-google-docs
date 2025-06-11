import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google, docs_v1 } from 'googleapis'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'
interface IndexedDoc {
  id: string
  title: string
  content: string
  url: string
  lastModified: string
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize Google APIs
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: session.accessToken })

    const drive = google.drive({ version: 'v3', auth })
    const docs = google.docs({ version: 'v1', auth })

    // Get all Google Docs
    const driveResponse = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document' and trashed=false",
      fields: 'files(id,name,modifiedTime,webViewLink)',
      pageSize: 100
    })

    const files = driveResponse.data.files || []

    // Process documents in parallel
    const processingPromises = files.map(async (file) => {
      try {
        if (!file.id) return null

        // Get document content
        const docResponse = await docs.documents.get({
          documentId: file.id
        })

        const document = docResponse.data
        let content = ''

        // Extract text content from document structure
        if (document.body?.content) {
          content = extractTextFromContent(document.body.content)
        }

        // Skip empty documents
        if (content.trim().length === 0) return null

        return {
          id: file.id,
          title: file.name || 'Untitled Document',
          content: content.trim(),
          url: file.webViewLink || `https://docs.google.com/document/d/${file.id}/edit`,
          lastModified: file.modifiedTime || new Date().toISOString()
        }
      } catch (docError) {
        console.error(`Error processing document ${file.id}:`, docError)
        return null // Continue with other documents
      }
    })

    const results = await Promise.all(processingPromises)
    const indexedDocs = results.filter((doc): doc is IndexedDoc => doc !== null)

    return NextResponse.json({ 
      documents: indexedDocs,
      count: indexedDocs.length 
    })

  } catch (error) {
    console.error('Index docs API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function extractTextFromContent(content: docs_v1.Schema$StructuralElement[]): string {
  let text = ''

  for (const element of content) {
    if (element.paragraph) {
      const paragraph = element.paragraph
      if (paragraph.elements) {
        for (const elem of paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            text += elem.textRun.content
          }
        }
      }
      text += '\n'
    } else if (element.table) {
      // Handle tables
      const table = element.table
      if (table.tableRows) {
        for (const row of table.tableRows) {
          if (row.tableCells) {
            for (const cell of row.tableCells) {
              if (cell.content) {
                text += extractTextFromContent(cell.content) + '\t'
              }
            }
          }
          text += '\n'
        }
      }
    } else if (element.tableOfContents) {
      // Handle table of contents
      if (element.tableOfContents.content) {
        text += extractTextFromContent(element.tableOfContents.content)
      }
    }
  }

  return text
}