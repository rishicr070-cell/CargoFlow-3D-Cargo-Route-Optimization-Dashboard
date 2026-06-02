# CargoFlow 🚢

> **Graph-Based Cargo Logistics Optimization System**  
> A DAA (Design and Analysis of Algorithms) project implementing Dijkstra's shortest path, BFS/DFS traversal, and MST algorithms on a real cargo logistics network — visualized in an interactive 3D dashboard.

---

## ✨ Demo Preview

| Feature | Description |
|---|---|
| 🌐 3D Graph | Interactive force-directed graph with 35 nodes and 70 edges |
| ⚡ Dijkstra | Animated shortest path with glowing edges and flowing particles |
| 🔍 Node Inspector | Click any node to see capacity, congestion, processing time |
| 📊 Live Metrics | Network density, average cost, congestion level — always live |
| ⚠️ Scenarios | Block nodes to simulate failures and see alternate routes instantly |

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
│       ├── nodes.json          ← 35 logistics nodes
│       └── edges.json          ← 70 weighted edges
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
            ├── Graph3D.jsx         ← 3D visualization (react-force-graph-3d)
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
Finds the minimum-cost (or minimum-distance / minimum-time) route between any two nodes.

- **Data structure:** Min-heap priority queue (`heapq`)
- **Weight modes:** `cost`, `distance`, or `travel_time`
- **Congestion handling:** `effective_weight = base_weight × congestion_multiplier`
- **Time complexity:** O(E log V)
- **Space complexity:** O(V + E)

```
V = 35 nodes   →   O(70 × log 35) ≈ 357 operations
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
  "node_id": "N01",
  "node_name": "Port Alpha",
  "node_type": "Port",
  "capacity": 5000,
  "congestion_level": 0.3,
  "processing_time": 120,
  "status": "active",
  "lat": 22.3,
  "lng": 88.4
}
```

### Edge Properties
```json
{
  "edge_id": "E001",
  "source": "N01",
  "target": "N03",
  "distance": 12,
  "travel_time": 25,
  "cost": 180,
  "capacity": 3000,
  "congestion_weight": 1.2,
  "edge_status": "active"
}
```

### Node Types
| Type | Color | Count |
|---|---|---|
| Port | 🔵 Blue | 3 |
| Terminal | 🟣 Purple | 4 |
| Warehouse | 🟢 Green | 4 |
| Depot | 🟡 Yellow | 3 |
| Crane | 🩵 Cyan | 3 |
| Yard Block | 🟠 Orange | 4 |
| Gate | 🩷 Pink | 4 |
| Customs Point | 🔴 Red | 3 |
| Truck Hub | 🩵 Teal | 4 |
| Distribution Center | 🟢 Lime | 3 |

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
  -d '{"source": "N01", "target": "N24", "weight": "cost"}'
```

**Response:**
```json
{
  "path": ["N01", "N07", "N34", "N18", ...],
  "edges": ["E065", "E062", ...],
  "total_cost": 320.5,
  "total_distance": 19.0,
  "total_time": 38.0,
  "reachable": true,
  "path_info": [
    { "node_id": "N01", "node_name": "Port Alpha", "node_type": "Port" },
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
| react-force-graph-3d | 3D force-directed graph |
| Three.js | WebGL 3D rendering |
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
│ ⚡ Algorithm│     3D FORCE GRAPH        │  Target  ▾    │
│ ⚠ Scenario │    (interactive scene)    │  Weight  ▾    │
│            │                           │  [Run ⚡]     │
│  LEGEND    │                           │               │
│  ● Port    │                           │  Route Result │
│  ● Terminal│                           │  $320 | 19km  │
│  ...       │                           │  N01→N07→...  │
├──────────┴───────────────────────────┴───────────────┤
│  Metrics │ 35 Nodes │ 70 Edges │ $115.93 Avg │ 11.76% │  ← Bottom Bar
└──────────────────────────────────────────────────────┘
```

---

## 🎬 Phase Plan

### ✅ Phase 1 — Complete
- [x] 35-node, 70-edge cargo logistics dataset
- [x] Python FastAPI backend with REST API
- [x] Dijkstra's algorithm with congestion weights
- [x] Interactive 3D force-directed graph
- [x] Animated shortest path highlighting (particles)
- [x] Node detail inspector panel
- [x] Live metrics cards
- [x] Scenario simulation (block nodes + re-route)

### 🔲 Phase 2 — Planned
- [ ] BFS / DFS traversal and reachability analysis
- [ ] Prim's / Kruskal's minimum spanning tree
- [ ] Edge congestion simulation panel
- [ ] Algorithm comparison charts (Recharts)
- [ ] Improved animations and visual polish
- [ ] Final documentation + complexity report

---

## 📊 Network Stats (Live)

```
Total Nodes     :  35
Total Edges     :  70
Avg Edge Cost   :  $115.93
Network Density :  11.76%   (of all possible connections)
Avg Congestion  :  1.191×   (19.1% slowdown on average)
```

---

## 📚 References

- [Dijkstra's Algorithm — GeeksForGeeks](https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/)
- [react-force-graph-3d — vasturiano](https://github.com/vasturiano/react-force-graph)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Prim's MST — GeeksForGeeks](https://www.geeksforgeeks.org/prims-minimum-spanning-tree-mst-greedy-algo-5/)

---

## 👤 Author

**CargoFlow** — DAA Project  
Inspired by CargoShield logistics optimization system.  
Built with Python FastAPI + React Three.js for interactive graph visualization.

---

*"Turning complex cargo networks into beautiful, optimizable graphs."*
