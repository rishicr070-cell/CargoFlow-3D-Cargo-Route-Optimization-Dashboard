import useStore from '../store/useStore'

const WEIGHT_OPTIONS = [
  { value: 'cost',        label: 'Total Cost (INR/TEU)' },
  { value: 'distance',    label: 'Distance (nautical miles)' },
  { value: 'travel_time', label: 'Travel Time (hours)' },
]

export default function AlgorithmControls() {
  const {
    nodes, sourceNode, targetNode, weightMode,
    setSourceNode, setTargetNode, setWeightMode,
    runDijkstra, isRunning, dijkstraResult, scenario,
  } = useStore()

  const blockedSet = new Set(scenario?.blocked_nodes || [])
  const activeNodes = nodes.filter(n => !blockedSet.has(n.node_id))

  const canRun = sourceNode && targetNode && sourceNode !== targetNode && !isRunning

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="section-header">Dijkstra Shortest Path</div>

      {/* Source */}
      <div>
        <div className="field-label">Source Node</div>
        <select
          id="select-source-node"
          className="select-field"
          value={sourceNode}
          onChange={e => setSourceNode(e.target.value)}
        >
          <option value="">— Select source —</option>
          {activeNodes.map(n => (
            <option key={n.node_id} value={n.node_id}>
              {n.node_name} ({n.node_type})
            </option>
          ))}
        </select>
      </div>

      {/* Target */}
      <div>
        <div className="field-label">Destination Node</div>
        <select
          id="select-target-node"
          className="select-field"
          value={targetNode}
          onChange={e => setTargetNode(e.target.value)}
        >
          <option value="">— Select destination —</option>
          {activeNodes
            .filter(n => n.node_id !== sourceNode)
            .map(n => (
              <option key={n.node_id} value={n.node_id}>
                {n.node_name} ({n.node_type})
              </option>
            ))}
        </select>
      </div>

      {/* Weight mode */}
      <div>
        <div className="field-label">Optimize By</div>
        <select
          id="select-weight-mode"
          className="select-field"
          value={weightMode}
          onChange={e => setWeightMode(e.target.value)}
        >
          {WEIGHT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Run */}
      <button
        id="btn-run-dijkstra"
        className="btn btn-primary btn-full"
        onClick={runDijkstra}
        disabled={!canRun}
      >
        {isRunning ? (
          <>⏳ Running…</>
        ) : (
          <>⚡ Run Dijkstra</>
        )}
      </button>

      {/* Quick swap */}
      {sourceNode && targetNode && (
        <button
          className="btn btn-ghost btn-sm btn-full"
          onClick={() => {
            const s = sourceNode, t = targetNode
            setSourceNode(t)
            setTargetNode(s)
          }}
        >
          ⇄ Swap Source & Destination
        </button>
      )}

      {/* Complexity note */}
      <div style={{
        background: 'var(--bg-base)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '10px 12px',
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Complexity</strong><br/>
        Time: O(E log V) · Space: O(V + E)<br/>
        V = 42 ports · E = 75 sea lanes
      </div>
    </div>
  )
}
