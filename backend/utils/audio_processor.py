import yt_dlp
# from pydub import AudioSegment
import subprocess
import os
import ffmpeg

DOWNLOAD_DIR = "downloads"
os.makedirs(DOWNLOAD_DIR, exist_ok=True)

def download_youtube_audio(url: str) -> str:
    output_path = os.path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s")
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'noplaylist': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        # "quiet": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info).replace('.webm', '.wav').replace('.m4a', '.wav')
        return filename


def convert_to_wav(input_path: str) -> str:
    output_path = os.path.splitext(input_path)[0] + "_converted.wav"
    # audio = AudioSegment.from_file(input_path)
    # audio = audio.set_channels(1).set_frame_rate(16000) #16khz
    # audio.export(output_path, format="wav")
    subprocess.run([
        "ffmpeg", "-i", input_path,
        "-ac", "1",          # mono
        "-ar", "16000",      # 16kHz
        "-y",                # overwrite if exists
        output_path
    ], check=True)
    return output_path


def chunk_audio(wav_path: str, chunk_length_min: int = 10) -> list:
    # Get duration
    probe = ffmpeg.probe(wav_path)
    duration = float(probe["format"]["duration"])
    
    chunk_length_sec = chunk_length_min * 60  # convert to seconds for ffmpeg

    chunks = []
    start = 0
    i = 0

    while start < duration:
        chunk_path = f"{os.path.splitext(wav_path)[0]}_chunk_{i}.wav"
        (
            ffmpeg
            .input(wav_path, ss=start, t=chunk_length_sec)
            .output(chunk_path, ac=1, ar=16000)
            .overwrite_output()
            .run(quiet=True)
        )
        chunks.append(chunk_path)
        start += chunk_length_sec
        i += 1

    return chunks



def process_input(source: str)-> list:
    if source.startswith("http://") or source.startswith("https://"):
        print("Downloading audio from YouTube...")
        wav_path = download_youtube_audio(source)
    else:
        print("Processing local audio file. Converting to WAV...")
        wav_path = convert_to_wav(source)
    
    print("Chunking audio")
    chunks = chunk_audio(wav_path)
    print(f"Audio ready - {len(chunks)} chunk (s) created.")
    return chunks