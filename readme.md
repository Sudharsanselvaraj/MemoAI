# ⬡ Voice-Controlled Local AI Agent

> **Speak a command → AI understands → Files get created, code gets written, text gets summarized.**

A fully local-first AI agent with voice input, intent classification, tool execution, and a clean Gradio UI.

---

## Demo

> 📹 [Video Demo — YouTube Unlisted](YOUR_YOUTUBE_LINK)  
> 📰 [Technical Article — Dev.to / Medium](YOUR_ARTICLE_LINK)

---

## Architecture

```
Audio Input (mic/file)
        │
        ▼
┌──────────────────┐
│  Speech-to-Text  │  ← Groq Whisper API (whisper-large-v3)
│     (STT)        │
└────────┬─────────┘
         │ transcription
         ▼
┌──────────────────┐
│ Intent Classifier│  ← Ollama (llama3, local)
│   (LLM Layer 1)  │  Returns: intents[], entities{}, confidence
└────────┬─────────┘
         │
         ├─ create_file ──► FileCreationTool → output/
         ├─ write_code  ──► CodeGenTool (LLM) → output/
         ├─ summarize   ──► SummaryTool (LLM)
         └─ general_chat ─► ChatTool (LLM)
         │
         ▼
┌──────────────────┐
│   Gradio UI      │  Shows: transcription, intent, action, result
│   (Frontend)     │  + Human-in-the-loop approval for file ops
└──────────────────┘
```

### Models Used

| Layer | Model | Provider | Reason |
|-------|-------|----------|--------|
| STT | `whisper-large-v3` | Groq API | See below* |
| Intent Classification | `llama3` | Ollama (local) | Fully local, fast, accurate JSON output |
| Code Generation | `llama3` | Ollama (local) | Same model, prompted differently |
| Summarization | `llama3` | Ollama (local) | Same model |

---

## ⚡ Why Groq over Local Whisper?

**Hardware Justification:**

Running `openai/whisper-large-v3` locally requires:
- ~3GB VRAM for GPU inference (A10 or better for real-time)
- CPU inference: **15–60 seconds** per short clip on a typical laptop

Groq's LPU (Language Processing Unit) infrastructure runs the **same model** (`whisper-large-v3`) in **~1–2 seconds** via API, with:
- **Free tier**: 28,800 audio seconds/day
- No model download (~1.5GB saved)
- Consistent latency regardless of local hardware

**Local fallback is still included** (`src/stt.py` → `_transcribe_local()`) using HuggingFace `openai/whisper-base` (~145MB). Uncomment `transformers`, `torch`, and `librosa` in `requirements.txt` to enable it. Choose "Local" in the UI STT provider dropdown.

---

## Setup

### Prerequisites
- Python 3.10+
- [Ollama](https://ollama.com) installed and running
- A free [Groq API key](https://console.groq.com) (for STT)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/voice-ai-agent
cd voice-ai-agent
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env — add your GROQ_API_KEY
```

### 3. Pull Ollama model

```bash
ollama pull llama3
ollama serve   # start in background if not already running
```

### 4. Launch

```bash
python app.py
# Open http://localhost:7860
```

---

## Features

### Core
- 🎙️ **Microphone recording** + **audio file upload** (.wav, .mp3, .m4a)
- 🧠 **Intent classification** with confidence scores
- 📄 **Create files** in `output/`
- 💻 **Generate & save code** (Python, JS, Go, Rust, etc.)
- 📝 **Summarize** any text with key points
- 💬 **General chat** with session memory

### Bonus Features Implemented
- **Compound Commands**: "Summarize this and save it to summary.txt" → runs both summarize + create_file
- **Human-in-the-Loop**: Approve/Deny prompt before any file write operation
- **Graceful Degradation**: Handles empty audio, unintelligible speech, unknown intents
- **Session Memory**: Last 6 messages kept as context for conversational continuity
- **Model Benchmarking**: Groq vs Local Whisper comparison in the article

---

## Project Structure

```
voice-ai-agent/
├── app.py              # Gradio UI + pipeline orchestration
├── src/
│   ├── agent.py        # Intent classification + tool execution
│   └── stt.py          # Speech-to-Text (Groq/OpenAI/Local)
├── output/             # All generated files land here (safe sandbox)
├── requirements.txt
├── .env.example
└── README.md
```

---

## Safety

All file operations are sandboxed to the `output/` directory. Path traversal attempts are sanitized. File operations require explicit UI approval before execution.

---

## Supported Intents & Examples

| Intent | Example Commands |
|--------|-----------------|
| `create_file` | "Create a text file called notes.txt" |
| `write_code` | "Write a Python retry decorator and save it" |
| `summarize` | "Summarize: [paste text]" |
| `general_chat` | "What is the difference between RAG and fine-tuning?" |
| Compound | "Write a bash backup script and summarize what it does" |

---

## Troubleshooting

**Ollama not running:**
```bash
ollama serve
```

**Groq key missing:**
```
EnvironmentError: GROQ_API_KEY not set
```
Get a free key at [console.groq.com](https://console.groq.com)

**Audio not transcribing:** Check your mic permissions. Try uploading a .wav file first.