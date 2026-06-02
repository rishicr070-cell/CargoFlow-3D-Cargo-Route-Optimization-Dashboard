import json
import os
from typing import Optional

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")


def load_graph(blocked_nodes: Optional[list] = None, congested_edges: Optional[dict] = None):
    """
    Load the graph from JSON files and return nodes, edges, and adjacency list.
    blocked_nodes: list of node_ids to exclude from the graph.
    congested_edges: dict of edge_id -> new congestion_weight.
    """
    blocked_nodes = set(blocked_nodes or [])
    congested_edges = congested_edges or {}

    with open(os.path.join(DATA_DIR, "nodes.json"), encoding="utf-8") as f:
        all_nodes = json.load(f)

    with open(os.path.join(DATA_DIR, "edges.json"), encoding="utf-8") as f:
        all_edges = json.load(f)

    # Filter out blocked nodes
    nodes = [n for n in all_nodes if n["node_id"] not in blocked_nodes]
    active_ids = {n["node_id"] for n in nodes}

    # Filter edges that reference blocked nodes, apply congestion overrides
    edges = []
    for e in all_edges:
        if e["source"] in active_ids and e["target"] in active_ids:
            edge_copy = dict(e)
            if edge_copy["edge_id"] in congested_edges:
                edge_copy["congestion_weight"] = congested_edges[edge_copy["edge_id"]]
            edges.append(edge_copy)

    # Build adjacency list
    adj = {n["node_id"]: [] for n in nodes}
    for e in edges:
        adj[e["source"]].append({
            "neighbor": e["target"],
            "distance": e["distance"],
            "travel_time": e["travel_time"],
            "cost": e["cost"],
            "congestion_weight": e["congestion_weight"],
            "edge_id": e["edge_id"],
        })
        adj[e["target"]].append({
            "neighbor": e["source"],
            "distance": e["distance"],
            "travel_time": e["travel_time"],
            "cost": e["cost"],
            "congestion_weight": e["congestion_weight"],
            "edge_id": e["edge_id"],
        })

    return nodes, edges, adj


def get_node_map(nodes):
    """Return a dict mapping node_id -> node dict."""
    return {n["node_id"]: n for n in nodes}


def compute_metrics(nodes, edges):
    """Return summary metrics for the graph."""
    n = len(nodes)
    e = len(edges)
    avg_cost = round(sum(ed["cost"] for ed in edges) / e, 2) if e else 0
    max_possible_edges = n * (n - 1) / 2 if n > 1 else 1
    density = round(e / max_possible_edges, 4)
    avg_congestion = round(sum(ed["congestion_weight"] for ed in edges) / e, 3) if e else 0
    return {
        "total_nodes": n,
        "total_edges": e,
        "avg_edge_cost": avg_cost,
        "network_density": density,
        "avg_congestion": avg_congestion,
    }
