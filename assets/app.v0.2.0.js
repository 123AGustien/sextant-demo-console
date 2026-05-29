const WS_URL = "ws://localhost:8000/stream"; 
// later: replace with wss://your-backend-url

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
// FAKE STREAM (FALLBACK MODE)
// -------------------------
function startFakeStream() {
  setInterval(() => {
    const fakeData = {
      status: getRandomStatus(),
      nodes: Array.from({ length: 6 }, () => Math.random() * 100)
    };

    updateDashboard(fakeData);
  }, 1000);
}

function getRandomStatus() {
  const states = ["STABLE", "DEGRADED", "CRITICAL", "FAILURE"];
  return states[Math.floor(Math.random() * states.length)];
}

// -------------------------
// START SYSTEM
// -------------------------
initChart();

// Try backend first, fallback to fake mode
try {
  connectWebSocket();
} catch (e) {
  startFakeStream();
}

// -------------------------
// WEBSOCKET (future-ready)
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
    console.log("WebSocket closed. Switching to fallback...");
    startFakeStream();
  };

  ws.onerror = () => {
    console.log("WebSocket error. Using fallback mode.");
    startFakeStream();
  };
}
