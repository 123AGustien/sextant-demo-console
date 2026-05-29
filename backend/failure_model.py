import random

# -------------------------
# SYSTEM TOPOLOGY (GRAPH)
# -------------------------
# Each node depends on others
DEPENDENCIES = {
    "A": ["B", "C"],
    "B": ["C"],
    "C": [],
    "D": ["A", "C"],
    "E": ["B", "D"],
    "F": ["E"]
}

# -------------------------
# INITIAL NODE STATES
# -------------------------
NODE_STATE = {
    "A": 100,
    "B": 100,
    "C": 100,
    "D": 100,
    "E": 100,
    "F": 100
}

# -------------------------
# RANDOM FAILURE INJECTION
# -------------------------
def inject_failure():
    node = random.choice(list(NODE_STATE.keys()))
    drop = random.randint(10, 30)
    NODE_STATE[node] -= drop
    NODE_STATE[node] = max(0, NODE_STATE[node])


# -------------------------
# CASCADING FAILURE LOGIC
# -------------------------
def propagate_failures():
    for node, deps in DEPENDENCIES.items():

        if not deps:
            continue

        dependency_health = sum([NODE_STATE[d] for d in deps]) / len(deps)

        # if dependencies are weak → this node degrades
        if dependency_health < 50:
            NODE_STATE[node] -= random.randint(5, 15)

        # recovery drift
        NODE_STATE[node] += random.randint(-2, 5)

        # clamp values
        NODE_STATE[node] = max(0, min(100, NODE_STATE[node]))


# -------------------------
# SYSTEM STATUS ENGINE
# -------------------------
def get_system_status():
    avg = sum(NODE_STATE.values()) / len(NODE_STATE)

    if avg > 75:
        return "STABLE"
    elif avg > 50:
        return "DEGRADED"
    elif avg > 25:
        return "CRITICAL"
    else:
        return "FAILURE"


# -------------------------
# EXPORT SYSTEM SNAPSHOT
# -------------------------
def get_state():
    return {
        "status": get_system_status(),
        "nodes": NODE_STATE,
    }


# -------------------------
# UPDATE CYCLE (CALL THIS)
# -------------------------
def step():
    inject_failure()
    propagate_failures()
    return get_state()
