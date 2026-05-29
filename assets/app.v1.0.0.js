const WS_URL = "ws://localhost:8000/stream";

let chart;
let cy;

// -------------------------
// DIGITAL TWIN STATE
// -------------------------
const NODES = {
  A: { name: "API Gateway", cpu: 60, mem: 50, health: 100 },
  B: { name: "Database", cpu: 70, mem: 80, health: 100 },
  C: { name: "Auth Service", cpu: 40, mem: 30, health: 100 },
  D: { name: "Cache Layer", cpu: 30, mem: 20, health: 100 },
  E: { name: "Queue System", cpu: 50, mem: 60, health: 100 },
  F: { name: "Analytics Engine", cpu: 65, mem: 70, health: 100 }
};

// -------------------------
// DEPENDENCY GRAPH
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
// DIGITAL TWIN EVOLUTION ENGINE
// -------------------------
function evolveNode(node) {
  // CPU pressure
  node.cpu += (Math.random() * 10 - 5);

  // memory drift
  node.mem += (Math.random() * 8 - 4);

  // dependency pressure effect
  const dependencyLoad = (node.cpu + node.mem) / 2;

  if (dependencyLoad > 80) node.health -= 3;
  else if (dependencyLoad > 60) node.health -= 1;
  else node.health += 0.5;

  // clamp values
  node.cpu = Math.max(0, Math.min(100, node.cpu));
  node.mem = Math.max(0, Math.min(100, node.mem));
  node.health = Math.max(0, Math.min(100, node.health));
}

// -------------------------
// SYSTEM EVOLUTION STEP
// -------------------------
function stepTwin() {
  Object.values(NODES).forEach(evolveNode);

  // dependency propagation
  for (const [node, deps] of Object.entries(DEPENDENCIES)) {
    let pressure = 0;

    deps.forEach(d => {
      pressure += (100 - NODES[d].health);
    });

    if (pressure > 100) {
      NODES[node].health -= 2;
    }
  }
}

// -------------------------
// AI RISK ENGINE
// -------------------------
function predictFailure() {
  const values = Object.values(NODES);

  const avgHealth =
    values.reduce((a, b) => a + b.health, 0) / values.length;

  const cpuAvg =
    values.reduce((a, b) => a + b.cpu, 0) / values.length;

  let risk =
    (100 - avgHealth) * 0.6 +
    (cpuAvg - 50) * 0.4;

  return Math.max(0, Math.min(100, risk));
}

// -------------------------
// ROOT CAUSE DETECTION
// -------------------------
function findRootCause() {
  let weakest = null;

  for (const [id, node] of Object.entries(NODES)) {
    if (!weakest || node.health < weakest.health) {
      weakest = { id, ...node };
    }
  }

  return weakest.id;
}

// -------------------------
// UPDATE DASHBOARD
// -------------------------
function updateDashboard() {

  stepTwin();

  const risk = predictFailure();
  const root = findRootCause();

  const panel = document.getElementById("status-panel");

  panel.innerHTML =
    "DIGITAL TWIN MODE<br>" +
    "Risk: " + risk.toFixed(1) + "%<br>" +
    "Root System Stress: " + root + "<br>" +
    "API: " + NODES.A.health.toFixed(1) +
    " | DB: " + NODES.B.health.toFixed(1) +
    " | AUTH: " + NODES.C.health.toFixed(1);

  panel.style.color =
    risk > 70 ? "#ef4444" :
    risk > 40 ? "#facc15" :
    "#00ffe1";

  const systemLoad =
    Object.values(NODES).reduce((a, b) => a + b.cpu, 0) / Object.keys(NODES).length;

  chart.data.labels.push(Date.now());
  chart.data.datasets[0].data.push(systemLoad);

  if (chart.data.labels.length > 30) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }

  chart.update();

  updateGraph();
}

// -------------------------
// GRAPH UPDATE
// -------------------------
function updateGraph() {
  if (!cy) return;

  cy.nodes().forEach(n => {
    const id = n.id();
    const health = NODES[id].health;

    n.style("background-color",
      health > 70 ? "#00ffe1" :
      health > 40 ? "#facc15" :
      "#ef4444"
    );
  });
}

// -------------------------
// INIT GRAPH
// -------------------------
function initGraph() {
  cy = cytoscape({
    container: document.getElementById("network"),

    elements: Object.keys(NODES).map(id => ({
      data: { id }
    })).concat(
      Object.entries(DEPENDENCIES).flatMap(([src, deps]) =>
        deps.map(d => ({ data: { source: src, target: d } }))
      )
    ),

    style: [
      {
        selector: "node",
        style: {
          "label": "data(id)",
          "color": "#fff",
          "background-color": "#00ffe1"
        }
      },
      {
        selector: "edge",
        style: {
          "line-color": "#334155"
        }
      }
    ],

    layout: { name: "grid" }
  });
}

// -------------------------
// START SYSTEM
// -------------------------
function start() {
  initChart();
  initGraph();

  setInterval(updateDashboard, 1000);
}

start();
