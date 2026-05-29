import asyncio
import random
import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# -------------------------
# DEV SETUP (OPEN CORS FOR MVP)
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# INFRASTRUCTURE STATE
# -------------------------
nodes = {
    "API": 100,
    "DB": 100,
    "AUTH": 100,
    "CACHE": 100,
    "QUEUE": 100,
    "ANALYTICS": 100
}

# -------------------------
# SIMULATION ENGINE
# -------------------------
def simulate():
    global nodes

    for k in nodes:

        # failure pressure
        if random.random() < 0.12:
            nodes[k] -= random.randint(5, 20)

        # recovery chance
        if random.random() < 0.04:
            nodes[k] += random.randint(1, 8)

        # natural drift
        nodes[k] += random.randint(-2, 3)

        # clamp
        nodes[k] = max(0, min(100, nodes[k]))

    return nodes


# -------------------------
# RISK ENGINE (COMMERCIAL CORE)
# -------------------------
def risk_score(nodes):
    avg = sum(nodes.values()) / len(nodes)

    volatility = sum(abs(v - avg) for v in nodes.values()) / len(nodes)

    risk = (100 - avg) * 0.7 + volatility * 0.3

    return max(0, min(100, risk))


# -------------------------
# ROOT CAUSE (SIMPLE BUT EFFECTIVE)
# -------------------------
def root_cause(nodes):
    return min(nodes, key=nodes.get)


# -------------------------
# STATUS ENGINE
# -------------------------
def status(risk):
    if risk > 75:
        return "CRITICAL"
    elif risk > 50:
        return "DEGRADED"
    elif risk > 25:
        return "WARNING"
    else:
        return "STABLE"


# -------------------------
# ETA ESTIMATOR
# -------------------------
def eta(risk):
    if risk < 30:
        return "No risk"
    elif risk < 60:
        return "~15–30 min"
    elif risk < 80:
        return "~5–10 min"
    else:
        return "<5 min"


# -------------------------
# WEBSOCKET STREAM (MVP CORE)
# -------------------------
@app.websocket("/stream")
async def stream(ws: WebSocket):
    await ws.accept()

    try:
        while True:
            simulate()

            r = risk_score(nodes)
            root = root_cause(nodes)
            s = status(r)
            t = eta(r)

            payload = {
                "status": s,
                "risk": round(r, 2),
                "root_cause": root,
                "eta": t,
                "nodes": nodes,
                "timestamp": time.time()
            }

            await ws.send_json(payload)
            await asyncio.sleep(1)

    except Exception:
        await ws.close()
