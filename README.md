# Summify 🎙️

AI-powered meeting summarizer. Paste a YouTube link or upload an audio file — get a summary, action items, key decisions, and a chat interface to ask questions about the meeting.

**Stack:** Next.js 14 (frontend) · FastAPI + Whisper + Mistral + ChromaDB (backend)

---

## Project Structure

```
Summify/
├── backend/          # FastAPI Python server
│   ├── api.py
│   ├── main.py
│   ├── Requirements.txt
│   ├── .env          # ← never committed
│   ├── .env.example  # ← committed (no real keys)
│   ├── core/
│   └── utils/
└── frontend/         # Next.js app
    ├── src/app/
    │   ├── page.tsx        # Landing page
    │   ├── analyze/        # Input form
    │   ├── results/        # Results + chat
    │   └── lib/api.ts      # API client
    └── package.json
```

---

## 1 · Push to GitHub

Run these commands from inside the `Summify/` folder:

```bash
# One-time setup
git init
git add .
git commit -m "Initial commit"

# Create a repo on github.com, then:
git remote add origin https://github.com/shivam-mishra-music/summify.git
git branch -M main
git push -u origin main
```

> ⚠️ Your `.env` file is in `.gitignore` — it will NOT be pushed. Your API keys stay safe.

---

## 2 · Deploy Backend → Render.com (free)

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Set these fields:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r Requirements.txt`
   - **Start Command:** `uvicorn api:app --host 0.0.0.0 --port $PORT`
   - **Runtime:** Python 3
4. Go to **Environment** tab and add your secrets:
   ```
   MISTRAL_API_KEY     = your_key
   SARVAM_API_KEY      = your_key
   SARVAM_STT_MODEL    = saaras:v2.5
   WHISPER_MODEL       = base
   FRONTEND_URL        = https://your-app.vercel.app   ← add after step 3
   ```
5. Click **Deploy** — Render gives you a URL like `https://summify-backend.onrender.com`

---

## 3 · Deploy Frontend → Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add this **Environment Variable**:
   ```
   NEXT_PUBLIC_API_URL = https://summify-backend.onrender.com
   ```
4. Click **Deploy** — Vercel gives you a URL like `https://summify.vercel.app`
5. Go back to Render → Environment → set `FRONTEND_URL` to your Vercel URL → **Save** (triggers a redeploy)

---

## Local Development

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r Requirements.txt
cp .env.example .env             # then fill in real keys
uvicorn api:app --reload
# Running at http://localhost:8000
```

**Frontend:**
```bash
cd frontend
npm install
# Create frontend/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# Running at http://localhost:3000
```

**System dependency — FFmpeg must be installed:**
```bash
# macOS
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Windows — download from https://ffmpeg.org/download.html
```

---

## Environment Variables Reference

| Variable | Where | Description |
|---|---|---|
| `MISTRAL_API_KEY` | backend `.env` / Render | Mistral LLM API key |
| `SARVAM_API_KEY` | backend `.env` / Render | Sarvam AI STT key (Hinglish) |
| `SARVAM_STT_MODEL` | backend `.env` / Render | e.g. `saaras:v2.5` |
| `WHISPER_MODEL` | backend `.env` / Render | e.g. `base`, `small`, `medium` |
| `FRONTEND_URL` | Render | Your Vercel URL for CORS |
| `NEXT_PUBLIC_API_URL` | Vercel / `.env.local` | Your Render backend URL |