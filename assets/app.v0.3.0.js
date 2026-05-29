const WS_URL = "ws://localhost:8000/stream";

let chart;
let cy;

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
// UPDATE DASHBOARD
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
// FAKE STREAM (SAFE FALLBACK)
// -------------------------
function startFakeStream() {
  setInterval(() => {
    const fakeData = {
      status: getRandomStatus(),
      nodes: Array.from({ length: 6 }, () => Math.random() * 100)
    };

    updateDashboard(fakeData);

    // Update node colors based on health
    if (cy) {
      cy.nodes().forEach(n => {
        const val = Math.random() * 100;

        if (val > 70) {
          n.style("background-color", "#00ffe1");
        } else if (val > 40) {
          n.style("background-color", "#facc15");
        } else {
          n.style("background-color", "#ef4444");
        }
      });
    }

  }, 1000);
}

function getRandomStatus() {
  const states = ["STABLE", "DEGRADED", "CRITICAL", "FAILURE"];
  return states[Math.floor(Math.random() * states.length)];
}

// -------------------------
// DEPENDENCY GRAPH (C STEP)
// -------------------------
function initGraph() {
  cy = cytoscape({
    container: document.getElementById('network'),

    elements: [
      { data: { id: 'A' } },
      { data: { id: 'B' } },
      { data: { id: 'C' } },
      { data: { id: 'D' } },
      { data: { id: 'E' } },
      { data: { id: 'F' } },

      { data: { source: 'A', target: 'B' } },
      { data: { source: 'A', target: 'C' } },
      { data: { source: 'B', target: 'C' } },
      { data: { source: 'D', target: 'A' } },
      { data: { source: 'E', target: 'B' } },
      { data: { source: 'F', target: 'E' } }
    ],

    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#00ffe1',
          'label': 'data(id)',
          'color': '#ffffff',
          'font-size': 12
        }
      },
      {
        selector: 'edge',
        style: {
          'line-color': '#334155',
          'width': 2
        }
      }
    ],

    layout: {
      name: 'grid'
    }
  });
}

// -------------------------
// START SYSTEM
// -------------------------
initChart();
initGraph();
startFakeStream();
