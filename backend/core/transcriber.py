import os
import requests
import ffmpeg

SARVAM_PIECE_SECONDS = 25

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "whisper-large-v3")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_STT_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

SARVAM_API_KEY = os.getenv("SARVAM_API_KEY")
SARVAM_STT_TRANSLATE_URL = "https://api.sarvam.ai/speech-to-text-translate"
SARVAM_MODEL = os.getenv("SARVAM_STT_MODEL", "saaras:v2.5")


# ── Groq (English) ────────────────────────────────────────────────────────────

def transcribe_chunk_groq(chunk_path: str) -> str:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set in environment / .env")

    headers = {"Authorization": f"Bearer {GROQ_API_KEY}"}

    with open(chunk_path, "rb") as f:
        files = {"file": (os.path.basename(chunk_path), f, "audio/wav")}
        data = {"model": WHISPER_MODEL, "response_format": "text"}
        response = requests.post(
            GROQ_STT_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=120,
        )

    if not response.ok:
        print(f"\n❌ Groq returned {response.status_code}: {response.text}\n")
        response.raise_for_status()

    return response.text.strip()


# ── Sarvam (Hinglish) ─────────────────────────────────────────────────────────

def _send_to_sarvam(piece_path: str) -> str:
    headers = {"api-subscription-key": SARVAM_API_KEY}

    with open(piece_path, "rb") as f:
        files = {"file": (os.path.basename(piece_path), f, "audio/wav")}
        data = {"model": SARVAM_MODEL, "with_diarization": "false"}
        response = requests.post(
            SARVAM_STT_TRANSLATE_URL,
            headers=headers,
            files=files,
            data=data,
            timeout=120,
        )

    if not response.ok:
        print(f"\n❌ Sarvam returned {response.status_code}: {response.text}\n")
        response.raise_for_status()

    return response.json().get("transcript", "")


def transcribe_chunk_sarvam(chunk_path: str) -> str:
    if not SARVAM_API_KEY:
        raise RuntimeError("SARVAM_API_KEY is not set in environment / .env")

    probe = ffmpeg.probe(chunk_path)
    duration = float(probe["format"]["duration"])

    full_text = ""
    total_pieces = int(duration // SARVAM_PIECE_SECONDS) + 1

    for i, start in enumerate(range(0, int(duration), SARVAM_PIECE_SECONDS)):
        piece_path = f"{chunk_path}_sv_{i}.wav"
        (
            ffmpeg
            .input(chunk_path, ss=start, t=SARVAM_PIECE_SECONDS)
            .output(piece_path, ac=1, ar=16000)
            .overwrite_output()
            .run(quiet=True)
        )
        try:
            print(f"  → Sarvam piece {i + 1}/{total_pieces} ...")
            full_text += _send_to_sarvam(piece_path) + " "
        finally:
            if os.path.exists(piece_path):
                os.remove(piece_path)

    return full_text.strip()


# ── Router ────────────────────────────────────────────────────────────────────

def transcribe_chunk(chunk_path: str, language: str = "english") -> str:
    if language.lower() == "hinglish":
        return transcribe_chunk_sarvam(chunk_path)
    return transcribe_chunk_groq(chunk_path)


def transcribe_all(chunks: list, language: str = "english") -> str:
    full_transcript = ""

    engine = "Sarvam AI" if language.lower() == "hinglish" else "Groq Whisper"
    print(f"Using {engine} for transcription.")

    for i, chunk in enumerate(chunks):
        print(f"Transcribing chunk {i + 1}/{len(chunks)}...")
        text = transcribe_chunk(chunk, language=language)
        full_transcript += text + " "

    print("Transcription complete.")
    return full_transcript.strip()