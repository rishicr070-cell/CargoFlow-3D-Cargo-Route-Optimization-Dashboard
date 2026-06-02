import { NODE_TYPE_COLORS } from '../utils/nodeColors'
import useStore from '../store/useStore'

const WEIGHT_LABELS = {
  cost:        { label: 'Cost', unit: '₹',   color: '#3b82f6' },
  distance:    { label: 'Distance', unit: 'nm',  color: '#10b981' },
  travel_time: { label: 'Time', unit: 'hrs', color: '#f59e0b' },
}

function formatMetric(value, unit, position = 'suffix') {
  if (value === null || value === undefined) return '—'
  const formatted = Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (!unit) return formatted
  return position === 'prefix' ? `${unit}${formatted}` : `${formatted} ${unit}`
}

function buildRouteInsight(weightMode, result) {
  const wm = WEIGHT_LABELS[weightMode] || WEIGHT_LABELS.cost
  const hopCount = Math.max((result.path?.length || 1) - 1, 1)

  const averages = {
    cost: result.total_cost / hopCount,
    distance: result.total_distance / hopCount,
    travel_time: result.total_time / hopCount,
  }

  const modeLines = {
    cost: [
      'This route is the lowest-total-cost option under the current network state.',
      'It may still be longer or slower if that avoids expensive segments or surcharge-heavy hubs.',
    ],
    distance: [
      'This route is the most distance-efficient option among the connected choices.',
      'A shorter nautical path can still lose on time or cost if it crosses slower or pricier legs.',
    ],
    travel_time: [
      'This route minimizes total transit time with the current congestion profile.',
      'It can still be more expensive or longer if it avoids slower or more congested legs.',
    ],
  }

  return {
    title: `Why this route wins on ${wm.label.toLowerCase()}`,
    summary: modeLines[weightMode] || modeLines.cost,
    averages,
    note:
      'If distance, time, and cost are tightly correlated in the graph data, the same corridor can stay optimal across modes. That is a data-shape signal, not necessarily an algorithm bug.',
  }
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

  const selectedMode = dijkstraResult.weight_used || weightMode
  const wm = WEIGHT_LABELS[selectedMode] || WEIGHT_LABELS.cost
  const hopCount = Math.max((dijkstraResult.path?.length || 1) - 1, 0)
  const routeInsight = buildRouteInsight(selectedMode, dijkstraResult)

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="section-header">Route Result</div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#3b82f6' }}>
            {formatMetric(dijkstraResult.total_cost, '₹', 'prefix')}
          </div>
          <div className="stat-key">Cost</div>
        </div>
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#10b981' }}>
            {formatMetric(dijkstraResult.total_distance, 'nm')}
          </div>
          <div className="stat-key">Distance</div>
        </div>
        <div className="stat-item">
          <div className="stat-val" style={{ color: '#f59e0b' }}>
            {formatMetric(dijkstraResult.total_time, 'h')}
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
        &nbsp;·&nbsp; {hopCount} hops
      </div>

      {/* Route explanation */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.72))',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>
        <div className="section-header">{routeInsight.title}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {routeInsight.summary.map((line) => (
            <div key={line} style={{ marginBottom: 6 }}>{line}</div>
          ))}
        </div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
          <div className="stat-item">
          <div className="stat-val" style={{ color: wm.color }}>
              {formatMetric(routeInsight.averages[weightMode], wm.unit, weightMode === 'cost' ? 'prefix' : 'suffix')}
            </div>
            <div className="stat-key">Average per hop</div>
          </div>
          <div className="stat-item">
            <div className="stat-val" style={{ color: 'var(--text-primary)' }}>
              {hopCount}
            </div>
            <div className="stat-key">Transfers / legs</div>
          </div>
        </div>
        <div style={{
          fontSize: 11,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          background: 'rgba(148,163,184,0.08)',
          border: '1px solid rgba(148,163,184,0.16)',
          borderRadius: 8,
          padding: '10px 12px',
        }}>
          {routeInsight.note}
        </div>
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
