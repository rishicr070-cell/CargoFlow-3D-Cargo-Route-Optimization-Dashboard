import { create } from 'zustand'
import { getGraph, getMetrics, runDijkstra, blockNode, unblockNode, resetScenario } from '../api/client'

const useStore = create((set, get) => ({
  // ── Graph data
  nodes: [],
  edges: [],
  loading: false,
  error: null,

  // ── Selected nodes for algorithm
  sourceNode: '',
  targetNode: '',
  weightMode: 'cost',

  // ── Algorithm result
  dijkstraResult: null,
  isRunning: false,

  // ── UI state
  hoveredNode: null,
  selectedNode: null,
  activeView: 'graph',       // 'overview' | 'graph' | 'algorithm' | 'scenario'
  rightTab: 'algorithm',    // 'node' | 'algorithm'

  // ── Metrics
  metrics: null,

  // ── Scenario
  scenario: { blocked_nodes: [], congested_edges: {} },

  // ────────────────────────────────────────────
  // Actions
  // ────────────────────────────────────────────

  fetchGraph: async () => {
    set({ loading: true, error: null })
    try {
      const data = await getGraph()
      set({
        nodes: data.nodes,
        edges: data.edges,
        scenario: data.scenario,
        loading: false,
      })
    } catch (e) {
      set({ error: e.message, loading: false })
    }
  },

  fetchMetrics: async () => {
    try {
      const m = await getMetrics()
      set({ metrics: m })
    } catch (_) {}
  },

  setSourceNode: (id) => set({ sourceNode: id }),
  setTargetNode: (id) => set({ targetNode: id }),
  setWeightMode: (w) => set({ weightMode: w }),
  setHoveredNode: (node) => set({ hoveredNode: node }),
  setSelectedNode: (node) => set({ selectedNode: node, rightTab: node ? 'node' : get().rightTab }),
  setActiveView: (v) => set({ activeView: v }),
  setRightTab: (t) => set({ rightTab: t }),

  runDijkstra: async () => {
    const { sourceNode, targetNode, weightMode } = get()
    if (!sourceNode || !targetNode) return
    set({ isRunning: true, dijkstraResult: null })
    try {
      const result = await runDijkstra(sourceNode, targetNode, weightMode)
      set({ dijkstraResult: result, isRunning: false, rightTab: 'algorithm' })
    } catch (e) {
      set({ isRunning: false, error: e.message })
    }
  },

  blockNode: async (nodeId) => {
    await blockNode(nodeId)
    await get().fetchGraph()
    await get().fetchMetrics()
    // Clear result if affected
    const { dijkstraResult } = get()
    if (dijkstraResult?.path?.includes(nodeId)) {
      set({ dijkstraResult: null })
    }
  },

  unblockNode: async (nodeId) => {
    await unblockNode(nodeId)
    await get().fetchGraph()
    await get().fetchMetrics()
  },

  resetScenario: async () => {
    await resetScenario()
    await get().fetchGraph()
    await get().fetchMetrics()
    set({ dijkstraResult: null })
  },
}))

export default useStore
