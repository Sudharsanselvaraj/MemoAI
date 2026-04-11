import time

metrics = {
    "transcription": "",
    "intent": "",
    "action": "",
    "result": "",
    "tokens": {
        "prompt": 0,
        "completion": 0,
        "total": 0
    },
    "latency": 0,
    "pipeline": {
        "transcription": "idle",
        "intent": "idle",
        "tool": "idle",
        "response": "idle"
    },
    "memory": {
        "count": 0,
        "hits": 0,
        "misses": 0
    },
    "system": {
        "ollama": "running",
        "model": "loaded",
        "memory": "connected",
        "api": "healthy"
    },
    "history": [],
    "last_updated": ""
}

def update_history(command, status="success"):
    global metrics
    metrics["system"]["model"] = "loaded"
    metrics["system"]["memory"] = "connected"
    metrics["last_updated"] = time.strftime("%H:%M:%S")
    current_time = time.strftime("%H:%M")
    metrics["history"].insert(0, {
        "command": command,
        "timestamp": current_time,
        "status": status
    })
    # Keep only last 10
    metrics["history"] = metrics["history"][:10]
