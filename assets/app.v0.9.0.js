const WS_URL = "ws://localhost:8000/stream";

let chart;
let cy;

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
// AI FAILURE PREDICTION
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

  return Math.max(0, Math.min(100,
    (100 - avg) * 0.5 +
    trend * 2 +
    variance * 0.8
  ));
}

// -------------------------
// ROOT CAUSE ENGINE (NEW)
// -------------------------
function findRootCause(nodes) {
  const keys = ["A","B","C","D","E","F"];

  let weakestIndex = 0;
  let min = Infinity;

  nodes.forEach((v, i) => {
    if (v < min) {
      min = v;
      weakestIndex = i;
    }
  });

  return keys[weakestIndex];
}

// -------------------------
// DEPENDENCY GRAPH MAP
// -------------------------
const DEPENDENCIES = {
  A: ["B", "C"],
  B: ["C"],
  C: [],
  D: ["A", "C"],
  E: ["B", "D"],
  F: ["E"]
};

// -------------------------
// TRACE FAILURE PATH
// -------------------------
function traceFailurePath(root) {
  let path = [root];
  let current = root;

  while (DEPENDENCIES[current] && DEPENDENCIES[current].length > 0) {
    current = DEPENDENCIES[current][0];
    path.push(current);
  }

  return path;
}

// -------------------------
// ROOT CAUSE ANALYSIS
// -------------------------
function analyzeRootCause(nodes, risk) {
  const root = findRootCause(nodes);
  const path = traceFailurePath(root);

  let explanation = "";

  if (risk > 70) {
    explanation = "Severe cascade detected across dependency chain.";
  } else if (risk > 40) {
    explanation = "Localized instability propagating through system.";
  } else {
    explanation = "Minor fluctuations within acceptable bounds.";
  }

  return {
    root,
    path,
    explanation
  };
}

// -------------------------
// UPDATE DASHBOARD
// -------------------------
function updateDashboard(data) {

  const risk = predictFailure(data.nodes, history);
  const analysis = analyzeRootCause(data.nodes, risk);

  history.push({
    time: Date.now(),
    nodes: [...data.nodes],
    status: data.status
  });

  if (history.length > 50) history.shift();

  // INCIDENT GENERATION
  let incident = null;

  if (risk > 40) {
    incident = {
      time: new Date().toISOString(),
      severity: risk > 70 ? "CRITICAL" : "HIGH",
      root: analysis.root,
      path: analysis.path,
      explanation: analysis.explanation
    };

    incidentLog.unshift(incident);
    if (incidentLog.length > 20) incidentLog.pop();
  }

  // UI
  const panel = document.getElementById("status-panel");

  panel.innerHTML =
    "System Status: " + data.status +
    "<br>Risk: " + risk.toFixed(1) + "%" +
    "<br>Root Cause: " + analysis.root +
    "<br>Propagation Path: " + analysis.path.join(" → ") +
    "<br>Insight: " + analysis.explanation;

  panel.style.color =
    risk > 70 ? "#ef4444" :
    risk > 40 ? "#facc15" :
    "#00ffe1";

  // Chart
  const value =
    data.nodes.reduce((a, b) => a + b, 0) / data.nodes.length;

  chart.data.labels.push(Date.now());
  chart.data.datasets[0].data.push(value);

  if (chart.data.labels.length > 20) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();

  // Graph update
  if (cy) {
    cy.nodes().forEach(n => {
      const val = Math.random() * 100;

      n.style("background-color",
        val > 70 ? "#00ffe1" :
        val > 40 ? "#facc15" :
        "#ef4444"
      );
    });
  }
}

// -------------------------
// STREAM START
// -------------------------
function startLiveStream() {
  const ws = new WebSocket(WS_URL);

  ws.onmessage = (event) => {
    updateDashboard(JSON.parse(event.data));
  };

  ws.onopen = () => console.log("Connected");

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
