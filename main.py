from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from stream_engine import stream_loop

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://123agustien.github.io"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.websocket("/stream")
async def stream(websocket: WebSocket):
    await stream_loop(websocket)
