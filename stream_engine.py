import random
import time
import asyncio
from fastapi import FastAPI, WebSocket

app = FastAPI()

# -------------------------
# FAILURE SIMULATION STATE
# -------------------------
nodes = [100, 95, 90, 85, 80, 75]

def simulate_failure(nodes):
    new_nodes = []

    for n in nodes:
        # random failure chance
        if random.random() < 0.1:
            n -= random.randint(5, 20)   # failure event

        # recovery chance
        elif random.random() < 0.05:
            n += random.randint(1, 10)

        # natural drift
        n += random.randint(-3, 3)

        # clamp values
        n = max(0, min(100, n))

        new_nodes.append(n)

    return new_nodes


def system_status(nodes):
    avg = sum(nodes) / len(nodes)

    if avg > 75:
        return "STABLE"
    elif avg > 50:
        return "DEGRADED"
    elif avg > 25:
        return "CRITICAL"
    else:
        return "FAILURE"


# -------------------------
# WEBSOCKET STREAM
# -------------------------
@app.websocket("/stream")
async def stream(websocket: WebSocket):
    await websocket.accept()

    current_nodes = nodes

    try:
        while True:
            current_nodes = simulate_failure(current_nodes)

            payload = {
                "status": system_status(current_nodes),
                "nodes": current_nodes,
                "timestamp": time.time()
            }

            await websocket.send_json(payload)
            await asyncio.sleep(1)

    except Exception:
        await websocket.close()
