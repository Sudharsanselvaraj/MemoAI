# MemoAI — Memory-Powered Local AI Agent

> **Speak a command → AI understands your intent → Files get created, code gets written, text gets summarized. Entirely on your machine.**

MemoAI is a fully local-first, voice-controlled AI agent built for the GenoTek Voice AI Agent assignment. It accepts audio via microphone or file upload, transcribes it using Groq's Whisper API, classifies the user's intent with a keyword-based classifier backed by Ollama's Llama 3, executes the appropriate tool, and streams the full pipeline output to a polished React UI — all with session memory, human-in-the-loop approval, and real-time telemetry.

---

## 📹 Links

| Resource | Link |
|----------|------|
| 🎬 Video Demo | [YouTube Unlisted](YOUR_YOUTUBE_LINK) |
| 📰 Technical Article | [Medium / Dev.to](YOUR_ARTICLE_LINK) |
| 💻 GitHub Repository | [github.com/Sudharsanselvaraj/MemoAI](YOUR_GITHUB_LINK) |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                           │
│              React + Vite + TailwindCSS + Framer Motion         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐   │
│  │  Voice   │  │  Upload  │  │   Text   │  │Pipeline Timelin│   │
│  │   Tab    │  │   Tab    │  │   Tab    │  │ + System Health│   │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘   │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP (POST /api/process_audio or /api/process_text)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FASTAPI BACKEND                             │
│                    server.py  (port 8000)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  STAGE 1: STT                           │    │
│  │             src/stt.py → transcribe_audio()             │    │
│  │                                                         │    │
│  │   Primary:  Groq API → whisper-large-v3  (~1–2s)        │    │
│  │   Fallback: OpenAI  → whisper-1                         │    │
│  │   Local:    HuggingFace → openai/whisper-base (~145MB)  │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │ transcription (string)            │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │               STAGE 2: INTENT CLASSIFICATION            │    │
│  │              src/agent.py → classify_intent()           │    │
│  │                                                         │    │
│  │   Keyword matcher → JSON:                               │    │
│  │   { intents[], entities{}, confidence, raw_command }    │    │
│  │                                                         │    │
│  │   Intents: create_file | write_code |                   │    │
│  │            summarize   | general_chat                   │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                   │
│              ┌──────────────▼──── needs_approval? ─────────┐    │
│              │  STAGE 2.5: Human-in-the-Loop Gate          │    │
│              │  File ops (create_file, write_code) require │    │
│              │  explicit UI confirmation before proceeding.│    │
│              └──────────────┬──────────────────────────────┘    │
│                             │ approved                          │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │                 STAGE 3: TOOL EXECUTION                 │    │
│  │              src/agent.py → run_agent()                 │    │
│  │                                                         │    │
│  │   create_file  → writes stub file → output/             │    │
│  │   write_code   → Ollama Llama 3 → saves code → output/  │    │
│  │   summarize    → Ollama Llama 3 → optionally saves file │    │
│  │   general_chat → Ollama Llama 3 → returns response      │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                   │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │             STAGE 4: METRICS AGGREGATION                │    │
│  │              src/metrics_store.py → metrics{}           │    │
│  │                                                         │    │
│  │   tokens (prompt/completion/total)                      │    │
│  │   latency (seconds)                                     │    │
│  │   pipeline stage statuses                               │    │
│  │   memory hits/misses, system health                     │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                   │
│            GET /metrics  ◄──┘  (polled every 1s by frontend)    │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
             ┌─────────────────────┐
             │   OLLAMA (local)    │
             │   llama3 on :11434  │
             └─────────────────────┘
```

---

## Models Used

| Layer | Model | Provider | Latency | Why |
|-------|-------|----------|---------|-----|
| Speech-to-Text | `whisper-large-v3` | Groq API | ~1–2s | See justification below |
| Intent Classification | `llama3` | Ollama (local) | ~1–3s | Fully offline, accurate JSON |
| Code Generation | `llama3` | Ollama (local) | ~3–8s | Same model, different prompt |
| Summarization | `llama3` | Ollama (local) | ~2–5s | Same model, different prompt |
| General Chat | `llama3` | Ollama (local) | ~1–3s | Session-context aware |

---

## Why Groq over Local Whisper?

**Hardware Justification (documented per assignment requirement):**

Running `openai/whisper-large-v3` locally requires:
- ~3GB VRAM for GPU inference — a dedicated A10 or better for real-time performance
- On a standard MacBook or laptop CPU: **15–60 seconds** of inference per short audio clip
- Model download: **~1.5 GB** on first run

**Groq's LPU (Language Processing Unit)** runs the same `whisper-large-v3` model via API:
- Consistent **~1–2 second** transcription latency regardless of local hardware
- **Free tier**: 28,800 audio seconds/day — more than sufficient for development
- No local GPU, no model download, no RAM overhead
- Fallback to `whisper-base` via HuggingFace is still available in `src/stt.py` (`_transcribe_local()`) — enable by installing `transformers torch librosa`

**This is a deliberate architectural decision**, not a shortcut. The assignment explicitly permits API-based STT when local hardware is insufficient, and Groq gives production-grade accuracy with zero local compute.

---

## Supported Intents

| Intent | Trigger Keywords | Action |
|--------|-----------------|--------|
| `create_file` | "create file", "make file", "new file", "save to" | Creates a stub file in `output/` |
| `write_code` | "write code", "write a python", "write a javascript", "generate code" | Generates code via Llama 3, saves to `output/` |
| `summarize` | "summarize", "summary of", "summarize:" | Summarizes content via Llama 3; saves if filename mentioned |
| `general_chat` | Questions ("what is", "how does", "explain"), or anything else | Full conversation via Llama 3 with session context |
| **Compound** | Any combination above in one sentence | Detects up to 2 intents, executes both |

### Example Commands

```
"Create a Python file with a retry function"
→ intent: write_code
→ action: Llama 3 generates code → saved to output/retry_function.py

"Summarize the concept of transformers and save it to notes.txt"
→ intents: summarize + create_file (compound command)
→ action: generates summary → saved to output/notes.txt

"What is the difference between RAG and fine-tuning?"
→ intent: general_chat
→ action: Llama 3 responds with session context

"whats tjme"  (typo)
→ intent: general_chat
→ action: Llama 3 infers meaning and responds correctly
```

---

## Bonus Features Implemented

| Feature | Status | Implementation |
|---------|--------|----------------|
| Compound Commands | ✅ | `classify_intent()` returns up to 2 intents; `run_agent()` loops over all |
| Human-in-the-Loop | ✅ | `needs_approval: True` returned for `create_file` / `write_code`; UI shows confirm/deny |
| Graceful Degradation | ✅ | Empty audio, unknown intents, Ollama connection errors all handled with friendly messages |
| Session Memory | ✅ | Last 6 turns stored in `_sessions{}` dict; passed as context to every Llama 3 call |
| Model Benchmarking | ✅ | Groq vs local Whisper latency comparison in the technical article |

---

## 📁 Project Structure

```
MemoAI/
│
├── backend/
│   ├── server.py               # FastAPI app — all API routes
│   ├── requirements.txt        # Python dependencies
│   ├── output/                 # ALL generated files land here (sandboxed)
│   └── src/
│       ├── agent.py            # Intent classifier + tool executor + run_agent()
│       ├── stt.py              # STT module — Groq / OpenAI / Local Whisper
│       └── metrics_store.py    # Shared in-memory metrics dict + update_history()
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # React Router — 5 routes (/features, /pipeline, /demo, /docs, /agent)
│   │   ├── main.jsx            # Entry point
│   │   ├── index.css           # Global styles
│   │   ├── pages/
│   │   │   └── AgentConsole.jsx  # Main interaction page — Voice/Upload/Text + Pipeline Timeline
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx        # Landing page hero section
│   │   │   ├── CapabilitiesSection.jsx  # Memory Logs + capabilities copy
│   │   │   ├── FeatureSection.jsx       # Pipeline 5-step visual
│   │   │   ├── PerformanceSection.jsx
│   │   │   ├── DevToolsSection.jsx
│   │   │   ├── DashboardPreview.jsx
│   │   │   ├── StatsStrip.jsx
│   │   │   ├── IntegrationSection.jsx
│   │   │   ├── BlogSection.jsx
│   │   │   ├── CTA.jsx
│   │   │   ├── TrustedLogos.jsx
│   │   │   └── Footer.jsx
│   │   └── services/
│   │       ├── api.js          # Axios instance → http://localhost:8000
│   │       └── websocket.js    # WebSocket utility (reserved for future live streaming)
│   ├── public/
│   │   └── media/              # cloud_left.png, cloud_right.png, logo.png
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔌 API Reference

All endpoints served at `http://localhost:8000`

### `POST /api/process_audio`
Accepts a raw audio file, transcribes it, runs the full agent pipeline.

| Field | Type | Description |
|-------|------|-------------|
| `audio` | File (multipart) | `.wav`, `.mp3`, `.m4a`, `.webm` |
| `provider` | string | `"groq"` \| `"openai"` \| `"local"` (default: `"groq"`) |
| `session_id` | string | Session identifier for memory (default: `"default"`) |

**Response:**
```json
{
  "transcription": "write a python retry function",
  "intents": ["write_code"],
  "confidence": 0.7,
  "results": [
    {
      "action": "write_code",
      "message": "def retry(func, retries=3): ...",
      "output": "def retry(func, retries=3): ...",
      "filepath": "/path/to/output/retry_function.py"
    }
  ],
  "needs_approval": false
}
```

---

### `POST /api/process_text`
Same as above but accepts raw text instead of audio. Used by the Text tab.

**Request body:**
```json
{
  "text": "summarize the transformer architecture",
  "session_id": "session-abc123"
}
```

---

### `POST /api/approve`
Executes a pending file operation after human-in-the-loop approval.

**Request body:**
```json
{ "session_id": "session-abc123" }
```

---

### `GET /metrics`
Returns real-time pipeline metrics. Polled every 1 second by the frontend.

**Response:**
```json
{
  "transcription": "whats tjme",
  "intent": "general_chat",
  "action": "general_chat",
  "tokens": { "prompt": 66, "completion": 26, "total": 92 },
  "latency": 1.57,
  "pipeline": {
    "transcription": "idle",
    "intent": "completed",
    "tool": "completed",
    "response": "completed"
  },
  "memory": { "count": 0, "hits": 0, "misses": 1 },
  "system": {
    "ollama": "running",
    "model": "loaded",
    "memory": "connected",
    "api": "healthy"
  },
  "history": [
    { "command": "whats tjme", "timestamp": "20:35", "status": "success" }
  ]
}
```

---

### `GET /api/history`
Returns full session conversation history.

---

## 🛠️ Setup & Installation

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Python | 3.10+ | [python.org](https://python.org) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Ollama | latest | [ollama.com](https://ollama.com) |
| Groq API Key | free | [console.groq.com](https://console.groq.com) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/Sudharsanselvaraj/MemoAI.git
cd MemoAI
```

---

### Step 2 — Backend setup

```bash
cd backend
pip install -r requirements.txt
```

Create your `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and add your key:

```env
GROQ_API_KEY=your_groq_api_key_here
# OPENAI_API_KEY=optional_fallback
```

---

### Step 3 — Pull and start Ollama

```bash
# Pull the model (one-time, ~4GB download)
ollama pull llama3

# Start the Ollama server (runs on localhost:11434)
ollama serve
```

> If Ollama is already running as a system service, skip `ollama serve`.

---

### Step 4 — Start the backend

```bash
cd backend
python server.py
# FastAPI starts on http://localhost:8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

### Step 5 — Frontend setup

```bash
cd frontend
npm install
npm run dev
# Vite starts on http://localhost:5173
```

---

### Step 6 — Open the app

```
http://localhost:5173/features    ← Landing page
http://localhost:5173/agent       ← Agent Console (main interaction)
```

---

## Safety & Security

- **Filesystem sandbox**: All file creation and code writing is restricted to the `backend/output/` directory. The `safe_filename()` function in `agent.py` strips path traversal attempts (`../`) and sanitizes filenames with regex before any write operation.
- **Human-in-the-loop gate**: Any intent involving file operations (`create_file`, `write_code`) triggers a confirmation prompt in the UI. The backend holds the pending action in `_pending_approvals{}` until the user explicitly approves via `POST /api/approve`.
- **No external LLM calls for execution**: All tool execution (code generation, summarization, chat) routes through local Ollama. Only the STT step uses an external API (Groq).

---

## Troubleshooting

**Ollama not running:**
```bash
ollama serve
# Check: curl http://localhost:11434/api/tags
```

**Groq key missing:**
```
EnvironmentError: GROQ_API_KEY not set. Get a free key at console.groq.com
```

**CORS error in browser:**
The backend allows `*` origins by default. Ensure the backend is on port `8000` and frontend on `5173`. Check `server.py` CORS middleware if you change ports.

**Audio not transcribing:**
- Check microphone permissions in browser settings
- Try the Upload tab with a `.wav` file first to isolate mic vs API issues
- Confirm `GROQ_API_KEY` is set in `.env`

**Ollama timeout / slow responses:**
- Ensure no other processes are consuming RAM
- Try a smaller model: `ollama pull llama3:8b` and update `OLLAMA_URL` model name in `agent.py`

**Frontend shows blank metrics:**
- Backend must be running before the frontend polls `/metrics`
- Check browser console for CORS or network errors

---

## Performance Notes

| Operation | Typical Latency |
|-----------|----------------|
| Groq STT (whisper-large-v3) | 0.5 – 2s |
| Intent classification (keyword) | < 5ms |
| Ollama code generation (Llama 3) | 3 – 8s |
| Ollama summarization (Llama 3) | 2 – 5s |
| Ollama general chat (Llama 3) | 1 – 3s |
| Full pipeline (voice → result) | 3 – 10s |

Metrics are exposed live at `GET /metrics` and displayed in the Agent Console's Token Usage, Performance, and Memory Usage cards.

---

## How Session Memory Works

The backend maintains an in-memory dict `_sessions{}` keyed by `session_id`. Each request appends the user's command and the assistant's response as `{role, content}` pairs. The last 6 entries (3 conversational turns) are passed as a `session_context` string to every Llama 3 call, giving the model awareness of prior conversation.

```python
session_context = "\n".join([
    f"[{h['role']}]: {h['content']}" for h in session_history[-6:]
])
```

Sessions cap at 20 messages to prevent unbounded memory growth. The frontend generates a unique `session_id` on load (`session-{random}`) so each browser tab gets its own isolated history.

---

## License

MIT License — see `LICENSE` for details.

---

## Author

**Sudharsan S**  
Pre-final year BTech CSE @ SRMIST Trichy  
ML Engineer Intern @ ALKF  
[LinkedIn](https://linkedin.com/in/sudharsan-s-528a8a2a0) · [GitHub](https://github.com/Sudharsanselvaraj)
