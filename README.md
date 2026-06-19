# Summify 🎙️✨

Summify is an AI-powered meeting intelligence platform designed to transform raw meeting audio or YouTube videos into structured, actionable insights. By leveraging localized speech-to-text modeling and intelligent retrieval-augmented generation (RAG), Summify lets you extract the core value of any sync and chat directly with your meeting history—while prioritizing local data privacy.

## 🚀 Key Features

- **🔒 Privacy-First Architecture**: High-fidelity audio transcription runs completely locally via OpenAI's Whisper model. Your raw voice recordings never leave your machine.
- **📋 Automated Intelligence Extraction**: Instantly distills multi-hour syncs down into cohesive summaries, discrete action items, key decisions, and unaddressed open questions.
- **💬 RAG-Powered Conversational Engine**: Automatically indexes your transcripts into a local vector database (ChromaDB) so you can seamlessly query context-specific questions long after the meeting ends.
- **🌐 Dual-Ingress Pipeline**: Seamlessly feeds into the pipeline via direct local file uploads (`.mp3`/`.wav`) or deep web scraping extraction of YouTube media URLs via `yt-dlp`.
- **🎨 Ultra-Modern Interface**: Engineered with an interactive, animated fluid canvas backdrop in Next.js 16 and styled beautifully with Tailwind CSS.

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript
- **Backend Service**: FastAPI, Uvicorn, Python
- **AI / ML Pipeline**: OpenAI Whisper (Local Speech-to-Text), LangChain, Mistral AI, ChromaDB (Vector Store), Sentence-Transformers
- **Media Utilities**: FFmpeg, `yt-dlp`