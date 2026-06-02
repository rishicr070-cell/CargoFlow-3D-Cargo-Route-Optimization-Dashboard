from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from graph import load_graph, get_node_map, compute_metrics
from algorithms.dijkstra import dijkstra
from algorithms.scenario import (
    get_scenario_state, block_node, unblock_node,
    update_edge_congestion, reset_scenario
)

app = FastAPI(title="CargoFlow API", version="1.0.0")

# Allow frontend (Vite dev server) to call this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# Pydantic request models
# ──────────────────────────────────────────────

class DijkstraRequest(BaseModel):
    source: str
    target: str
    weight: Optional[str] = "cost"   # "cost" | "distance" | "travel_time"


class BlockNodeRequest(BaseModel):
    node_id: str


class UnblockNodeRequest(BaseModel):
    node_id: str


class UpdateEdgeRequest(BaseModel):
    edge_id: str
    congestion_weight: float


# ──────────────────────────────────────────────
# Helper: load graph with current scenario state
# ──────────────────────────────────────────────

def _load_current_graph():
    state = get_scenario_state()
    return load_graph(
        blocked_nodes=state["blocked_nodes"],
        congested_edges=state["congested_edges"],
    )


# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────

@app.get("/graph")
def get_graph():
    """Return all nodes and edges (respecting current scenario)."""
    nodes, edges, _ = _load_current_graph()
    scenario = get_scenario_state()
    return {
        "nodes": nodes,
        "edges": edges,
        "scenario": scenario,
    }


@app.get("/node/{node_id}")
def get_node(node_id: str):
    """Return details for a single node."""
    nodes, _, _ = _load_current_graph()
    node_map = get_node_map(nodes)
    if node_id not in node_map:
        raise HTTPException(status_code=404, detail=f"Node {node_id} not found")
    return node_map[node_id]


@app.get("/metrics")
def get_metrics():
    """Return summary graph metrics."""
    nodes, edges, _ = _load_current_graph()
    return compute_metrics(nodes, edges)


@app.post("/algorithm/dijkstra")
def run_dijkstra(req: DijkstraRequest):
    """Run Dijkstra's shortest path algorithm."""
    nodes, edges, adj = _load_current_graph()
    if req.source not in adj:
        raise HTTPException(status_code=404, detail=f"Source node {req.source} not found or blocked")
    if req.target not in adj:
        raise HTTPException(status_code=404, detail=f"Target node {req.target} not found or blocked")

    result = dijkstra(adj, req.source, req.target, req.weight)
    node_map = get_node_map(nodes)

    # Enrich path with node names
    path_info = [
        {"node_id": nid, "node_name": node_map[nid]["node_name"], "node_type": node_map[nid]["node_type"]}
        for nid in result["path"]
        if nid in node_map
    ]

    return {
        **result,
        "path_info": path_info,
        "weight_used": req.weight,
        "source": req.source,
        "target": req.target,
    }


@app.post("/scenario/block-node")
def scenario_block_node(req: BlockNodeRequest):
    """Block a node (simulate failure/congestion)."""
    state = block_node(req.node_id)
    nodes, edges, _ = _load_current_graph()
    return {
        "message": f"Node {req.node_id} blocked",
        "scenario": state,
        "node_count": len(nodes),
        "edge_count": len(edges),
    }


@app.post("/scenario/unblock-node")
def scenario_unblock_node(req: UnblockNodeRequest):
    """Unblock a previously blocked node."""
    state = unblock_node(req.node_id)
    return {"message": f"Node {req.node_id} unblocked", "scenario": state}


@app.post("/scenario/update-edge")
def scenario_update_edge(req: UpdateEdgeRequest):
    """Simulate congestion on an edge by updating its congestion weight."""
    state = update_edge_congestion(req.edge_id, req.congestion_weight)
    return {"message": f"Edge {req.edge_id} congestion set to {req.congestion_weight}", "scenario": state}


@app.post("/scenario/reset")
def scenario_reset():
    """Reset all scenario modifications."""
    state = reset_scenario()
    return {"message": "Scenario reset", "scenario": state}


@app.get("/scenario")
def get_current_scenario():
    """Return the current scenario state."""
    return get_scenario_state()


@app.get("/")
def root():
    return {"message": "CargoFlow API is running", "docs": "/docs"}
