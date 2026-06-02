# Scenario management helpers
# Keeps a simple in-memory state for blocked nodes and congested edges.
# The backend resets this on restart; no database needed for Phase 1.

_blocked_nodes: list = []
_congested_edges: dict = {}  # edge_id -> new congestion_weight


def get_scenario_state():
    return {
        "blocked_nodes": list(_blocked_nodes),
        "congested_edges": dict(_congested_edges),
    }


def block_node(node_id: str):
    if node_id not in _blocked_nodes:
        _blocked_nodes.append(node_id)
    return get_scenario_state()


def unblock_node(node_id: str):
    if node_id in _blocked_nodes:
        _blocked_nodes.remove(node_id)
    return get_scenario_state()


def update_edge_congestion(edge_id: str, congestion_weight: float):
    _congested_edges[edge_id] = congestion_weight
    return get_scenario_state()


def reset_scenario():
    _blocked_nodes.clear()
    _congested_edges.clear()
    return get_scenario_state()
