from fastapi import FastAPI, WebSocket, Request
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import time
import random

app = FastAPI()

# -------------------------
# CORS (LOCK TO YOUR DOMAIN)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://123agustien.github.io"
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
    window = 60  # seconds

    if ip not in request_log:
        request_log[ip] = []

    # remove old requests outside window
    request_log[ip] = [t for t in request_log[ip] if now - t < window]

    if len(request_log[ip]) >= limit:
        return True

    request_log[ip].append(now)
    return False


# -------------------------
# REST API ENDPOINT
# -------------------------
@app.get("/state")
async def get_state(request: Request):
    ip = request.client.host

    if rate_limited(ip):
        return {
            "status": "RATE_LIMITED",
            "nodes": []
        }

    return {
        "status": random.choice(["STABLE", "DEGRADED", "RECOVERING"]),
        "nodes": [
            random.randint(10, 100),
            random.randint(10, 100),
            random.randint(10, 100),
            random.randint(10, 100),
            random.randint(10, 100),
            random.randint(10, 100),
        ],
        "timestamp": time.time()
    }


# -------------------------
# WEBSOCKET STREAM (LIVE SYSTEM)
# -------------------------
@app.websocket("/stream")
async def stream(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            payload = {
                "status": random.choice(["STABLE", "DEGRADED", "RECOVERING"]),
                "nodes": [
                    random.randint(10, 100),
                    random.randint(10, 100),
                    random.randint(10, 100),
                    random.randint(10, 100),
                    random.randint(10, 100),
                    random.randint(10, 100),
                ],
                "timestamp": time.time()
            }

            await websocket.send_json(payload)
            await asyncio.sleep(1)

    except Exception:
        await websocket.close()
