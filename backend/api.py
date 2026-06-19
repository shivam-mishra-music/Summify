import os
import sys
import uuid
import tempfile
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

# In-memory store for rag_chains keyed by session_id
rag_store: dict = {}

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(title="Summify API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ──────────────────────────────────────────────────────────────────────

class ProcessURLRequest(BaseModel):
    url: str
    language: str = "english"

class ChatRequest(BaseModel):
    session_id: str
    question: str

# ── Helpers ─────────────────────────────────────────────────────────────────────

def run_pipeline(source: str, language: str) -> dict:
    from utils.audio_processor import process_input
    from core.transcriber import transcribe_all
    from core.summarizer import summarize, generate_title
    from core.extractor import extract_action_items, extract_key_decisions, extract_questions
    from core.rag_engine import build_rag_chain

    chunks = process_input(source)
    transcript = transcribe_all(chunks, language)
    title = generate_title(transcript)
    summary = summarize(transcript)
    action_items = extract_action_items(transcript)
    decisions = extract_key_decisions(transcript)
    questions = extract_questions(transcript)
    rag_chain = build_rag_chain(transcript)

    session_id = str(uuid.uuid4())
    rag_store[session_id] = rag_chain

    return {
        "session_id": session_id,
        "title": title,
        "transcript": transcript,
        "summary": summary,
        "action_items": action_items,
        "key_decisions": decisions,
        "open_questions": questions,
    }

# ── Routes ───────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/process/url")
def process_url(req: ProcessURLRequest):
    try:
        return run_pipeline(req.url, req.language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/process/file")
async def process_file(
    file: UploadFile = File(...),
    language: str = Form("english"),
):
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        return run_pipeline(tmp_path, language)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@app.post("/chat")
def chat(req: ChatRequest):
    rag_chain = rag_store.get(req.session_id)
    if not rag_chain:
        raise HTTPException(status_code=404, detail="Session not found. Please re-process the meeting.")
    from core.rag_engine import ask_question
    answer = ask_question(rag_chain, req.question)
    return {"answer": answer}