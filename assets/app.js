async function loadData() {
  const res = await fetch("data/demo.json");
  return await res.json();
}

function renderDashboard(data) {
  document.getElementById("status-panel").innerHTML =
    "System Status: " + data.status;

  console.log("Graph data:", data.nodes);
}

loadData().then(renderDashboard);
