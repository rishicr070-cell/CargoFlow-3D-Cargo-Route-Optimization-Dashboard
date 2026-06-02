import heapq


WEIGHT_KEYS = {
    "distance": "distance",
    "travel_time": "travel_time",
    "cost": "cost",
}


def dijkstra(adj: dict, source: str, target: str, weight: str = "cost"):
    """
    Run Dijkstra's algorithm on an adjacency list.

    Parameters
    ----------
    adj    : dict mapping node_id -> list of {neighbor, distance, travel_time, cost, congestion_weight, edge_id}
    source : starting node_id
    target : ending node_id
    weight : one of "distance", "travel_time", "cost"

    Returns
    -------
    dict with keys:
        path        : list of node_ids from source to target (empty if unreachable)
        edges       : list of edge_ids on the shortest path
        total_cost  : total weight along the path
        total_distance : total distance
        total_time  : total travel_time
        reachable   : bool
    """
    if source not in adj or target not in adj:
        return _unreachable()

    wkey = WEIGHT_KEYS.get(weight, "cost")

    # dist[node] = best cumulative weight found
    dist = {node: float("inf") for node in adj}
    dist[source] = 0

    # prev[node] = (prev_node, edge_id, distance, travel_time, cost)
    prev = {node: None for node in adj}

    # Min-heap: (weight, node_id)
    heap = [(0, source)]

    visited = set()

    while heap:
        current_dist, u = heapq.heappop(heap)
        if u in visited:
            continue
        visited.add(u)

        if u == target:
            break

        for neighbor_info in adj.get(u, []):
            v = neighbor_info["neighbor"]
            if v in visited:
                continue
            # Effective weight = base weight * congestion multiplier
            w = neighbor_info[wkey] * neighbor_info["congestion_weight"]
            new_dist = current_dist + w
            if new_dist < dist[v]:
                dist[v] = new_dist
                prev[v] = (u, neighbor_info["edge_id"],
                            neighbor_info["distance"],
                            neighbor_info["travel_time"],
                            neighbor_info["cost"])
                heapq.heappush(heap, (new_dist, v))

    if dist[target] == float("inf"):
        return _unreachable()

    # Reconstruct path
    path = []
    edge_ids = []
    total_distance = 0.0
    total_time = 0.0
    total_cost = 0.0

    node = target
    while node is not None:
        path.append(node)
        if prev[node] is not None:
            p_node, e_id, d, t, c = prev[node]
            edge_ids.append(e_id)
            total_distance += d
            total_time += t
            total_cost += c
        node = prev[node][0] if prev[node] else None

    path.reverse()
    edge_ids.reverse()

    return {
        "path": path,
        "edges": edge_ids,
        "total_cost": round(total_cost, 2),
        "total_distance": round(total_distance, 2),
        "total_time": round(total_time, 2),
        "reachable": True,
    }


def _unreachable():
    return {
        "path": [],
        "edges": [],
        "total_cost": None,
        "total_distance": None,
        "total_time": None,
        "reachable": False,
    }
