const WS_URL = "ws://localhost:8000/stream";

let chart;
let cy;

// -------------------------
// HISTORY STORE (NEW)
// -------------------------
let history = [];

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
// AI FAILURE PREDICTION
// -------------------------
function predictFailure(nodes) {
  const avg = nodes.reduce((a, b) => a + b, 0) / nodes.length;

  let risk = 0;

  if (avg < 80) risk += 10;
  if (avg < 60) risk += 20;
  if (avg < 40) risk += 30;

  risk += Math.random() * 20;

  return Math.min(100, Math.max(0, risk));
}

// -------------------------
// UPDATE DASHBOARD (LIVE)
// -------------------------
function updateDashboard(data) {
  const risk = predictFailure(data.nodes);

  // SAVE TO HISTORY (NEW)
  history.push({
    time: Date.now(),
    status: data.status,
    nodes: [...data.nodes],
    risk: risk
  });

  if (history.length > 50) {
    history.shift();
  }

  const panel = document.getElementById("status-panel");

  panel.innerHTML =
    "System Status: " + data.status +
    "<br>Predicted Failure Risk: " + risk.toFixed(1) + "%";

  // color system
  if (risk > 70) {
    panel.style.color = "#ef4444";
  } else if (risk > 40) {
    panel.style.color = "#facc15";
  } else {
    panel.style.color = "#00ffe1";
  }

  const value =
    data.nodes.reduce((a, b) => a + b, 0) / data.nodes.length;

  chart.data.labels.push(Date.now());
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();

  // GRAPH NODE COLOR UPDATE
  if (cy) {
