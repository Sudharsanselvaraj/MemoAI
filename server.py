import os
import sys
import shutil
import tempfile
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

load_dotenv()

from stt import transcribe_audio
from agent import run_agent

app = FastAPI(title="Voice AI Agent API")

# Allow CORS for React frontend (default Vite port is 5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Session store (in-memory for demo purposes)
# In production, use Redis or a database
_sessions = {}
_pending_approvals = {}

class TextRequest(BaseModel):
    text: str
    session_id: str = "default"

class ApprovalRequest(BaseModel):
    session_id: str = "default"

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/process_audio")
async def process_audio(
    audio: UploadFile = File(...),
    provider: str = Form("Groq"),
    session_id: str = Form("default")
):
    try:
        # Create temp file
        suffix = Path(audio.filename).suffix if audio.filename else ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(audio.file, tmp)
            tmp_path = tmp.name

        try:
            # Step 1: STT
            stt_result = transcribe_audio(tmp_path, provider=provider.lower())
            transcription = stt_result["text"]
        finally:
            os.remove(tmp_path)

        # Step 2: Agent Processing
        history = _sessions.get(session_id, [])
        result = run_agent(transcription, session_history=history)

        if "error" in result:
            return {"transcription": transcription, "error": result["error"]}

        # Check for approval
        if result.get("needs_approval"):
            _pending_approvals[session_id] = result.get("pending_data", {})
            return {
                "transcription": transcription,
                "intents": result.get("intents", []),
                "needs_approval": True,
                "approval_message": result.get("approval_message", "Confirm action?"),
                "confidence": result.get("confidence", 0)
            }

        # Update History
        _sessions[session_id] = history
        history.append({"role": "user", "content": transcription})
        outputs = " | ".join(r.get("output", "")[:200] for r in result.get("results", []))
        history.append({"role": "assistant", "content": outputs})
        
        if len(_sessions[session_id]) > 20:
             _sessions[session_id] = _sessions[session_id][-20:]

        return {
            "transcription": transcription,
            "intents": result.get("intents", []),
            "confidence": result.get("confidence", 0),
            "results": result.get("results", []),
            "needs_approval": False
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/process_text")
async def process_text(request: TextRequest):
    try:
        history = _sessions.get(request.session_id, [])
        result = run_agent(request.text, session_history=history)

        if "error" in result:
             return {"transcription": request.text, "error": result["error"]}

        if result.get("needs_approval"):
            _pending_approvals[request.session_id] = result.get("pending_data", {})
            return {
                "transcription": request.text,
                "intents": result.get("intents", []),
                "needs_approval": True,
                "approval_message": result.get("approval_message", "Confirm action?"),
                 "confidence": result.get("confidence", 0)
            }
        
        # Update History
        _sessions[request.session_id] = history
        history.append({"role": "user", "content": request.text})
        outputs = " | ".join(r.get("output", "")[:200] for r in result.get("results", []))
        history.append({"role": "assistant", "content": outputs})
        
        if len(_sessions[request.session_id]) > 20:
             _sessions[request.session_id] = _sessions[request.session_id][-20:]

        return {
            "transcription": request.text,
            "intents": result.get("intents", []),
            "confidence": result.get("confidence", 0),
            "results": result.get("results", []),
            "needs_approval": False
        }
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/approve")
async def approve_action(request: ApprovalRequest):
    pending_state = _pending_approvals.get(request.session_id)
    if not pending_state:
        raise HTTPException(status_code=400, detail="No pending action to approve")

    transcription = pending_state.get("transcription", "")
    history = _sessions.get(request.session_id, [])

    result = run_agent(transcription, session_history=history, pending_approval=pending_state)
    
    # clear pending state
    del _pending_approvals[request.session_id]

    if "error" in result:
        return {"error": result["error"]}

    # Update History
    _sessions[request.session_id] = history
    history.append({"role": "user", "content": transcription})
    outputs = " | ".join(r.get("output", "")[:200] for r in result.get("results", []))
    history.append({"role": "assistant", "content": outputs})
    if len(_sessions[request.session_id]) > 20:
         _sessions[request.session_id] = _sessions[request.session_id][-20:]
         
    return {
        "transcription": transcription,
        "intents": result.get("intents", []),
         "confidence": result.get("confidence", 0),
        "results": result.get("results", []),
        "needs_approval": False
    }

@app.get("/api/history")
def get_history(session_id: str = "default"):
    return {"history": _sessions.get(session_id, [])}
