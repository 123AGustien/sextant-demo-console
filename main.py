from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import random

app = FastAPI()

# -------------------------
# CORS (LOCK THIS LATER)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-username.github.io",  # replace with your Pages URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# SIMPLE RATE LIMIT (IN-MEMORY)
# -------------------------
request_log = {}

def rate_limited(ip: str, limit=30):
    now = time.time()
    window = 60

    if ip not in request_log:
        request_log[ip] = []

    request_log[ip] = [t for t in request_log[ip] if now - t < window]

    if len(request_log[ip]) >= limit:
        return True

    request_log[ip].append(now)
    return False

# -------------------------
# PRIVATE ENGINE PLACEHOLDER
# (Replace with your real engine later)
# -------------------------
def engine_compute():
    return {
        "risk": round(random.uniform(0.2, 0.9), 2),
        "health": round(random.uniform(60, 100), 1),
        "status": "stable"
    }

# -------------------------
# REST ENDPOINT
# -------------------------
@app.get("/status")
def status(request: Request):

    ip = request.client.host

    if rate_limited(ip):
        return {"error": "rate_limit_exceeded"}

    data = engine_compute()

    # SANITIZED OUTPUT ONLY
    return {
        "risk": data["risk"],
        "health": data["health"],
        "status": data["status"]
    }

# -------------------------
# SIMULATION ENDPOINT
# -------------------------
@app.post("/simulate")
def simulate(request: Request, payload: dict):

    ip = request.client.host

    if rate_limited(ip):
        return {"error": "rate_limit_exceeded"}

    return {
        "result": "ok",
        "summary": "simulation complete",
        "confidence": round(random.uniform(0.6, 0.9), 2)
    }

# -------------------------
# REAL-TIME WEBSOCKET STREAM
# -------------------------
@app.websocket("/ws/live")
async def live_stream(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:

            # Simulated engine output (replace later with real engine call)
            data = {
                "risk": round(random.uniform(0.2, 0.9), 2),
                "health": round(random.uniform(60, 100), 1),
                "status": "stable"
            }

            await websocket.send_json(data)

            # stream interval (1–2 seconds)
            await asyncio.sleep(2)

    except Exception:
        await websocket.close()
