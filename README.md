# Chat with Google Docs

An AI-powered chat interface that allows you to have conversations with your Google Docs using vector embeddings and large language models.

## Features

- **Google OAuth2 Authentication**: Securely access your Google Docs.
- **Document Indexing**: Automatically index your Google Docs using vector embeddings.
- **Multi-Model Support**: Works with OpenAI GPT, Google Gemini, and Anthropic Claude models.
- **Streaming Chat**: Get real-time streaming responses from AI models.
- **Smart Search**: Uses vector similarity search to find relevant document content.
- **Source Attribution**: See which documents were used to generate responses.
- **Custom Models**: Add your own model configurations.
- **Local Storage**: All data is stored locally in your browser; no external database required.

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

The application dynamically fetches available models based on your API keys, so it supports anything supported by the provider at any time.

## Deployment

To deploy this application, follow these steps:

1.  Set up your production environment variables in a `.env.local` file.
2.  Update `NEXTAUTH_URL` to your application's production URL.
3.  Add the production URL to your Google OAuth2 authorized redirect URIs.
4.  Deploy the application to your preferred platform (e.g., Vercel, Netlify).

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
