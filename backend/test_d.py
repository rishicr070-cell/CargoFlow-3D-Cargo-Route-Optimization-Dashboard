import sys
import os

# add backend to path
sys.path.append(r"d:\Projects\Cargoshield DAA\backend")

from algorithms.dijkstra import dijkstra

adj = {
    "A": [{"neighbor": "B", "distance": 10, "travel_time": 10, "cost": 10, "congestion_weight": 1.0, "edge_id": "e1"}]
}

try:
    res = dijkstra(adj, "A", "B")
    print(res)
except Exception as e:
    import traceback
    traceback.print_exc()
