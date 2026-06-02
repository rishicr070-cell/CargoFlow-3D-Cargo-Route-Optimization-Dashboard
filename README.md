# CargoFlow 🚢

> **Graph-Based Cargo Logistics Optimization System**  
> A DAA (Design and Analysis of Algorithms) project implementing Dijkstra's shortest path, BFS/DFS traversal, and MST algorithms on a real cargo logistics network — visualized in an interactive 3D Earth globe dashboard.

---

## ✨ Demo Preview

| Feature | Description |
|---|---|
| 🌍 3D Globe | Native Three.js interactive 3D Earth sphere with 43 real-world ports and 75 shipping lanes |
| ⚡ Dijkstra | Animated shortest path with glowing arcs, flowing ship particles, and accurate nautical miles |
| 🔍 Node Inspector | Click any port to see TEU capacity, congestion, processing time, and geographic coordinates |
| 📊 Live Metrics | Network density, average TEU cost in ₹ (INR), congestion level — always live |
| ⚠️ Scenarios | Block chokepoints (e.g., Suez Canal) to simulate failures and see alternate routes instantly |

---

## 🗂️ Project Structure

```
Cargoshield DAA/
├── backend/                    ← Python FastAPI Server
│   ├── main.py                 ← All REST API route handlers
│   ├── graph.py                ← Graph loader + adjacency list builder
│   ├── requirements.txt        ← Python dependencies
│   ├── start_backend.bat       ← One-click backend launcher (Windows)
│   ├── algorithms/
│   │   ├── dijkstra.py         ← Dijkstra using heapq (priority queue)
│   │   └── scenario.py         ← In-memory node blocking & congestion
│   └── data/
│       ├── nodes.json          ← 43 real-world global maritime ports
│       └── edges.json          ← 75 real-world shipping lanes with nautical distances
│
└── frontend/                   ← React + Vite Application
    ├── index.html
    ├── vite.config.js          ← Vite config + /api proxy to FastAPI
    ├── start_frontend.bat      ← One-click frontend launcher (Windows)
    └── src/
        ├── App.jsx             ← Main CSS grid layout shell
        ├── index.css           ← Full vanilla CSS design system
        ├── main.jsx            ← React entry point
        ├── api/
        │   └── client.js       ← Axios HTTP client
        ├── store/
        │   └── useStore.js     ← Zustand global state
        ├── utils/
        │   └── nodeColors.js   ← Node type → color/icon mapping
        └── components/
            ├── Graph3D.jsx         ← Custom Three.js 3D Globe visualization
            ├── TopBar.jsx          ← Header bar
            ├── Sidebar.jsx         ← Navigation + legend
            ├── AlgorithmControls.jsx  ← Source / target / weight dropdowns
            ├── NodeDetailPanel.jsx    ← Clicked node properties
            ├── RouteResultPanel.jsx   ← Dijkstra result + path sequence
            ├── MetricsCards.jsx       ← Bottom metrics bar
            └── ScenarioPanel.jsx      ← Block / unblock nodes
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Required Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 8+ |

---

### Step 1 — Start the Backend

```powershell
cd "d:\Projects\Cargoshield DAA\backend"

# Install Python dependencies (first time only)
pip install fastapi uvicorn[standard]

# Start the server
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Or just double-click **`backend/start_backend.bat`**

✅ Backend is running at: **http://localhost:8000**  
📖 Swagger API docs at: **http://localhost:8000/docs**

---

### Step 2 — Start the Frontend

```powershell
cd "d:\Projects\Cargoshield DAA\frontend"

# Install Node dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

Or just double-click **`frontend/start_frontend.bat`**

✅ Frontend is running at: **http://localhost:5173**

> **Note:** Both servers must be running at the same time. The Vite dev server proxies all `/api/*` requests to the FastAPI backend automatically.

---

## 🧮 Algorithms Implemented

### ⚡ Dijkstra's Shortest Path — `Phase 1`
Finds the minimum-cost (or minimum-distance / minimum-time) route between any two global ports.

- **Data structure:** Min-heap priority queue (`heapq`)
- **Weight modes:** `cost` (INR/TEU), `distance` (Nautical Miles), or `travel_time` (Hours)
- **Congestion handling:** `effective_weight = base_weight × congestion_multiplier`
- **Time complexity:** O(E log V)
- **Space complexity:** O(V + E)

```
V = 43 ports   →   O(75 × log 43) ≈ 405 operations
```

### 🔍 BFS / DFS — `Phase 2`
Connectivity analysis and node reachability across the cargo network.

### 🕸️ Prim's / Kruskal's MST — `Phase 2`
Minimum spanning tree — finds the lowest-cost way to connect all hubs.

---

## 🗄️ Data Model

### Node Properties
```json
{
  "node_id": "IN-JNP",
  "node_name": "JNPT (Nhava Sheva)",
  "node_type": "Major Port",
  "capacity": 7500000,
  "congestion_level": 0.4,
  "processing_time": 48,
  "status": "active",
  "lat": 18.944,
  "lng": 72.953
}
```

### Edge Properties
```json
{
  "edge_id": "E01",
  "source": "IN-JNP",
  "target": "AE-JEA",
  "distance": 1060,
  "travel_time": 62,
  "cost": 49800,
  "capacity": 10000,
  "congestion_weight": 1.1,
  "edge_status": "active"
}
```

### Node Types
| Type | Color |
|---|---|
| Major Port | 🔵 Blue |
| Transshipment Hub | 🟣 Purple |
| Riverine Port | 🟢 Emerald |
| Chokepoint | 🔴 Red |

---

## 🌐 REST API Endpoints

**Base URL:** `http://localhost:8000`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/graph` | Full graph (nodes + edges + scenario state) |
| `GET` | `/node/{id}` | Single node details |
| `GET` | `/metrics` | Network summary statistics |
| `POST` | `/algorithm/dijkstra` | Run shortest path |
| `POST` | `/scenario/block-node` | Disable a node (simulate failure) |
| `POST` | `/scenario/unblock-node` | Re-enable a blocked node |
| `POST` | `/scenario/update-edge` | Change edge congestion weight |
| `POST` | `/scenario/reset` | Reset all scenario changes |
| `GET` | `/scenario` | Current scenario state |

### Example — Run Dijkstra

```bash
curl -X POST http://localhost:8000/algorithm/dijkstra \
  -H "Content-Type: application/json" \
  -d '{"source": "IN-JNP", "target": "NL-RTM", "weight": "cost"}'
```

**Response:**
```json
{
  "path": ["IN-JNP", "ZA-CPT", "NL-RTM"],
  "edges": ["E05", "E75"],
  "total_cost": 415000,
  "total_distance": 10300.0,
  "total_time": 606.0,
  "reachable": true,
  "path_info": [
    { "node_id": "IN-JNP", "node_name": "JNPT (Nhava Sheva)", "node_type": "Major Port" },
    ...
  ]
}
```

---

## 🎨 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | Component-based UI |
| Vite 8 | Dev server + bundler |
| Three.js | Native WebGL 3D Earth Globe rendering |
| Zustand | Global state management |
| Axios | HTTP API client |
| Vanilla CSS | Custom dark theme design system |
| Google Fonts (Inter) | Typography |

### Backend
| Technology | Purpose |
|---|---|
| Python 3.14 | Runtime |
| FastAPI 0.136 | REST API framework |
| Uvicorn 0.48 | ASGI server |
| Pydantic 2.13 | Request validation |
| `heapq` (stdlib) | Min-heap for Dijkstra |

---

## 🖥️ Dashboard Layout

```
┌──────────────────────────────────────────────────────┐
│  🔷 CargoFlow    ● Dataset Loaded   ⚡ Dijkstra Active │  ← Top Bar
├──────────┬───────────────────────────┬───────────────┤
│ ◈ Overview │                           │  [Algorithm]  │
│ ⬡ 3D Graph │                           │  Source  ▾    │
│ ⚡ Algorithm│        3D GLOBE           │  Target  ▾    │
│ ⚠ Scenario │    (interactive scene)    │  Weight  ▾    │
│            │                           │  [Run ⚡]     │
│  LEGEND    │                           │               │
│  ● Major   │                           │  Route Result │
│  ● Trans.  │                           │  ₹415,000     │
│  ...       │                           │  JNP→CPT→...  │
├──────────┴───────────────────────────┴───────────────┤
│  Metrics │ 43 Ports │ 75 Routes │ ₹90,267 Avg │ 8.31% │  ← Bottom Bar
└──────────────────────────────────────────────────────┘
```

---

## 🎬 Phase Plan

### ✅ Phase 1 — Complete
- [x] 43-node, 75-edge real-world global cargo logistics dataset
- [x] Python FastAPI backend with REST API
- [x] Dijkstra's algorithm with congestion weights
- [x] Custom interactive Three.js 3D Earth globe visualization
- [x] Animated shortest path highlighting (particles) along geographic curves
- [x] Node detail inspector panel
- [x] Live metrics cards (with INR ₹ formatting)
- [x] Scenario simulation (block nodes + re-route)

### 🔲 Phase 2 — Planned
- [ ] BFS / DFS traversal and reachability analysis
- [ ] Prim's / Kruskal's minimum spanning tree
- [ ] Edge congestion simulation panel
- [ ] Algorithm comparison charts (Recharts)
- [ ] Improved animations and visual polish
- [ ] Final documentation + complexity report

---

## 📚 References

- [Dijkstra's Algorithm — GeeksForGeeks](https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/)
- [Three.js Documentation](https://threejs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Prim's MST — GeeksForGeeks](https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/)

---

## 👤 Author

**CargoFlow** — DAA Project  
Inspired by CargoShield logistics optimization system.  
Built with Python FastAPI + React Three.js for interactive geographic globe visualization.

---

*"Turning complex cargo networks into beautiful, optimizable graphs."*
