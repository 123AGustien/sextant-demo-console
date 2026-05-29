const WS_URL = "ws://localhost:8000/stream";

let ws;

// -------------------------
// CONNECT WEBSOCKET
// -------------------------
function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("Connected to Early Warning Backend");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateUI(data);
  };

  ws.onclose = () => {
    console.log("Connection lost. Reconnecting...");
    setTimeout(connect, 2000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

// -------------------------
// UPDATE UI (CORE PRODUCT LOGIC)
// -------------------------
function updateUI(data) {

  // Risk score
  const riskEl = document.getElementById("risk");
  riskEl.innerText = data.risk + "%";

  // Status
  document.getElementById("status").innerText = data.status;

  // Root cause
  document.getElementById("root").innerText = data.root_cause;

  // ETA
  document.getElementById("eta").innerText = data.eta;

  // -------------------------
  // PRODUCT SIGNAL COLORING
  // -------------------------
  if (data.risk >
