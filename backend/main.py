import asyncio
import random
import time
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow GitHub Pages frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # lock later in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

nodes = [100, 95, 90, 85, 80, 75]


def simulate():
    global nodes

    new_nodes = []

    for n in nodes:
        if random.random() < 0.15:
            n -= random.randint(5, 25)

        if random.random() < 0.05:
            n += random.randint(1, 10)

        n += random.randint(-3, 3)
        n = max(0, min(100, n))

        new_nodes.append(n)

    nodes = new_nodes
    return nodes


def status(nodes):
    avg = sum(nodes) / len(nodes)

    if avg > 75:
        return "STABLE"
    elif avg > 50:
        return "DEGRADED"
    elif avg > 25:
        return "CRITICAL"
    else:
        return "FAILURE"


@app.websocket("/stream")
async def stream(ws: WebSocket):
    await ws.accept()

    try:
        while True:
            data_nodes = simulate()

            payload = {
                "status": status(data_nodes),
                "nodes": data_nodes,
                "timestamp": time.time()
            }

            await ws.send_json(payload)
            await asyncio.sleep(1)

    except Exception:
        await ws.close()
