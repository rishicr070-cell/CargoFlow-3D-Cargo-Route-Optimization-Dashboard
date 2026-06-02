import useStore from '../store/useStore'

export default function ScenarioPanel() {
  const { nodes, scenario, blockNode, unblockNode, resetScenario, dijkstraResult } = useStore()
  const blockedSet = new Set(scenario?.blocked_nodes || [])

  const activeNodes  = nodes.filter(n => !blockedSet.has(n.node_id))
  const blockedNodes = nodes.filter(n =>  blockedSet.has(n.node_id))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Status Banner */}
      {blockedSet.size > 0 ? (
        <div className="scenario-active-banner">
          ⚠ Scenario Active: {blockedSet.size} node(s) blocked
        </div>
      ) : (
        <div style={{
          background: '#10b98118',
          border: '1px solid #10b98144',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 11,
          color: 'var(--accent-green)',
        }}>
          ✓ No active scenario — all nodes operational
        </div>
      )}

      {/* Blocked Nodes */}
      {blockedNodes.length > 0 && (
        <div>
          <div className="section-header">Blocked Nodes</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {blockedNodes.map(n => (
              <div key={n.node_id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: '#ef444410',
                border: '1px solid #ef444430',
                borderRadius: 8,
                padding: '8px 12px',
              }}>
                <div className="status-dot status-blocked"/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{n.node_name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.node_type}</div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => unblockNode(n.node_id)}
                  style={{ padding: '4px 10px', fontSize: 11 }}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Block a node */}
      <div>
        <div className="section-header">Block a Node</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
          {activeNodes.map(n => (
            <div key={n.node_id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--bg-base)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '7px 12px',
            }}>
              <div className="status-dot status-active"/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{n.node_name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{n.node_type}</div>
              </div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => blockNode(n.node_id)}
                style={{ padding: '4px 10px', fontSize: 11 }}
              >
                Block
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Reset */}
      {blockedSet.size > 0 && (
        <button
          id="btn-reset-scenario"
          className="btn btn-ghost btn-full"
          onClick={resetScenario}
        >
          ↺ Reset All Scenarios
        </button>
      )}

      {/* Effect explanation */}
      {dijkstraResult && blockedSet.size > 0 && (
        <div style={{
          background: 'var(--bg-base)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: 12,
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          💡 Blocking nodes removes them from the graph. Run Dijkstra again to see how the shortest path changes.
        </div>
      )}
    </div>
  )
}
