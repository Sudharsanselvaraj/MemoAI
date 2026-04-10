"""
Voice Agent Core — Intent classification + Tool execution
"""

import json
import os
import re
from datetime import datetime
from typing import Optional
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)

INTENT_SYSTEM_PROMPT = """You are an intent classifier for a voice-controlled AI agent.

Analyze the user's transcribed speech and return a JSON object with:
{
  "intents": ["intent1", "intent2"],  // list of detected intents (can be multiple for compound commands)
  "entities": {
    "filename": "optional filename if mentioned",
    "language": "programming language if mentioned",
    "content": "content/topic to process if mentioned",
    "description": "what to create/summarize/chat about"
  },
  "confidence": 0.0-1.0,
  "raw_command": "the original command cleaned up"
}

Valid intents:
- "create_file" — user wants to create an empty file or folder
- "write_code" — user wants to generate and save code to a file
- "summarize" — user wants text summarized
- "general_chat" — general conversation, questions, or anything else

For compound commands (e.g. "summarize this and save to summary.txt"), list ALL intents.
Return ONLY the JSON object, no explanation."""

TOOL_SYSTEM_PROMPT = """You are a helpful AI assistant that executes user commands precisely.
Be concise and effective. For code generation, write clean, working code with comments.
For summaries, be thorough but concise. For chat, be helpful and friendly."""


def call_ollama(prompt: str, system: str = "", model: str = "llama3") -> str:
    """Call local Ollama instance."""
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {"temperature": 0.1 if "json" in system.lower() else 0.7}
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=60)
        resp.raise_for_status()
        return resp.json().get("response", "").strip()
    except requests.exceptions.ConnectionError:
        raise RuntimeError("Ollama is not running. Start it with: ollama serve")
    except Exception as e:
        raise RuntimeError(f"Ollama error: {e}")


def classify_intent(text: str) -> dict:
    """Classify user intent from transcribed text."""
    # Simple keyword-based intent detection as fallback
    text_lower = text.lower()
    is_question = '?' in text or any(word in text_lower for word in ['what is', 'how does', 'explain', 'define', 'tell me'])
    
    # Check for keywords - order matters, more specific first
    intents = []
    
    # File creation keywords
    if any(word in text_lower for word in ['create file', 'make file', 'new file', 'save to file', 'save it to', 'save to']):
        intents.append('create_file')
    
    # Code generation - specific phrases
    elif any(word in text_lower for word in ['write code', 'write a python', 'write a javascript', 'generate code']):
        intents.append('write_code')
    
    # Summarize keywords
    elif any(word in text_lower for word in ['summarize', 'summary of', 'summarize:']):
        intents.append('summarize')
    
    # Questions = general chat (unless specifically asking to write code)
    elif is_question:
        intents = ['general_chat']
    
    # Generic "what is X" without code intent
    elif text_lower.startswith('what is ') and 'code' not in text_lower:
        intents = ['general_chat']
    
    # Code-related keywords (only if not a question)
    elif any(word in text_lower for word in ['python', 'javascript', 'function', 'script', 'class ']):
        intents.append('write_code')
    
    else:
        intents = ['general_chat']
    
    if not intents:
        intents = ['general_chat']
    
    # Limit to max 2 intents
    intents = intents[:2]
    
    # Check if any intent requires file operation
    file_intents = {'create_file', 'write_code'}
    needs_approval = any(i in file_intents for i in intents)
    
    # Determine confidence based on keyword matches
    confidence = min(0.5 + (len(intents) * 0.2), 0.95)
    
    return {
        "intents": intents,
        "entities": {},
        "confidence": confidence,
        "raw_command": text
    }


def safe_filename(name: str, default_ext: str = ".txt") -> str:
    """Sanitize filename and ensure it stays in output dir."""
    # Remove path traversal attempts
    name = os.path.basename(name.strip())
    name = re.sub(r'[^\w\-_\.]', '_', name)
    if '.' not in name:
        name += default_ext
    return os.path.join(OUTPUT_DIR, name)


def execute_create_file(entities: dict) -> dict:
    """Create an empty file or folder."""
    filename = entities.get("filename") or f"file_{datetime.now().strftime('%H%M%S')}.txt"
    filepath = safe_filename(filename)
    
    with open(filepath, 'w') as f:
        f.write(f"# Created by Voice Agent\n# {datetime.now().isoformat()}\n")
    
    return {
        "action": "create_file",
        "filepath": filepath,
        "message": f"✅ Created file: {os.path.basename(filepath)}",
        "output": f"File created at: output/{os.path.basename(filepath)}"
    }


def execute_write_code(entities: dict, original_text: str) -> dict:
    """Generate code and write to file."""
    lang = entities.get("language", "python")
    description = entities.get("description") or entities.get("content") or original_text
    filename = entities.get("filename")
    
    ext_map = {
        "python": ".py", "javascript": ".js", "typescript": ".ts",
        "java": ".java", "go": ".go", "rust": ".rs", "cpp": ".cpp",
        "c": ".c", "bash": ".sh", "html": ".html", "css": ".css"
    }
    ext = ext_map.get(lang.lower(), ".py")
    
    if not filename:
        # Generate a meaningful filename from description
        fname_prompt = f"Generate a short snake_case filename (no extension) for: {description}. Return ONLY the filename."
        filename = call_ollama(fname_prompt).strip().split()[0] + ext
    
    filepath = safe_filename(filename, ext)
    
    # Generate code
    code_prompt = f"""Write {lang} code for: {description}

Requirements:
- Clean, well-commented, production-quality code
- Include all necessary imports
- Add a brief docstring/comment at the top
- Make it complete and runnable
"""
    code = call_ollama(code_prompt, system=TOOL_SYSTEM_PROMPT)
    
    # Strip markdown code fences if present
    code = re.sub(r'^```\w*\n?', '', code.strip(), flags=re.MULTILINE)
    code = re.sub(r'```$', '', code.strip(), flags=re.MULTILINE)
    
    with open(filepath, 'w') as f:
        f.write(code.strip())
    
    return {
        "action": "write_code",
        "filepath": filepath,
        "message": f"✅ Code written to: {os.path.basename(filepath)}",
        "output": code.strip()
    }


def execute_summarize(entities: dict, original_text: str, session_context: str = "") -> dict:
    """Summarize provided content."""
    content = entities.get("content") or original_text
    filename = entities.get("filename")
    
    summary_prompt = f"""Summarize the following concisely and clearly:

{content}

Provide:
1. A 2-3 sentence summary
2. Key points (bullet list)
3. Main takeaway
"""
    summary = call_ollama(summary_prompt, system=TOOL_SYSTEM_PROMPT)
    
    result = {
        "action": "summarize",
        "message": "✅ Summary generated",
        "output": summary
    }
    
    # If a filename was mentioned (compound command), save it
    if filename:
        filepath = safe_filename(filename, ".txt")
        with open(filepath, 'w') as f:
            f.write(f"Summary generated by Voice Agent\n{'='*40}\n\n{summary}")
        result["filepath"] = filepath
        result["message"] = f"✅ Summary generated and saved to: {os.path.basename(filepath)}"
    
    return result


def execute_general_chat(original_text: str, session_context: str = "") -> dict:
    """Handle general conversation."""
    context_str = f"\nConversation history:\n{session_context}\n" if session_context else ""
    
    response = call_ollama(
        prompt=f"{context_str}User: {original_text}",
        system=TOOL_SYSTEM_PROMPT
    )
    
    return {
        "action": "general_chat",
        "message": "✅ Response generated",
        "output": response
    }


def run_agent(transcription: str, session_history: list = None, pending_approval: dict = None) -> dict:
    """
    Main agent pipeline.
    Returns a result dict with keys: transcription, intents, actions, results, needs_approval
    """
    if not transcription or not transcription.strip():
        return {"error": "Empty transcription — please speak clearly or check your audio."}
    
    session_history = session_history or []
    
    # Build session context string
    session_context = "\n".join([
        f"[{h['role']}]: {h['content']}" for h in session_history[-6:]  # last 3 turns
    ])
    
    # Step 1: Classify intent
    try:
        intent_data = classify_intent(transcription)
    except Exception as e:
        return {"error": f"Intent classification failed: {e}"}
    
    intents = intent_data.get("intents", ["general_chat"])
    entities = intent_data.get("entities", {})
    confidence = intent_data.get("confidence", 0.5)
    
    # Step 2: Human-in-the-loop for file operations
    file_intents = {"create_file", "write_code"}
    needs_file_op = any(i in file_intents for i in intents)
    
    if needs_file_op and pending_approval is None:
        # Return approval request
        return {
            "transcription": transcription,
            "intents": intents,
            "entities": entities,
            "confidence": confidence,
            "needs_approval": True,
            "approval_message": f"⚠️ This will create/modify files in the `output/` folder. Proceed?",
            "pending_data": {"transcription": transcription, "intents": intents, "entities": entities}
        }
    
    # Step 3: Execute tools for each intent
    results = []
    for intent in intents:
        try:
            if intent == "create_file":
                r = execute_create_file(entities)
            elif intent == "write_code":
                r = execute_write_code(entities, transcription)
            elif intent == "summarize":
                r = execute_summarize(entities, transcription, session_context)
            elif intent == "general_chat":
                r = execute_general_chat(transcription, session_context)
            else:
                r = execute_general_chat(transcription, session_context)
            results.append(r)
        except Exception as e:
            results.append({"action": intent, "error": str(e), "message": f"❌ Failed: {e}"})
    
    return {
        "transcription": transcription,
        "intents": intents,
        "entities": entities,
        "confidence": confidence,
        "results": results,
        "needs_approval": False
    }