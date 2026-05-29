from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

app = FastAPI()

# -------------------------
# SECURITY LAYER
# -------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-username.github.io",  # lock later to your Pages
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# -------------------------
# RATE LIMIT (simple in-memory)
# -------------------------
request_log = {}

def rate_limited(ip: str, limit=30):
    now = time.time()
    window = 60  # 1 minute window

    if ip not in request_log:
        request_log[ip] = []

    # remove old requests
    request_log[ip] = [t for t in request_log[ip] if now - t < window]

    if len(request_log[ip]) >= limit:
        return True

    request_log[ip].append(now)
    return False

# -------------------------
# PRIVATE ENGINE WRAPPER (SIMULATED)
# -------------------------
def engine_compute():
    """
    NEVER expose internal logic here.
    This is your private repo integration point.
    """
    return {
        "risk_series": [0.2, 0.35, 0.5, 0.4],
        "health": [90, 80, 65, 70],
        "nodes": ["A", "B", "C", "D"],
        "status": "stable"
    }

# -------------------------
# PUBLIC ENDPOINT
# -------------------------
@app.get("/status")
async def status(request: Request):

    ip = request.client.host

    if rate_limited(ip):
        return {"error": "rate_limit_exceeded"}

    data = engine_compute()

    # SANITIZATION LAYER (CRITICAL)
    return {
        "risk_series": data["risk_series"],
        "health": data["health"],
        "nodes": data["nodes"],
        "status": data["status"]
    }

# -------------------------
# SIMULATION ENDPOINT
# -------------------------
@app.post("/simulate")
async def simulate(payload: dict, request: Request):

    ip = request.client.host

    if rate_limited(ip):
        return {"error": "rate_limit_exceeded"}

    # DO NOT expose computation
    return {
        "result": "ok",
        "summary": "simulation executed",
        "confidence": 0.74
    }
