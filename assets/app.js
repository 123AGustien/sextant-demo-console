const WS_URL = "ws://localhost:8000/stream"; 
// ⚠️ later change to your deployed backend URL (wss://)

let chart;

// -------------------------
// INIT CHART
// -------------------------
function initChart() {
  const ctx = document.getElementById("graph").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "System Load",
        data: [],
        borderColor: "cyan",
        fill: false
      }]
    }
  });
}

// -------------------------
// UPDATE UI
// -------------------------
function updateDashboard(data) {
  document.getElementById("status-panel").innerHTML =
    "System Status: " + data.status;

  const value =
    data.nodes.reduce((a, b) => a + b, 0) / data.nodes.length;

  chart.data.labels.push(Date.now());
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();
}

// -------------------------
// CONNECT WEBSOCKET
// -------------------------
function connectWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("WebSocket connected");
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateDashboard(data);
  };

  ws.onclose = () => {
    console.log("WebSocket closed. Reconnecting...");
    setTimeout(connectWebSocket, 2000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };
}

// -------------------------
// START SYSTEM
// -------------------------
initChart();
connectWebSocket();
