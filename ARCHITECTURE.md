sextant-demo-console/
├── index.html
├── README.md
├── ARCHITECTURE.md
├── assets/
│   ├── app.js
│   └── styles.css
├── data/
│   └── system_state.json
└── backend/
    ├── main.py
    ├── stream_engine.py
    ├── failure_model.py
    └── requirements.txt

    
# Sextant Resilience Simulation Platform

## Overview

Sextant is a resilience simulation platform designed to model infrastructure degradation, dependency-driven failures, and recovery behaviour in distributed systems.

The platform demonstrates how interconnected components can experience cascading failures and how overall system health changes over time.

---

## System Architecture

Frontend (GitHub Pages)
        ↓
WebSocket Client
        ↓
FastAPI Stream Engine
        ↓
Failure Simulation Engine
        ↓
Dependency Graph Model

---

## Components

### Frontend

- HTML5 Dashboard
- Chart.js Visualisation
- Real-Time Status Display
- WebSocket Client

### Stream Engine

Responsible for:

- State generation
- Live event streaming
- WebSocket communications

### Failure Model

Responsible for:

- Dependency graph evaluation
- Failure propagation
- Recovery modelling
- System health scoring

---

## Dependency Model

Example topology:

A → B → C

D → A

E → B, D

F → E

Failures in upstream nodes may propagate to dependent nodes.

---

## Status Levels

| Status | Description |
|----------|-------------|
| STABLE | Healthy operation |
| DEGRADED | Reduced performance |
| CRITICAL | Severe impairment |
| FAILURE | System-wide collapse |

---

## Simulation Features

- Failure Injection
- Cascading Failure Propagation
- Recovery Drift
- Real-Time Telemetry
- Infrastructure Health Monitoring

---

## Intended Use

This project is intended as a resilience modelling and infrastructure simulation prototype for research, evaluation, and educational purposes.

It is not intended to represent production monitoring of real-world systems.
