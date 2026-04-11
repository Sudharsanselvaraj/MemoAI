"""
Speech-to-Text Module
Primary: Groq Whisper API (ultra-fast, free tier)
Fallback: OpenAI Whisper API
Local: transformers pipeline (if GPU available)

Why Groq over local Whisper?
- Groq's LPU inference is 10-20x faster than CPU Whisper
- Accurate (whisper-large-v3 quality)
- Free tier: 28,800 seconds audio/day
- Avoids 1-2GB model download for local Whisper
See README.md for full justification.
"""

import os
import io
import tempfile
from pathlib import Path

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

from metrics_store import metrics

def transcribe_audio(audio_path: str, provider: str = "groq") -> dict:
    """
    Transcribe audio file to text.
    
    Args:
        audio_path: Path to audio file (.wav, .mp3, .m4a, .webm, etc.)
        provider: "groq" | "openai" | "local"
    
    Returns:
        dict with 'text' and 'provider' keys
    """
    audio_path = str(audio_path)
    
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    try:
        metrics["pipeline"]["transcription"] = "running"
        if provider == "groq":
            res = _transcribe_groq(audio_path)
        elif provider == "openai":
            res = _transcribe_openai(audio_path)
        elif provider == "local":
            res = _transcribe_local(audio_path)
        else:
            # Auto-select based on available keys
            if os.getenv("GROQ_API_KEY") and GROQ_AVAILABLE:
                res = _transcribe_groq(audio_path)
            elif os.getenv("OPENAI_API_KEY") and OPENAI_AVAILABLE:
                res = _transcribe_openai(audio_path)
            else:
                res = _transcribe_local(audio_path)
        
        metrics["pipeline"]["transcription"] = "completed"
        metrics["transcription"] = res["text"]
        return res
    except Exception as e:
        metrics["pipeline"]["transcription"] = "error"
        raise e


def _transcribe_groq(audio_path: str) -> dict:
    """Groq Whisper API — fastest option."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError("GROQ_API_KEY not set. Get a free key at console.groq.com")
    
    if not GROQ_AVAILABLE:
        raise ImportError("groq package not installed. Run: pip install groq")
    
    client = Groq(api_key=api_key)
    
    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
            response_format="text"
        )
    
    text = transcription if isinstance(transcription, str) else transcription.text
    return {"text": text.strip(), "provider": "Groq (whisper-large-v3)"}


def _transcribe_openai(audio_path: str) -> dict:
    """OpenAI Whisper API fallback."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise EnvironmentError("OPENAI_API_KEY not set")
    
    client = openai.OpenAI(api_key=api_key)
    with open(audio_path, "rb") as audio_file:
        transcription = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file
        )
    return {"text": transcription.text.strip(), "provider": "OpenAI (whisper-1)"}


def _transcribe_local(audio_path: str) -> dict:
    """
    Local Whisper via HuggingFace transformers.
    Requires: pip install transformers torch librosa
    Model downloads ~1.5GB on first run.
    """
    try:
        from transformers import pipeline
        import torch
        
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Loading local Whisper model on {device}...")
        
        pipe = pipeline(
            "automatic-speech-recognition",
            model="openai/whisper-base",  # ~145MB, balanced speed/accuracy
            device=device,
            chunk_length_s=30,
            return_timestamps=False
        )
        result = pipe(audio_path)
        return {"text": result["text"].strip(), "provider": "Local (whisper-base via HuggingFace)"}
    
    except ImportError:
        raise ImportError(
            "Local transcription requires: pip install transformers torch librosa\n"
            "Or set GROQ_API_KEY for cloud transcription."
        )