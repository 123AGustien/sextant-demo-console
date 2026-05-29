from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow frontend only
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MOCK private engine call (replace later with real import)
def get_engine_metrics():
    return {
        "risk_series": [0.2, 0.4, 0.6, 0.5],
        "health": [90, 75, 60],
        "nodes": ["Node A", "Node B", "Node C"]
    }

@app.get("/status")
def status():
    return get_engine_metrics()

@app.post("/simulate")
def simulate(payload: dict):
    return {
        "result": "ok",
        "summary": "simulation complete",
        "risk": 0.63
    }
