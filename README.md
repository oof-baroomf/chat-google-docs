# Chat with Google Docs

An AI-powered chat interface that allows you to have conversations with your Google Docs using vector embeddings and large language models.

## Features

- 🔐 **Google OAuth2 Authentication** - Secure access to your Google Docs
- 📄 **Document Indexing** - Automatically indexes your Google Docs with vector embeddings
- 🤖 **Multi-Model Support** - Works with OpenAI GPT, Google Gemini, and Anthropic Claude models
- 💬 **Streaming Chat** - Real-time streaming responses from AI models
- 🔍 **Smart Search** - Uses vector similarity search to find relevant document content
- 📚 **Source Attribution** - Shows which documents were used to generate responses
- ⚙️ **Custom Models** - Add your own model configurations
- 💾 **Local Storage** - All data stored locally, no external database required

## Prerequisites

- Node.js 18+ and pnpm
- Google Cloud Console project with Docs and Drive API enabled
- API keys for at least one of: OpenAI, Google AI, or Anthropic

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd chat-google-docs
pnpm install
```

### 2. Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Docs API
   - Google Drive API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Add your production URL when deploying
7. Copy the Client ID and Client Secret

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
```env
# Google OAuth2 (Required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# NextAuth (Required)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_string

# API Keys (At least one required)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 4. Get API Keys

#### Google AI (Gemini)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add to `GEMINI_API_KEY` in `.env.local`

#### OpenAI
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new secret key
3. Add to `OPENAI_API_KEY` in `.env.local`

#### Anthropic
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Add to `ANTHROPIC_API_KEY` in `.env.local`

### 5. Run the Application

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Sign In**: Click "Sign in with Google" and authorize the application
2. **Index Documents**: Click "Start Indexing" to scan and index your Google Docs
3. **Chat**: Start asking questions about your documents
4. **Settings**: Use the settings dialog to add custom models or manage data

## How It Works

1. **Authentication**: Uses Google OAuth2 to access your Google Docs
2. **Indexing**: Scans your Google Docs and creates vector embeddings using Google's text-embedding-004 or OpenAI's text-embedding-3-small
3. **Query Processing**: When you ask a question:
   - Generates search keywords using an LLM
   - Performs vector similarity search to find relevant document sections
   - Provides context to the selected LLM for response generation
4. **Streaming Response**: The AI response streams in real-time with source attribution

## Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Authentication**: NextAuth.js with Google OAuth2
- **AI/ML**: LangChain for model abstraction, vector embeddings for search
- **Storage**: Browser localStorage (no external database)
- **APIs**: Google Docs API, Google Drive API, various LLM APIs

## Supported Models

The application dynamically fetches available models based on your API keys:

- **OpenAI**: GPT-4o, GPT-4o Mini, GPT-4 Turbo, GPT-3.5 Turbo
- **Google**: Gemini 1.5 Pro, Gemini 1.5 Flash, Gemini 1.0 Pro
- **Anthropic**: Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus

## Development

### Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   ├── chat/          # Chat endpoint
│   │   ├── models/        # Available models endpoint
│   │   └── index-docs/    # Document indexing endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # Context providers
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── chat-interface.tsx # Main chat interface
│   ├── document-indexer.tsx # Document indexing UI
│   └── settings-dialog.tsx # Settings modal
├── lib/                  # Utility functions
└── public/              # Static assets
```

### Key Technologies

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **LangChain**: LLM abstraction and vector operations
- **NextAuth.js**: Authentication
- **Google APIs**: Document access

## Deployment

1. Set up your production environment variables
2. Update `NEXTAUTH_URL` to your production URL
3. Add production URL to Google OAuth2 authorized redirect URIs
4. Deploy to your preferred platform (Vercel, Netlify, etc.)

## Troubleshooting

### Common Issues

1. **"Unauthorized" errors**: Check your Google OAuth2 setup and API keys
2. **No models available**: Ensure at least one API key is properly set
3. **Indexing fails**: Verify Google Docs and Drive API are enabled
4. **TypeScript errors**: Run `pnpm install` to ensure all dependencies are installed

### Debug Mode

Set `NODE_ENV=development` to see detailed error logs in the console.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Security

- All API keys should be kept secure and never committed to version control
- The application only requests read-only access to your Google Docs
- All data is stored locally in your browser
- No data is sent to external services except for AI model inference

## Support

For issues and questions, please open a GitHub issue with:
- Your environment details
- Steps to reproduce the issue
- Error messages (if any)
- Screenshots (if applicable)