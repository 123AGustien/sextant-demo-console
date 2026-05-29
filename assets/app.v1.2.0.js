// =========================
// DIGITAL TWIN + LEARNING AI
// =========================

let history = [];
let failureMemory = {}; // 🧠 learned failure frequency map

// -------------------------
// NODES (DIGITAL TWIN)
// -------------------------
const NODES = {
  A: { name: "API Gateway", health: 100 },
  B: { name: "Database", health: 100 },
  C: { name: "Auth Service", health: 100 },
  D: { name: "Cache Layer", health: 100 },
  E: { name: "Queue System", health: 100 },
  F: { name: "Analytics Engine", health: 100 }
};

// -------------------------
// FAILURE SIMULATION STEP
// -------------------------
function evolve() {
  for (const id in NODES) {
    let n = NODES[id];

    // random degradation
    n.health += Math.random() * 6 - 3;

    // clamp
    n.health = Math.max(0, Math.min(100, n.health));

    // record weak behavior into memory
    if (n.health < 40) {
      failureMemory[id] = (failureMemory[id] || 0) + 1;
    }
  }
}

// -------------------------
// AI RISK ENGINE (LEARNING BASED)
// -------------------------
function predictRisk() {
  let total = 0;
  let weighted = 0;

  for (const id in NODES) {
    const h = NODES[id].health;

    const memoryBias = failureMemory[id] || 0;

    // learned weighting (key upgrade)
    const riskScore =
      (100 - h) * (1 + memoryBias * 0.1);

    total += riskScore;
    weighted += (100 - h);
  }

  let risk = (total / Object.keys(NODES).length);

  return Math.max(0, Math.min(100, risk));
}

// -------------------------
// ROOT CAUSE (LEARNED PRIORITY)
// -------------------------
function findRootCause() {
  let worst = null;

  for (const id in NODES) {
    const h = NODES[id].health;
    const memoryBias = failureMemory[id] || 0;

    const score = (100 - h) + memoryBias * 5;

    if (!worst || score > worst.score) {
      worst = { id, score };
    }
  }

  return worst.id;
}

// -------------------------
// UPDATE LOOP
// -------------------------
function update() {

  evolve();

  const risk = predictRisk();
  const root = findRootCause();

  history.push({
    time: Date.now(),
    risk,
    root,
    snapshot: JSON.parse(JSON.stringify(NODES))
  });

  if (history.length > 100) history.shift();

  // UI output
  console.log("RISK:", risk.toFixed(2), "ROOT:", root);

  // learning feedback display
  console.log("FAILURE MEMORY:", failureMemory);
}

// -------------------------
// SIMULATION LOOP
// -------------------------
setInterval(update, 1000);
