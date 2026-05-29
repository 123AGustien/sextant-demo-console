const WS_URL = "ws://localhost:8000/stream";

let chart;
let cy;

// -------------------------
// HISTORY + INCIDENT LOGS
// -------------------------
let history = [];
let incidentLog = [];

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
// AI RISK ENGINE (IMPROVED INPUT)
// -------------------------
function predictFailure(nodes, history) {
  const avg = nodes.reduce((a, b) => a + b, 0) / nodes.length;

  let trend = 0;

  if (history.length > 5) {
    const last = history.slice(-5);

    const firstAvg = last[0].nodes.reduce((a,b)=>a+b,0)/last[0].nodes.length;
    const lastAvg = last[last.length-1].nodes.reduce((a,b)=>a+b,0)/last[last.length-1].nodes.length;

    trend = firstAvg - lastAvg;
  }

  let variance = 0;
  for (let i = 1; i < nodes.length; i++) {
    variance += Math.abs(nodes[i] - nodes[i - 1]);
  }

  variance = variance / nodes.length;

  let risk =
    (100 - avg) * 0.5 +
    trend * 2 +
    variance * 0.8;

  return Math.max(0, Math.min(100, risk));
}

// -------------------------
// INCIDENT GENERATOR
// -------------------------
function generateIncident(risk, status) {
  if (risk < 40) return null;

  let severity = "LOW";

  if (risk > 70) severity = "CRITICAL";
  else if (risk > 55) severity = "HIGH";
  else severity = "MEDIUM";

  return {
    time: new Date().toISOString(),
    severity,
    status,
    message: `System instability detected (${severity})`
  };
}

// -------------------------
// UPDATE DASHBOARD
// -------------------------
function updateDashboard(data) {

  const risk = predictFailure(data.nodes, history);

  // store history
  history.push({
    time: Date.now(),
    nodes: [...data.nodes],
    status: data.status
  });

  if (history.length > 50) history.shift();

  // INCIDENT LOGIC
  const incident = generateIncident(risk, data.status);

  if (incident) {
    incidentLog.unshift(incident);
    if (incidentLog.length > 20) incidentLog.pop();
  }

  // UI
  const panel = document.getElementById("status-panel");

  panel.innerHTML =
    "System Status: " + data.status +
    "<br>Predicted Risk: " + risk.toFixed(1) + "%" +
    "<br>Incident Level: " + (incident ? incident.severity : "NONE");

  if (risk > 70) panel.style.color = "#ef4444";
  else if (risk > 40) panel.style.color = "#facc15";
  else panel.style.color = "#00ffe1";

  // Chart update
  const value =
    data.nodes.reduce((a, b) => a + b, 0) / data.nodes.length;

  chart.data.labels.push(Date.now());
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();

  // Graph coloring
  if (cy) {
    cy.nodes().forEach(n => {
      const val = Math.random() * 100;

      if (val > 70) n.style("background-color", "#00ffe1");
      else if (val > 40) n.style("background-color", "#facc15");
      else n.style("background-color", "#ef4444");
    });
  }

  renderIncidentLog();
}

// -------------------------
// INCIDENT LOG RENDER
// -------------------------
function renderIncidentLog() {
  const panel = document.getElementById("incident-panel");

  if (!panel) return;

  panel.innerHTML = incidentLog.map(i =>
    `<div style="margin-bottom:6px;">
      [${i.severity}] ${i.time}<br>
      ${i.message}
    </div>`
  ).join("");
}

// -------------------------
// RANDOM STREAM (BACKEND)
// -------------------------
function startLiveStream() {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    updateDashboard(data);
  };

  ws.onopen = () => console.log("Live stream connected");

  ws.onclose = () => {
    console.log("Reconnecting...");
    setTimeout(startLiveStream, 2000);
  };
}

// -------------------------
// INIT
// -------------------------
initChart();
startLiveStream();
