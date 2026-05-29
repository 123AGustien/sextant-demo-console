async function loadData() {
  try {
    const res = await fetch("./data/demo.json");

    if (!res.ok) {
      throw new Error("Failed to load demo.json");
    }

    return await res.json();
  } catch (err) {
    console.error("Load error:", err);

    return {
      status: "OFFLINE",
      nodes: []
    };
  }
}

function renderDashboard(data) {
  const statusPanel = document.getElementById("status-panel");

  statusPanel.innerHTML =
    "System Status: " + data.status;

  console.log("Graph data:", data.nodes);
}

// SAFE BOOTSTRAP
(async function init() {
  const data = await loadData();
  renderDashboard(data);
})();
