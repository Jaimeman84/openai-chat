# OpenAI Chat

A streaming chat interface built with Next.js and the OpenAI API. Supports multiple models including GPT-4.1, GPT-4o, GPT-5, and the o-series reasoning models.

## Setup

### 1. Add your OpenAI API key

Create a `.env.local` file in the root of the project:

```bash
cp .env.local.example .env.local
```

Or create it manually:

```
OPENAI_API_KEY=sk-...
```

> `.env.local` is excluded from git via `.gitignore` — never commit your API key.

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Streaming responses from the OpenAI API
- Model selector (GPT-5, GPT-4.1, GPT-4o, o-series reasoning models)
- Markdown rendering for assistant responses
- Dark mode support

## Deploy on Vercel

Set the `OPENAI_API_KEY` environment variable in your Vercel project settings, then deploy:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
