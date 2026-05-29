let t = 0;

async function loadData() {
  try {
    const res = await fetch("./data/demo.json");
    if (!res.ok) throw new Error("Load failed");
    return await res.json();
  } catch (e) {
    return { status: "OFFLINE", nodes: [] };
  }
}

function simulate(nodes) {
  t++;

  return nodes.map(n => {
    const drift = Math.sin(t / 5) * 10;
    const noise = Math.random() * 5;
    return Math.max(0, n + drift + noise);
  });
}

function render(data) {
  const statusPanel = document.getElementById("status-panel");

  const state = simulate(data.nodes);

  const avg = state.reduce((a, b) => a + b, 0) / state.length;

  const status = avg > 60 ? "DEGRADED" : "STABLE";

  statusPanel.innerHTML =
    "System Status: " + status;

  console.log("Live nodes:", state);
}

async function loop() {
  const data = await loadData();

  setInterval(() => {
    render(data);
  }, 1000);
}

loop();
