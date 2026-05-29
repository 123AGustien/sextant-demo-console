import asyncio
import time
from fastapi import WebSocket
from failure_model import step  # 👈 single source of truth


# -------------------------
# STREAM ENGINE (CLEAN)
# -------------------------
async def stream_loop(websocket: WebSocket):
    await websocket.accept()

    try:
        while True:
            state = step()  # 👈 now uses REAL failure model

            payload = {
                "status": state["status"],
                "nodes": list(state["nodes"].values()),
                "timestamp": time.time()
            }

            await websocket.send_json(payload)

            await asyncio.sleep(1)

    except Exception:
        await websocket.close()
