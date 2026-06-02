import { NODE_TYPE_COLORS, NODE_TYPE_ICONS } from '../utils/nodeColors'
import useStore from '../store/useStore'

const CONGESTION_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444']

function congestionColor(level) {
  if (level < 0.25) return CONGESTION_COLORS[0]
  if (level < 0.5)  return CONGESTION_COLORS[1]
  if (level < 0.75) return CONGESTION_COLORS[2]
  return CONGESTION_COLORS[3]
}

export default function NodeDetailPanel() {
  const { selectedNode, scenario, blockNode: doBlockNode, unblockNode: doUnblockNode } = useStore()
  const blockedSet = new Set(scenario?.blocked_nodes || [])

  if (!selectedNode) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⬡</div>
        <div>Click any node in the 3D graph to inspect its details</div>
      </div>
    )
  }

  const isBlocked = blockedSet.has(selectedNode.node_id)
  const color = NODE_TYPE_COLORS[selectedNode.node_type] || '#7a9cc4'
  const icon  = NODE_TYPE_ICONS[selectedNode.node_type] || '●'
  const congLevel = selectedNode.congestion_level || 0

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header */}
      <div className="node-detail-header">
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
            {selectedNode.node_name}
          </div>
          <div>
            <span
              className="node-type-pill"
              style={{ background: `${color}18`, border: `1px solid ${color}44`, color }}
            >
              {selectedNode.node_type}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div className={`status-dot ${isBlocked ? 'status-blocked' : 'status-active'}`}/>
          <span style={{ fontSize: 10, color: isBlocked ? 'var(--accent-red)' : 'var(--accent-green)' }}>
            {isBlocked ? 'BLOCKED' : 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* ID */}
      <div className="node-prop-row">
        <span className="node-prop-key">Node ID</span>
        <span className="node-prop-val">{selectedNode.node_id}</span>
      </div>

      {/* Capacity */}
      <div className="node-prop-row">
        <span className="node-prop-key">Capacity</span>
        <span className="node-prop-val">{selectedNode.capacity?.toLocaleString()} units</span>
      </div>

      {/* Processing time */}
      <div className="node-prop-row">
        <span className="node-prop-key">Processing Time</span>
        <span className="node-prop-val">{selectedNode.processing_time} min</span>
      </div>

      {/* Congestion */}
      <div>
        <div className="node-prop-row" style={{ borderBottom: 'none', paddingBottom: 4 }}>
          <span className="node-prop-key">Congestion Level</span>
          <span className="node-prop-val" style={{ color: congestionColor(congLevel) }}>
            {Math.round(congLevel * 100)}%
          </span>
        </div>
        <div className="congestion-bar">
          <div
            className="congestion-fill"
            style={{
              width: `${congLevel * 100}%`,
              background: congestionColor(congLevel),
              boxShadow: `0 0 6px ${congestionColor(congLevel)}`,
            }}
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="node-prop-row">
        <span className="node-prop-key">Location</span>
        <span className="node-prop-val">{selectedNode.lat}°N {selectedNode.lng}°E</span>
      </div>

      {/* Scenario action */}
      <div style={{ paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <div className="section-header">Scenario Control</div>
        {isBlocked ? (
          <button
            id="btn-unblock-node"
            className="btn btn-ghost btn-full btn-sm"
            onClick={() => doUnblockNode(selectedNode.node_id)}
          >
            ✓ Restore Node
          </button>
        ) : (
          <button
            id="btn-block-node"
            className="btn btn-danger btn-full btn-sm"
            onClick={() => doBlockNode(selectedNode.node_id)}
          >
            ✕ Block This Node
          </button>
        )}
      </div>
    </div>
  )
}
