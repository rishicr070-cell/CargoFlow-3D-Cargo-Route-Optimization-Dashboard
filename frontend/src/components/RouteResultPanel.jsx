import { NODE_TYPE_COLORS } from '../utils/nodeColors'
import useStore from '../store/useStore'

const WEIGHT_LABELS = {
  cost:        { label: 'Cost', unit: '$',   color: '#3b82f6' },
  distance:    { label: 'Distance', unit: 'km',  color: '#10b981' },
  travel_time: { label: 'Time', unit: 'min', color: '#f59e0b' },
}

export default function RouteResultPanel() {
  const { dijkstraResult, weightMode, isRunning } = useStore()

  if (isRunning) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="section-header">Route Result</div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="loading-shimmer" style={{ height: 36 }} />
        ))}
      </div>
    )
  }

  if (!dijkstraResult) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚡</div>
        <div>Select a source and destination, then run Dijkstra to see the shortest path</div>
      </div>
    )
  }

  if (!dijkstraResult.reachable) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div className="section-header">Route Result</div>
        <div style={{
          background: '#ef444418',
          border: '1px solid #ef444444',
          borderRadius: 8,
          padding: '12px',
          color: 'var(--accent-red)',
          fontSize: 12,
          textAlign: 'center',
        }}>
          ✕ No path found between selected nodes.
          <br/>
          <span style={{ color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
            The nodes may be disconnected or blocked.
          </span>
        </div>
      </div>
    )
  }

  const wm = WEIGHT_LABELS[weightMode] || WEIGHT_LABELS.cost

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="section-header">Route Result</div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#3b82f6' }}>
            ${dijkstraResult.total_cost}
          </div>
          <div className="stat-key">Cost</div>
        </div>
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#10b981' }}>
            {dijkstraResult.total_distance}
            <span style={{ fontSize: 10 }}>km</span>
          </div>
          <div className="stat-key">Distance</div>
        </div>
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#f59e0b' }}>
            {dijkstraResult.total_time}
            <span style={{ fontSize: 10 }}>m</span>
          </div>
          <div className="stat-key">Time</div>
        </div>
      </div>

      {/* Optimized by badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        color: wm.color,
        background: `${wm.color}18`,
        border: `1px solid ${wm.color}44`,
        borderRadius: 6,
        padding: '5px 10px',
      }}>
        ⚡ Optimized by: <strong>{wm.label}</strong>
        &nbsp;·&nbsp; {dijkstraResult.path.length} hops
      </div>

      {/* Path sequence */}
      <div className="section-header">Path Sequence</div>
      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
        {dijkstraResult.path_info.map((node, i) => {
          const color = NODE_TYPE_COLORS[node.node_type] || '#7a9cc4'
          const isFirst = i === 0
          const isLast  = i === dijkstraResult.path_info.length - 1
          return (
            <div key={node.node_id}>
              <div className="path-node">
                <div
                  className="path-node-dot"
                  style={{
                    background: isFirst ? '#10b981' : isLast ? '#f59e0b' : color,
                    boxShadow: `0 0 8px ${isFirst ? '#10b981' : isLast ? '#f59e0b' : color}`,
                    width: isFirst || isLast ? 12 : 8,
                    height: isFirst || isLast ? 12 : 8,
                  }}
                />
                <div>
                  <div className="path-node-name">
                    {isFirst && <span style={{ color: '#10b981', marginRight: 4 }}>START</span>}
                    {isLast  && <span style={{ color: '#f59e0b', marginRight: 4 }}>END</span>}
                    {node.node_name}
                  </div>
                  <div className="path-node-type">{node.node_type} · {node.node_id}</div>
                </div>
              </div>
              {i < dijkstraResult.path_info.length - 1 && (
                <div style={{
                  marginLeft: 4,
                  paddingLeft: 3,
                  borderLeft: '1px dashed #1e3a5f',
                  height: 14,
                  marginBottom: 0,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
